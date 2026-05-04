# 🛒 E-Commerce Spring Boot & Angular

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![MySQL/PostgreSQL/SQLServer](https://img.shields.io/badge/Database-Relational-4479A1?style=for-the-badge&logo=database&logoColor=white)

Este proyecto es una plataforma completa de comercio electrónico (E-Commerce) desarrollada con una arquitectura Cliente-Servidor (Frontend y Backend separados).

## 🚀 Tecnologías Utilizadas

### Backend (`/ecom`)
El backend está construido con **Java 21** y el framework **Spring Boot**. Expone una API RESTful para manejar toda la lógica de negocio de la tienda.

* **Spring Boot (Web, Data JPA, Security)**: Core de la aplicación, acceso a datos y seguridad.
* **JWT (JSON Web Tokens)**: Implementado para manejar la autenticación y autorización segura de los usuarios.
* **Lombok**: Para reducir el código repetitivo en las clases modelo y servicios (getters, setters, constructores).
* **Bases de Datos Compatibles**: Configurado con drivers para múltiples motores como **MySQL**, **PostgreSQL** y **SQL Server**.

### Frontend (`/EcommerceWeb`)
La interfaz de usuario está construida con **Angular v19** para proporcionar una experiencia interactiva y fluida (SPA - Single Page Application).

* **Angular Material**: Para componentes de interfaz de usuario limpios y profesionales.
* **SSR (Server-Side Rendering)**: Preparado para renderizado del lado del servidor.

---

## 📂 Estructura del Proyecto

El proyecto está dividido en dos directorios principales:

```text
E-Commerce-SpringBoot/
│
├── ecom/                   # 🟢 BACKEND (API REST - Spring Boot)
│   ├── src/main/java/      # Código fuente Java (Controllers, Services, Repositories, Entities)
│   ├── src/main/resources/ # Propiedades de configuración (application.properties/yml)
│   └── pom.xml             # Dependencias de Maven
│
└── EcommerceWeb/           # 🔴 FRONTEND (Angular)
    ├── src/app/            # Componentes, servicios y vistas de Angular
    ├── package.json        # Dependencias de npm
    └── angular.json        # Configuración del proyecto Angular
```

---

## ⚙️ Cómo Ejecutar el Proyecto

### 1. Iniciar el Backend (Spring Boot)
1. Asegúrate de tener **Java 21** y **Maven** instalados.
2. Navega al directorio del backend:
   ```bash
   cd ecom
   ```
3. Configura las credenciales de tu base de datos en el archivo `application.properties` o `application.yml` dentro de `ecom/src/main/resources`.
4. Ejecuta el servidor:
   ```bash
   mvn spring-boot:run
   ```
   *La API estará corriendo por defecto en `http://localhost:8080`.*

### 2. Iniciar el Frontend (Angular)
1. Asegúrate de tener **Node.js** (v18+) instalado.
2. Navega al directorio del frontend:
   ```bash
   cd EcommerceWeb
   ```
3. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```
   *La aplicación estará disponible en `http://localhost:4200`.*

---

## 🔒 Características Principales

* **Autenticación y Autorización**: Sistema seguro usando JWT.
* **Gestión de Productos**: Añadir, visualizar y listar productos.
* **Gestión de Categorías**: Organización de productos por categorías.
* **Panel de Administración**: Endpoints específicos protegidos (como vemos en `AdminProductService`) para administrar el catálogo.
