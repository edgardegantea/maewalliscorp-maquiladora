#!/usr/bin/env bash
# =============================================================================
# seed.sh — Migra y siembra la base de datos en el VPS
#
# Ejecutar desde tu Mac:
#   bash deploy/seed.sh
#
# O directamente en el servidor:
#   bash seed.sh
#
# Opciones:
#   --fresh      Elimina todas las tablas y vuelve a migrar antes de sembrar
#   --only-seed  Solo ejecuta el seeder (las tablas ya existen)
# =============================================================================
set -euo pipefail

VPS_USER="deployer"
VPS_HOST="74.208.177.68"
APP_DIR="/var/www/maquiladora-back/current"

MODE="${1:-}"

info() { echo -e "\n\033[1;34m━━━ $* ━━━\033[0m"; }
ok()   { echo -e "  \033[0;32m✓\033[0m $*"; }

# ── Detectar si estamos en local o en el servidor ────────────────────────────
if [[ "$(hostname)" != *"$VPS_HOST"* ]] && [[ "${REMOTE:-}" != "1" ]]; then
  # Ejecutar este mismo script en el servidor vía SSH
  info "Conectando al VPS y ejecutando seed remoto"
  ssh "${VPS_USER}@${VPS_HOST}" \
    "REMOTE=1 bash -s -- ${MODE}" < "$0"
  exit 0
fi

# ── A partir de aquí corre EN el servidor ────────────────────────────────────
cd "$APP_DIR"

case "$MODE" in
  --fresh)
    info "Migrate:fresh + seed (¡BORRA TODOS LOS DATOS!)"
    read -r -p "  ¿Confirmas? Escribe 'sí' para continuar: " confirm
    [[ "$confirm" == "sí" ]] || { echo "Cancelado."; exit 0; }
    php artisan migrate:fresh --seed --force
    ;;
  --only-seed)
    info "Solo seeder (las tablas ya existen)"
    php artisan db:seed --force
    ;;
  *)
    info "Migrar + sembrar (sin borrar tablas existentes)"
    php artisan migrate --force
    php artisan db:seed --force
    ;;
esac

ok "Listo"
