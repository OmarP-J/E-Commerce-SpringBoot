#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Instalación del backend Esencial en una VM de Oracle Cloud (Always Free).
# Probado sobre imágenes Ubuntu 22.04 / 24.04 y Oracle Linux 8 / 9.
#
#   curl -fsSL <url-de-este-script> -o setup.sh
#   chmod +x setup.sh && ./setup.sh
#
# El script es idempotente: puedes volver a correrlo sin romper nada.
# ---------------------------------------------------------------------------
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/OmarP-J/E-Commerce-SpringBoot.git}"
APP_DIR="${APP_DIR:-$HOME/esencial}"
DEPLOY_DIR="$APP_DIR/deploy/oracle"

log()  { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
warn() { printf '\n\033[1;33m!!\033[0m %s\n' "$*"; }
die()  { printf '\n\033[1;31mxx\033[0m %s\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] && die "No lo corras como root. Usa el usuario normal (ubuntu / opc); el script llama a sudo cuando hace falta."

# --- 1. Detectar la distribución --------------------------------------------
. /etc/os-release
log "Sistema detectado: $PRETTY_NAME"

# --- 2. Instalar Docker ------------------------------------------------------
if command -v docker >/dev/null 2>&1; then
  log "Docker ya está instalado, lo salto."
else
  log "Instalando Docker..."
  case "$ID" in
    ubuntu|debian)
      sudo apt-get update -y
      sudo apt-get install -y ca-certificates curl git
      sudo install -m 0755 -d /etc/apt/keyrings
      sudo curl -fsSL "https://download.docker.com/linux/$ID/gpg" -o /etc/apt/keyrings/docker.asc
      sudo chmod a+r /etc/apt/keyrings/docker.asc
      echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/$ID $VERSION_CODENAME stable" \
        | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
      sudo apt-get update -y
      sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
      ;;
    ol|rhel|centos|almalinux|rocky)
      sudo dnf install -y dnf-utils git
      sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
      sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
      ;;
    *) die "Distribución no contemplada ($ID). Instala Docker a mano y vuelve a correr el script." ;;
  esac
  sudo systemctl enable --now docker
fi

# Permitir usar docker sin sudo.
if ! id -nG "$USER" | grep -qw docker; then
  log "Agregando $USER al grupo docker..."
  sudo usermod -aG docker "$USER"
  NEEDS_RELOGIN=1
fi

# --- 3. Abrir los puertos 80 y 443 ------------------------------------------
# OJO: las imágenes de Oracle Cloud traen reglas locales que bloquean todo
# menos el 22, aunque la Security List de la consola ya permita el tráfico.
# Este es el paso que más gente olvida.
log "Abriendo los puertos 80 y 443 en el firewall local..."
if command -v firewall-cmd >/dev/null 2>&1 && sudo systemctl is-active --quiet firewalld; then
  sudo firewall-cmd --permanent --add-service=http
  sudo firewall-cmd --permanent --add-service=https
  sudo firewall-cmd --reload
else
  for port in 80 443; do
    if ! sudo iptables -C INPUT -p tcp --dport "$port" -j ACCEPT 2>/dev/null; then
      sudo iptables -I INPUT 1 -p tcp --dport "$port" -m conntrack --ctstate NEW -j ACCEPT
    fi
  done
  if command -v netfilter-persistent >/dev/null 2>&1; then
    sudo netfilter-persistent save
  else
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y iptables-persistent || true
    sudo netfilter-persistent save || warn "No pude persistir las reglas de iptables; revísalas si reinicias la VM."
  fi
fi

# --- 4. Traer el código ------------------------------------------------------
if [[ -d "$APP_DIR/.git" ]]; then
  log "El repositorio ya existe, actualizando..."
  git -C "$APP_DIR" pull --ff-only
else
  log "Clonando el repositorio..."
  git clone --depth 1 "$REPO_URL" "$APP_DIR"
fi

cd "$DEPLOY_DIR"

# --- 5. Configuración --------------------------------------------------------
if [[ ! -f .env ]]; then
  cp .env.example .env
  warn "Se creó $DEPLOY_DIR/.env a partir de la plantilla."
  warn "Edítalo AHORA con tus valores reales y vuelve a correr este script:"
  warn "    nano $DEPLOY_DIR/.env"
  exit 0
fi

# Validar que no queden variables obligatorias vacías.
missing=()
for var in SITE_ADDRESS DB_URL DB_USERNAME DB_PASSWORD JWT_SECRET CLIENT_ORIGIN; do
  value="$(grep -E "^${var}=" .env | cut -d= -f2- || true)"
  [[ -z "$value" ]] && missing+=("$var")
done
if [[ ${#missing[@]} -gt 0 ]]; then
  die "Faltan valores en $DEPLOY_DIR/.env: ${missing[*]}"
fi

# --- 6. Levantar todo --------------------------------------------------------
DC="docker compose"
if [[ -n "${NEEDS_RELOGIN:-}" ]]; then
  DC="sudo docker compose"
  warn "Usaré sudo esta vez. Cierra sesión y vuelve a entrar para usar docker sin sudo."
fi

log "Construyendo la imagen (la primera vez tarda varios minutos: descarga Maven y las dependencias)..."
$DC build

log "Levantando los contenedores..."
$DC up -d

log "Listo. Comandos útiles:"
cat <<EOF

  Ver los logs del backend:     cd $DEPLOY_DIR && docker compose logs -f api
  Ver los logs de Caddy/HTTPS:  cd $DEPLOY_DIR && docker compose logs -f caddy
  Reiniciar:                    cd $DEPLOY_DIR && docker compose restart
  Actualizar tras un push:      cd $APP_DIR && git pull && cd $DEPLOY_DIR && docker compose up -d --build

  El arranque de Spring Boot tarda ~1-2 minutos la primera vez.
  Cuando termine, comprueba:    curl https://\$(grep ^SITE_ADDRESS= .env | cut -d= -f2)/actuator/health

EOF
