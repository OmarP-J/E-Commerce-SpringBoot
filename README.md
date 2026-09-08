# Ecommerce con Spring Boot y Angular

Tienda de demostración completa para aprender un flujo de comercio electrónico. Incluye catálogo, cuentas con cuatro roles, favoritos, carrito, direcciones, cupones, compra simulada, pedidos, inventario auditable, atención al cliente y administración general.

> **Aviso:** el pago es totalmente simulado. La aplicación no solicita datos de tarjeta, no se conecta con un banco o pasarela y no realiza cobros reales.

## Tecnologías y requisitos

- Java JDK 21.
- Node.js 20 LTS o 22 y npm.
- No es necesario instalar Maven: el backend incluye Maven Wrapper.
- SQL Server solo es necesario para el perfil de producción. El modo local usa una base H2 incluida en el proyecto.

Puedes comprobar las instalaciones desde PowerShell:

```powershell
java -version
node --version
npm --version
```

## Ejecutar el proyecto en local

Abre dos terminales. En la primera inicia el backend:

```powershell
cd ecom
.\mvnw.cmd spring-boot:run
```

El servidor queda disponible en `http://127.0.0.1:8080`. En modo local usa H2 y guarda los datos en `ecom/data`, de modo que no se pierden al reiniciar.

En la segunda terminal inicia Angular:

```powershell
cd EcommerceWeb
npm ci
npm start
```

Abre `http://localhost:4200`. El servidor de desarrollo de Angular redirige automáticamente las solicitudes `/api` al backend.

La página inicial es una landing pública. Desde **Ya tengo una cuenta** o **Ingresar** se abre una pantalla de acceso independiente; al completar el login, un cliente entra al catálogo y un administrador entra al panel de control. Cada producto, sección administrativa y estado vacío usa una ruta real, por lo que los botones de navegación también funcionan al volver atrás o recargar la página.

La primera ejecución crea datos de demostración:

| Uso | Correo | Contraseña |
| --- | --- | --- |
| Administrador local | `admin@demo.local` | `AdminDemo2026!` |
| Gestor de inventario | `inventario@demo.local` | `InventarioDemo2026!` |
| Soporte al cliente | `soporte@demo.local` | `SoporteDemo2026!` |

No se crea un cliente con contraseña conocida. Usa **Crear cuenta** para registrar uno. También se crean cuatro productos, la categoría **Esenciales** y el cupón `BIENVENIDA10`, con 10 % de descuento. Estos datos solo se crean con el perfil `dev`; nunca se crean con el perfil de producción.

Si ya ejecutaste una versión anterior y quieres una demostración desde cero, detén el backend y elimina manualmente la carpeta `ecom/data`. Esto borra todas las cuentas, productos y pedidos locales.

## Recorrido recomendado

Como cliente:

1. Crea una cuenta e inicia sesión.
2. Busca productos, filtra por categoría y guarda favoritos.
3. Añade productos al carrito y cambia sus cantidades.
4. Aplica `BIENVENIDA10` y comprueba el descuento.
5. Confirma que aceptas el pago simulado, indica dirección y teléfono y crea el pedido.
6. Consulta el pedido en **Mis pedidos** y actualiza tu nombre o contraseña en **Mi cuenta**.
7. Guarda direcciones de entrega y abre solicitudes de devolución, cambio, reembolso o reclamo.

Como administrador:

1. Inicia sesión con la cuenta de demostración.
2. Crea o edita categorías, productos y cupones.
3. Ajusta precio, costo, inventario y disponibilidad, y sube imágenes PNG o JPEG de hasta 2 MB y 16 megapíxeles.
4. Consulta los pedidos y avanza su estado.
5. Asigna roles a los usuarios del sistema y configura el nombre, correo de soporte y nivel de alerta de stock.
6. Revisa ventas, ganancia estimada, pedido promedio, reembolsos y productos con pocas existencias.

Como gestor de inventario:

1. Inicia sesión con `inventario@demo.local`.
2. Busca un producto y registra una entrada, salida o conteo físico.
3. Consulta los productos agotados o con pocas unidades.
4. Revisa quién hizo cada movimiento y por qué. Las compras, cancelaciones y ajustes administrativos también aparecen en el historial.

Como soporte al cliente:

