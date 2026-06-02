#!/usr/bin/env bash
# =============================================================================
# frontend_upload.sh  —  Build local + subida del dist al VPS
# Ejecutar desde tu Mac, en la raíz del proyecto:
#
#   bash deploy/frontend_upload.sh
#
# Requisito: tener acceso SSH a deployer@74.208.177.68
# =============================================================================
set -euo pipefail

VPS_USER="deployer"
VPS_HOST="74.208.177.68"
VPS_DIR="/var/www/maquiladora-front"
FRONTEND_DIR="$(cd "$(dirname "$0")/../frontend" && pwd)"

info()  { echo -e "\n\033[1;34m━━━ $* ━━━\033[0m"; }
ok()    { echo -e "  \033[0;32m✓\033[0m $*"; }
die()   { echo -e "\n\033[0;31m✗ $*\033[0m" >&2; exit 1; }

# ── 1. Verificar que estamos en la carpeta correcta ───────────────────────────
[[ -f "${FRONTEND_DIR}/package.json" ]] || die "No se encontró frontend/package.json"

# ── 2. Build de producción ────────────────────────────────────────────────────
info "Build de producción (Vite)"
cd "$FRONTEND_DIR"
npm run build
ok "dist/ generado"

# ── 3. Verificar que dist existe y tiene index.html ───────────────────────────
[[ -f "${FRONTEND_DIR}/dist/index.html" ]] || die "dist/index.html no encontrado — el build falló"

# ── 4. Subir al VPS con rsync ─────────────────────────────────────────────────
info "Subiendo dist/ → ${VPS_USER}@${VPS_HOST}:${VPS_DIR}"
rsync -avz --delete \
  --checksum \
  "${FRONTEND_DIR}/dist/" \
  "${VPS_USER}@${VPS_HOST}:${VPS_DIR}/"
ok "Archivos subidos"

# ── 5. Recargar Nginx en el VPS (opcional, solo para limpiar caché de proxy) ──
info "Reload Nginx en el VPS"
ssh "${VPS_USER}@${VPS_HOST}" "sudo systemctl reload nginx"
ok "Nginx recargado"

echo ""
echo "🚀  Frontend en línea: https://maquiladora.maewalliscorp.org"
