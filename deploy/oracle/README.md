# Desplegar el backend en Oracle Cloud (Always Free)

Guía para mover la API de Spring Boot de Render a una máquina virtual gratuita
de Oracle Cloud. El resultado: **sin arranque en frío** (la VM nunca se apaga),
**$0 al mes**, e **IP pública fija** — que es justo lo que necesita el firewall
de Azure SQL.

| | Render (hoy) | Oracle Always Free |
|---|---|---|
| Costo | $0 | $0 |
| Arranque en frío | ~150 s tras 15 min inactivo | ninguno |
| IP de salida | rangos compartidos | una IP fija tuya |
| Recursos | 512 MB / 0.1 vCPU | hasta 12 GB / 2 OCPU |

---

## 1. Crear la cuenta y la máquina

1. Entra a [cloud.oracle.com](https://cloud.oracle.com) y crea una cuenta.
   Pide una tarjeta **solo para verificar identidad**: mientras te quedes en
   recursos "Always Free" no genera cargos, y la cuenta no pasa a de pago sola
   (tú tienes que aceptar el upgrade explícitamente).
2. En la consola: **Compute → Instances → Create instance**.
3. Configura:
   - **Image**: Canonical Ubuntu 24.04 (o 22.04).
   - **Shape**: `VM.Standard.A1.Flex` con **2 OCPU y 12 GB de RAM**.
     Tiene que decir *Always Free eligible*.
   - **Networking**: deja que cree la VCN por defecto y marca
     **Assign a public IPv4 address**.
   - **SSH keys**: *Generate a key pair for me* y **descarga la llave privada**
     (solo se puede descargar en ese momento).
4. Crea la instancia y apunta la **IP pública** que aparece cuando quede
   en estado *Running*.

> **Si sale "Out of capacity"** para la forma A1 (pasa seguido, es la más
> pedida): prueba otro dominio de disponibilidad, o vuelve a intentar más
> tarde. Como último recurso sirve `VM.Standard.E2.1.Micro`, pero con 1 GB de
> RAM hay que añadirle swap antes de construir la imagen:
> `sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`

## 2. Abrir los puertos en la consola de Oracle

En la instancia → **Virtual Cloud Network → Security Lists → Default Security
List → Add Ingress Rules**, agrega dos reglas:

| Source CIDR | Protocolo | Puerto destino |
|---|---|---|
| `0.0.0.0/0` | TCP | `80` |
| `0.0.0.0/0` | TCP | `443` |

(El script del paso 4 se encarga del firewall *dentro* de la VM, que es un
segundo candado independiente y la causa número uno de "no me carga el sitio".)

## 3. Autorizar la IP de la VM en Azure SQL

**Haz esto antes de arrancar la aplicación**, o fallará al conectar igual que
pasó la primera vez con Render.

Azure Portal → `esencial-ecommerce-sql` → **Redes** → Reglas de firewall →
agrega una regla nueva:

- Nombre: `oracle-vm`
- IP inicial y final: **la IP pública de tu VM** (la misma en ambos campos)

Guarda. Las reglas de Render (`74.220.50.0`–`74.220.50.255` y
`74.220.58.0`–`74.220.58.255`) déjalas por ahora: así el backend viejo sigue
funcionando hasta que confirmes que el nuevo anda bien.

## 4. Instalar todo en la VM

Conéctate por SSH (en Windows, con la llave descargada):

```bash
ssh -i C:\ruta\a\tu-llave.key ubuntu@LA-IP-DE-TU-VM
```

Y dentro de la VM:

```bash
curl -fsSL https://raw.githubusercontent.com/OmarP-J/E-Commerce-SpringBoot/main/deploy/oracle/setup.sh -o setup.sh
chmod +x setup.sh
./setup.sh
```

La primera corrida instala Docker, abre los puertos internos, clona el repo y
se detiene pidiéndote que rellenes la configuración.

## 5. Rellenar el `.env`

```bash
nano ~/esencial/deploy/oracle/.env
```

De dónde sale cada valor:

| Variable | De dónde la sacas |
|---|---|
| `SITE_ADDRESS` | Tu dominio, o `sslip.io` con la IP y guiones: IP `140.238.170.12` → `140-238-170-12.sslip.io` |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Render → tu servicio → **Environment**, cópialas tal cual |
| `JWT_SECRET` | El **mismo** valor de Render (si lo cambias, se cierran todas las sesiones abiertas) |
| `CLIENT_ORIGIN` | `https://esencial-tienda.vercel.app` |

Guarda (Ctrl+O, Enter, Ctrl+X) y vuelve a correr el script:

```bash
./setup.sh
```

Ahora sí construye la imagen y levanta los contenedores. La primera
construcción tarda varios minutos porque descarga Maven y las dependencias.

## 6. Verificar

```bash
cd ~/esencial/deploy/oracle
docker compose logs -f api
```

Espera a ver `Started EcomApplication in ... seconds`. Entonces, desde tu PC:

```
https://TU-SITE-ADDRESS/actuator/health
```

Debe responder `{"status":"UP"}` — y con candado de HTTPS válido, porque Caddy
pide el certificado de Let's Encrypt automáticamente al arrancar.

Si el certificado falla, casi siempre es que el puerto 80 no está abierto
(Let's Encrypt lo necesita para validar): revisa el paso 2 y mira
`docker compose logs caddy`.

## 7. Apuntar el frontend al backend nuevo

En `EcommerceWeb/vercel.json`, cambia el destino del rewrite:

```json
{ "source": "/api/(.*)", "destination": "https://TU-SITE-ADDRESS/api/$1" }
```

Haz push a `main`; Vercel redespliega solo. Entra a
`https://esencial-tienda.vercel.app`, revisa que el catálogo cargue y prueba
iniciar sesión.

## 8. Limpieza (cuando ya confirmaste que todo anda)

1. Suspende o borra el servicio de Render.
2. Borra `.github/workflows/keep-alive.yml`: ya no hace falta mantener nada
   despierto, y seguiría haciendo ping a una URL muerta.
3. Quita del firewall de Azure SQL las dos reglas de Render.

## Mantenimiento

```bash
# Actualizar tras un push a main
cd ~/esencial && git pull && cd deploy/oracle && docker compose up -d --build

# Ver logs / reiniciar
docker compose logs -f api
docker compose restart
```

Los contenedores tienen `restart: always`, así que vuelven solos si la VM se
reinicia.