1. Inicia sesión con `soporte@demo.local`.
2. Consulta cualquier pedido y sus datos de entrega.
3. Abre una solicitud recibida, escribe la resolución y cambia su estado.
4. Registra un reembolso total o parcial simulado sin superar el total pagado.

Las páginas administrativas están separadas para que sean más fáciles de entender y mantener:

| Página | Ruta |
| --- | --- |
| Resumen | `/admin` |
| Productos | `/admin/products` |
| Categorías | `/admin/categories` |
| Cupones | `/admin/coupons` |
| Pedidos | `/admin/orders` |
| Usuarios y permisos | `/admin/users` |
| Configuración | `/admin/settings` |
| Inventario | `/inventory` |
| Centro de soporte | `/support` |

Los estados válidos de un pedido siguen este flujo:

```text
CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED
     |            |
     +------------+-> CANCELLED
```

Cancelar un pedido repone el inventario una sola vez. Un pedido enviado ya no se puede cancelar.

## Funciones principales

| Área | Funciones |
| --- | --- |
| Seguridad | Registro, inicio de sesión con JWT, contraseñas BCrypt, sesiones de una hora y autorización real por roles en el servidor. |
| Catálogo | Búsqueda sin distinguir mayúsculas ni tildes en nombre, descripción y categoría; filtro, paginación, detalle, inventario e imágenes. |
| Cliente | Perfil, direcciones, favoritos, carrito privado, cupones, compra, seguimiento de pedidos y solicitudes de ayuda. |
| Compra | Totales calculados en el backend, redondeo monetario, descuento validado, control de existencias y protección contra compras repetidas. |
| Administración | Productos, categorías, cupones, imágenes, pedidos, usuarios, permisos, configuración, ventas, costos, ganancia estimada y estadísticas. |
| Inventario | Alertas configurables, entradas, salidas, conteos físicos e historial auditable de todos los cambios de stock. |
| Soporte | Consulta global de pedidos, devoluciones, cambios, reclamos y reembolsos simulados totales o parciales. |
| Integridad | Bloqueos al comprar para evitar sobreventa, copia de precio y costo dentro del pedido, límites de reembolso y restauración de inventario al cancelar. |

## API

Todas las rutas parten de `/api`. Cliente usa `CUSTOMER`; Administración usa `ADMIN`; Inventario acepta `ADMIN` o `INVENTORY_MANAGER`; y Soporte acepta `ADMIN` o `CUSTOMER_SUPPORT`. El frontend envía el token como `Authorization: Bearer <token>`.

### Acceso y cuenta

| Método | Ruta | Uso |
| --- | --- | --- |
| `POST` | `/auth/signup` | Registrar un cliente. |
| `POST` | `/auth/login` | Iniciar sesión y recibir el JWT. |
| `GET` | `/me` | Consultar el usuario autenticado. |
| `PUT` | `/me` | Cambiar el nombre. |
| `PUT` | `/me/password` | Cambiar la contraseña comprobando la actual. |

### Catálogo público

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/catalog/products?q=&categoryId=&page=0&size=12` | Buscar y paginar productos activos. El tamaño máximo es 48. |
| `GET` | `/catalog/products/{id}` | Consultar un producto activo. |
| `GET` | `/catalog/products/{id}/image` | Descargar su imagen. |
| `GET` | `/catalog/categories` | Listar categorías. |

### Cliente

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/customer/cart` | Consultar el carrito y sus totales. |
| `PUT` | `/customer/cart/items/{productId}` | Fijar la cantidad; una cantidad `0` elimina la línea. |
| `PUT` | `/customer/cart/coupon` | Aplicar un cupón. |
| `DELETE` | `/customer/cart/coupon` | Retirar el cupón. |
| `POST` | `/customer/checkout` | Crear un pedido con dirección, teléfono, aceptación del pago simulado y un `requestId` UUID único. |
| `GET` | `/customer/orders` | Consultar los pedidos del cliente autenticado. |
| `GET` / `POST` | `/customer/addresses` | Listar o guardar direcciones de entrega. |
| `PUT` / `DELETE` | `/customer/addresses/{id}` | Editar o eliminar una dirección propia. |
| `GET` / `POST` | `/customer/support-cases` | Consultar o crear solicitudes de ayuda sobre pedidos propios. |
| `GET` | `/customer/wishlist` | Consultar favoritos. |
| `PUT` / `DELETE` | `/customer/wishlist/{productId}` | Añadir o retirar un favorito. |

