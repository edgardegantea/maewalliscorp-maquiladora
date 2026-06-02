#!/usr/bin/env bash
# =============================================================================
# 02_deploy.sh  —  Deploy del BACKEND (Laravel) en el VPS
# Ejecutar como deployer@74.208.177.68
#
# El frontend se sube desde la Mac con deploy/frontend_upload.sh
#
# USO:
#   Primera vez:  bash 02_deploy.sh --setup
#   Actualizaciones: bash 02_deploy.sh
# =============================================================================
set -euo pipefail

REPO="git@github.com:TU_ORG/maquiladora.git"   # ← cambia por tu repo
BRANCH="main"

BACK_BASE="/var/www/maquiladora-back"
BACK_SHARED="${BACK_BASE}/shared"
BACK_RELEASES="${BACK_BASE}/releases"

RELEASE=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="${BACK_RELEASES}/${RELEASE}"
KEEP_RELEASES=5

info() { echo -e "\n\033[1;34m━━━ $* ━━━\033[0m"; }
ok()   { echo -e "  \033[0;32m✓\033[0m $*"; }

# =============================================================================
# PRIMERA EJECUCIÓN: Nginx + SSL + .env
# =============================================================================
if [[ "${1:-}" == "--setup" ]]; then

  info "Copiar configuraciones Nginx"
  sudo cp nginx_backend.conf  /etc/nginx/sites-available/maquiladora-back
  sudo cp nginx_frontend.conf /etc/nginx/sites-available/maquiladora-front
  sudo ln -sf /etc/nginx/sites-available/maquiladora-back  /etc/nginx/sites-enabled/
  sudo ln -sf /etc/nginx/sites-available/maquiladora-front /etc/nginx/sites-enabled/
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t && sudo systemctl reload nginx
  ok "Nginx configurado"

  info "Obtener certificados SSL (Let's Encrypt)"
  sudo certbot --nginx \
    -d maquiladoraback.maewalliscorp.org \
    -d maquiladora.maewalliscorp.org \
    --non-interactive --agree-tos -m tu@email.com   # ← cambia el email
  ok "SSL listo"

  info "Crear .env de producción del backend"
  cat > "${BACK_SHARED}/.env" <<'DOTENV'
APP_NAME=Maquiladora
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://maquiladoraback.maewalliscorp.org
FRONTEND_URL=https://maquiladora.maewalliscorp.org

LOG_CHANNEL=daily
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=maquiladora_db
DB_USERNAME=maquiladora
DB_PASSWORD=CAMBIA_ESTA_CONTRASEÑA_DB

JWT_SECRET=
JWT_TTL=1440

MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@maewalliscorp.org
MAIL_FROM_NAME=Maquiladora

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
DOTENV
  chmod 600 "${BACK_SHARED}/.env"
  ok ".env creado — EDÍTALO: nano ${BACK_SHARED}/.env"
  echo ""
  echo "⚠  1. Edita el .env con credenciales reales"
  echo "   2. Ejecuta: bash 02_deploy.sh"
  exit 0
fi

# =============================================================================
# DEPLOY NORMAL (solo backend)
# =============================================================================

info "Clonar repositorio → ${RELEASE_DIR}"
git clone --depth 1 --branch "${BRANCH}" "${REPO}" "${RELEASE_DIR}"
ok "Código clonado"

info "Backend: composer install"
cd "${RELEASE_DIR}/backend"
composer install --no-dev --optimize-autoloader --quiet
ok "Composer listo"

info "Enlazar shared/.env y storage"
ln -sf "${BACK_SHARED}/.env"     "${RELEASE_DIR}/backend/.env"
rm -rf "${RELEASE_DIR}/backend/storage"
ln -sf "${BACK_SHARED}/storage"  "${RELEASE_DIR}/backend/storage"
ok "Symlinks creados"

info "Laravel: optimizar"
cd "${RELEASE_DIR}/backend"
php artisan key:generate --no-interaction --force 2>/dev/null || true
php artisan config:cache --quiet
php artisan route:cache  --quiet
php artisan view:cache   --quiet
ok "Caché generada"

info "Migraciones"
php artisan migrate --force --quiet
ok "Migraciones aplicadas"

info "Activar release ${RELEASE}"
ln -sfn "${RELEASE_DIR}" "${BACK_BASE}/current"
ok "Symlink ${BACK_BASE}/current → ${RELEASE_DIR}"

info "Reiniciar PHP-FPM y Nginx"
sudo systemctl restart php8.3-fpm
sudo systemctl reload  nginx
ok "Servicios reiniciados"

info "Limpiar releases antiguas (mantener ${KEEP_RELEASES})"
ls -1dt "${BACK_RELEASES}"/20* | tail -n +$((KEEP_RELEASES + 1)) | xargs rm -rf --
ok "Limpieza hecha"

echo ""
echo "✅  Backend desplegado: https://maquiladoraback.maewalliscorp.org"
echo "    Sube el frontend desde tu Mac con: bash deploy/frontend_upload.sh"
