#!/usr/bin/env bash
# =============================================================================
# 01_server_setup.sh
# Configuración inicial del VPS — ejecutar UNA SOLA VEZ como root
# Ubuntu 24.04 · PHP 8.3 · MySQL 8 · Node 22 · Nginx · Certbot
# =============================================================================
set -euo pipefail

DEPLOYER_USER="deployer"
DB_NAME="maquiladora_db"
DB_USER="maquiladora"
# ⚠  Cambia esta contraseña antes de ejecutar
DB_PASS="CAMBIA_ESTA_CONTRASEÑA_DB"

echo "━━━ 1. Actualizar sistema ━━━"
apt-get update -qq && apt-get upgrade -y -qq

echo "━━━ 2. Instalar dependencias base ━━━"
apt-get install -y -qq \
  curl wget git unzip software-properties-common \
  ca-certificates gnupg lsb-release ufw

echo "━━━ 3. PHP 8.3 + extensiones Laravel ━━━"
add-apt-repository -y ppa:ondrej/php
apt-get update -qq
apt-get install -y -qq \
  php8.3 php8.3-fpm php8.3-cli \
  php8.3-mysql php8.3-mbstring php8.3-xml php8.3-bcmath \
  php8.3-curl php8.3-zip php8.3-intl php8.3-opcache

echo "━━━ 4. Composer ━━━"
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

echo "━━━ 5. Node 22 (LTS) vía NodeSource ━━━"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y -qq nodejs

echo "━━━ 6. Nginx ━━━"
apt-get install -y -qq nginx

echo "━━━ 7. MySQL 8 ━━━"
apt-get install -y -qq mysql-server
mysql -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
echo "  ✓ Base de datos '${DB_NAME}' y usuario '${DB_USER}' creados"

echo "━━━ 8. Certbot (Let's Encrypt) ━━━"
apt-get install -y -qq certbot python3-certbot-nginx

echo "━━━ 9. Directorios de despliegue ━━━"
mkdir -p /var/www/maquiladora-back/releases
mkdir -p /var/www/maquiladora-back/shared/storage/{app,logs,framework/{cache,sessions,views}}
mkdir -p /var/www/maquiladora-front

chown -R "${DEPLOYER_USER}:${DEPLOYER_USER}" /var/www/maquiladora-back
chown -R "${DEPLOYER_USER}:${DEPLOYER_USER}" /var/www/maquiladora-front
chown -R www-data:www-data /var/www/maquiladora-back/shared/storage

echo "━━━ 10. Permisos sudo mínimos para deployer ━━━"
cat > /etc/sudoers.d/deployer <<'SUDO'
deployer ALL=(ALL) NOPASSWD: /bin/systemctl restart php8.3-fpm
deployer ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
deployer ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx
SUDO
chmod 440 /etc/sudoers.d/deployer

echo "━━━ 11. Firewall ━━━"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "━━━ 12. PHP-FPM: ajustar usuario de pool ━━━"
sed -i "s/^user = www-data/user = ${DEPLOYER_USER}/" /etc/php/8.3/fpm/pool.d/www.conf
sed -i "s/^group = www-data/group = ${DEPLOYER_USER}/" /etc/php/8.3/fpm/pool.d/www.conf
systemctl restart php8.3-fpm

echo ""
echo "✅  Servidor listo. Próximo paso: ejecutar 02_deploy.sh como deployer"
echo "   Guarda estas credenciales en tu gestor de contraseñas:"
echo "   DB_USER=${DB_USER}  DB_PASS=${DB_PASS}  DB_NAME=${DB_NAME}"