`requestId` hace que repetir accidentalmente la misma solicitud de compra devuelva el mismo pedido en lugar de descontar dos veces el inventario.

### Administración

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` / `POST` | `/admin/products` | Listar todo el catálogo o crear un producto. |
| `PUT` / `DELETE` | `/admin/products/{id}` | Editar o archivar un producto. Archivar lo oculta del catálogo. |
| `POST` | `/admin/products/{id}/image` | Subir la imagen mediante el campo multipart `file`. |
| `POST` | `/admin/categories` | Crear una categoría. |
| `PUT` / `DELETE` | `/admin/categories/{id}` | Editar o eliminar una categoría sin productos asociados. |
| `GET` / `POST` | `/admin/coupons` | Listar o crear cupones. |
| `PUT` | `/admin/coupons/{id}` | Editar o desactivar un cupón. |
| `GET` | `/admin/orders` | Listar todos los pedidos. |
| `PUT` | `/admin/orders/{id}/status` | Cambiar el estado respetando el flujo permitido. |
| `GET` | `/admin/analytics` | Consultar pedidos, clientes, catálogo, inventario bajo y ventas simuladas. |
| `GET` | `/admin/users` | Listar usuarios sin exponer contraseñas. |
| `PUT` | `/admin/users/{id}/role` | Asignar Cliente, Administrador, Inventario o Soporte. |
| `GET` / `PUT` | `/admin/settings` | Consultar o editar la configuración general. |

### Inventario

Las rutas `/inventory` aceptan los roles `ADMIN` e `INVENTORY_MANAGER`.

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/inventory/products` | Buscar productos activos e inactivos. |
| `GET` | `/inventory/low-stock` | Consultar alertas según la configuración de la tienda. |
| `GET` | `/inventory/movements` | Ver los últimos 100 movimientos auditados. |
| `POST` | `/inventory/products/{id}/stock` | Registrar entrada, salida o conteo físico. |

### Soporte al cliente

Las rutas `/support` aceptan los roles `ADMIN` y `CUSTOMER_SUPPORT`.

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/support/orders` | Consultar todos los pedidos. |
| `GET` | `/support/cases` | Consultar todas las solicitudes de clientes. |
| `PUT` | `/support/cases/{id}` | Cambiar estado, responder y registrar un reembolso simulado. |

## Estructura para orientarse en el código

```text
completed-project/
├── ecom/                         Backend Spring Boot
│   ├── src/main/java/com/codeshift/ecom/
│   │   ├── api/                  Controladores, solicitudes y respuestas HTTP
│   │   ├── config/               Datos locales de demostración
│   │   ├── model/                Entidades de la base de datos
│   │   ├── repository/           Consultas y acceso a datos
│   │   ├── security/             JWT, filtro y reglas por rol
│   │   └── service/              Reglas del negocio y transacciones
│   ├── src/main/resources/       Configuración local y de producción
│   └── src/test/                 Pruebas de integración
└── EcommerceWeb/                 Frontend Angular
    └── src/app/
        ├── core/                 API, sesión, modelos y comportamiento compartido
        └── pages/                Catálogo, acceso, carrito, pedidos, cuenta y administración
```

La regla más útil para leer el backend es: el controlador recibe la solicitud, el servicio aplica las reglas, el repositorio habla con la base de datos y `Views` decide qué información se devuelve. Las entidades nunca se exponen directamente, por lo que una respuesta no puede filtrar por accidente el hash de una contraseña.

Con el backend iniciado en modo local, la documentación interactiva de la API está disponible en `http://127.0.0.1:8080/swagger-ui.html` y su descripción OpenAPI en `http://127.0.0.1:8080/v3/api-docs`. Ambas se desactivan automáticamente con el perfil de producción.

## Ejecutar las pruebas

Pruebas del backend:

```powershell
cd ecom
.\mvnw.cmd test
```

Las dieciséis pruebas de integración usan una base H2 temporal y comprueban permisos de los cuatro roles, asignación de permisos, privacidad de direcciones y pedidos, casos de soporte, reembolsos, auditoría de inventario, búsqueda sin tildes, cupones, redondeo, compra idempotente, validaciones, favoritos, perfil, cambios de estado, reposición al cancelar, compras simultáneas sin sobreventa y disponibilidad de la documentación OpenAPI.

Compilación del frontend:

```powershell
cd EcommerceWeb
npm ci
npm run build
```

Antes de entregar una versión, ejecuta ambos comandos y prueba manualmente un recorrido de cliente y otro de administrador.

## Configurar SQL Server para producción

El perfil `prod` no crea cuentas demo y toma toda la configuración sensible de variables de entorno. Crea primero una base de datos vacía llamada, por ejemplo, `ecommerce`, y un usuario con acceso únicamente a esa base. El primer administrador se puede crear de forma segura durante el arranque mediante variables temporales; el registro público siempre crea clientes y nunca permite elegir un rol.

La configuración de producción usa `ddl-auto=validate`: el backend comprueba el esquema y se detiene si falta una tabla o columna. Antes del primer arranque, ejecuta [database/sqlserver-schema.sql](database/sqlserver-schema.sql) en la base vacía con una cuenta autorizada para crear tablas. Después inicia la aplicación con un usuario limitado a leer y modificar los datos de esa base. Conserva el script bajo control de versiones y añade migraciones numeradas cuando el modelo cambie.

Ejemplo para PowerShell. Sustituye todos los valores de ejemplo:

```powershell
cd ecom

$env:SPRING_PROFILES_ACTIVE = "prod"
$env:DB_URL = "jdbc:sqlserver://sql.example.com:1433;databaseName=ecommerce;encrypt=true;trustServerCertificate=false"
$env:DB_USERNAME = "ecommerce_app"
$env:DB_PASSWORD = "CAMBIAR_POR_UN_SECRETO"
$env:CLIENT_ORIGIN = "https://tienda.example.com"
$env:APP_ADMIN_EMAIL = "admin@tienda.example.com"
$env:APP_ADMIN_PASSWORD = "CAMBIAR_POR_UNA_CONTRASEÑA_LARGA"
$env:APP_ADMIN_NAME = "Administración"

$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)

.\mvnw.cmd spring-boot:run
```

`APP_ADMIN_EMAIL` y `APP_ADMIN_PASSWORD` deben definirse juntas. La contraseña inicial debe tener al menos 12 caracteres y como máximo 72 bytes. El arranque crea la cuenta solo si el correo todavía no existe; nunca asciende una cuenta cliente ni cambia la contraseña de un administrador existente. Después del primer inicio correcto, retira las tres variables `APP_ADMIN_*` del entorno y administra la contraseña desde **Mi cuenta**.

`JWT_SECRET` debe ser Base64 válido y representar al menos 32 bytes aleatorios. Si cambia, todas las sesiones existentes dejan de ser válidas. Guárdalo junto con `DB_PASSWORD` en el gestor de secretos del entorno de despliegue; no lo escribas en archivos del repositorio, capturas, mensajes o imágenes del contenedor.

Para publicar Angular:

```powershell
cd EcommerceWeb
npm ci
npm run build
```

Sirve el contenido generado en `EcommerceWeb/dist/ecommerce-web/browser` desde un servidor web y redirige `/api` al backend. Usa HTTPS y configura `CLIENT_ORIGIN` con el origen exacto del frontend, incluido el protocolo y el puerto si corresponde. El archivo `proxy.conf.json` sirve únicamente para desarrollo local.

## Alcance del pago

El checkout pide confirmación explícita de que el pago es simulado y guarda el estado `SIMULATED`. Al cancelar, pasa a `SIMULATED_CANCELLED`; Soporte puede registrar `SIMULATED_REFUNDED` o `SIMULATED_PARTIAL_REFUND`. El total se registra y aparece en las métricas, pero no se recopilan datos financieros ni se mueve dinero real.

Para aceptar pagos reales todavía sería necesario integrar una pasarela, crear el pago en el servidor, validar webhooks firmados, manejar reintentos y reembolsos, proteger credenciales, definir impuestos y moneda, y adaptar el flujo legal y operativo. No cambies solo el texto `SIMULATED`: hacerlo no convierte este proyecto en un sistema de pagos real.
