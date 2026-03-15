<div align="center">
  
  # Band Manager
  
  ### Sistema de Gestión Integral para Bandas Musicales
  
  [![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/) [![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/) [![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?logo=react)](https://reactnative.dev/) [![Express.js](https://img.shields.io/badge/Express.js-5.1.0-000000?logo=express)](https://expressjs.com/) [![Expo](https://img.shields.io/badge/Expo-~54.0.13-000020?logo=expo)](https://expo.dev/)
  <br>

</div>

---

## 📋 Índice

- [📖 Acerca del Proyecto](#-acerca-del-proyecto)
- [✨ Características](#-características)
- [🛠️ Tecnologías](#-tecnologías)
- [📐 Arquitectura](#-arquitectura)
- [⚙️ Prerequisitos](#-prerequisitos)
- [🚀 Instalación](#-instalación)
- [📂 Estructura del Proyecto](#-estructura-del-proyecto)
- [📄 Licencia](#-licencia)
- [👨‍💻 Autor](#-autor)

---

## 📖 Acerca del Proyecto

**Band Manager** es una aplicación móvil completa diseñada para facilitar la gestión integral de bandas musicales. Permite a directores, músicos y administradores coordinar ensayos, actuaciones, gestionar la asistencia de los miembros, y mantener un registro detallado de los instrumentos y niveles de cada músico. Además, la aplicación facilita la **contratación de músicos externos** para eventos específicos, permitiendo gestionar acuerdos y condiciones de colaboración de manera eficiente.

### 🎯 Objetivo

Proporcionar una plataforma centralizada que simplifique la administración de bandas musicales, mejorando la comunicación, organización y seguimiento de eventos y miembros, así como la gestión de contratos con músicos externos para actuaciones y eventos especiales.

---

## ✨ Características

### 👥 Gestión de Músicos
- ✅ Registro y perfiles detallados de músicos
- ✅ Asociación de instrumentos con niveles de competencia
- ✅ Gestión de múltiples instrumentos por músico
- ✅ Niveles: Aficionado, Aficionado Profesional, Enseñanzas Básicas, Título Profesional, Título Superior

### 🎸 Gestión de Bandas
- ✅ Creación y administración de bandas
- ✅ Sistema de códigos únicos para unirse a bandas
- ✅ Gestión de componentes (músicos dentro de bandas)
- ✅ Fotos de perfil para bandas
- ✅ Información de contacto y ubicación

### 📅 Gestión de Eventos
- ✅ Programación de ensayos y actuaciones
- ✅ Sistema de asistencia con confirmación
- ✅ Registro de ausencias justificadas
- ✅ Notificaciones de próximos eventos
- ✅ Historial completo de eventos

### 🎼 Sistema de Asistencia
- ✅ Control de asistencia por evento
- ✅ Marcado de presencia/ausencia
- ✅ Justificación de ausencias
- ✅ Estadísticas de asistencia

### 📑 Gestión de Contratos
- ✅ Contratación de músicos externos para eventos
- ✅ Definición de términos y condiciones de colaboración
- ✅ Gestión de acuerdos por actuación
- ✅ Registro de honorarios y detalles del contrato
- ✅ Seguimiento del estado de los contratos

### 🔐 Autenticación y Seguridad
- ✅ Sistema de registro e inicio de sesión
- ✅ Autenticación con tokens (Bearer)
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Roles de usuario (Admin/Miembro)

### 📸 Gestión de Multimedia
- ✅ Subida de imágenes de perfil
- ✅ Almacenamiento en Cloudinary
- ✅ Optimización automática de imágenes

---

## 🛠️ Tecnologías

### Backend
<div align="center">

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) | - | Runtime de JavaScript |
| ![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white) | 5.1.0 | Framework web |
| ![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?logo=sequelize&logoColor=white) | 6.37.7 | ORM para base de datos |
| ![MariaDB](https://img.shields.io/badge/MariaDB-003545?logo=mariadb&logoColor=white) | 3.4.5 | Base de datos relacional |
| ![Passport](https://img.shields.io/badge/Passport-34E27A?logo=passport&logoColor=white) | 0.7.0 | Autenticación |
| ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=white) | 2.7.0 | Almacenamiento de imágenes |

</div>

**Dependencias adicionales:**
- `bcryptjs` - Encriptación de contraseñas
- `express-validator` - Validación de datos
- `multer` - Manejo de archivos
- `cors` - Políticas de intercambio de recursos
- `morgan` - Logging HTTP
- `dotenv` - Variables de entorno

### Frontend
<div align="center">

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| ![React Native](https://img.shields.io/badge/React_Native-61DAFB?logo=react&logoColor=black) | 0.81.4 | Framework móvil |
| ![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white) | ~54.0.13 | Plataforma de desarrollo |
| ![React Navigation](https://img.shields.io/badge/React_Navigation-6B48FF?logo=react&logoColor=white) | 7.x | Navegación |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white) | 1.12.2 | Cliente HTTP |
| ![Formik](https://img.shields.io/badge/Formik-2563EB) | 2.4.6 | Gestión de formularios |
| ![Yup](https://img.shields.io/badge/Yup-10B981) | 1.7.1 | Validación de esquemas |

</div>

**Dependencias adicionales:**
- `@gorhom/bottom-sheet` - Componentes de bottom sheet
- `expo-image-picker` - Selector de imágenes
- `date-fns` - Manejo de fechas
- `react-native-gesture-handler` - Gestos táctiles
- `react-native-reanimated` - Animaciones

---

## 📐 Arquitectura

El proyecto sigue una arquitectura **Cliente-Servidor** con separación clara entre frontend y backend:

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE (Mobile)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         React Native + Expo Application                │ │
│  │  ┌──────────────────┐  ┌──────────────────────────┐   │ │
│  │  │  UI Components   │  │   Navigation Stack      │   │ │
│  │  │  - Screens       │  │   - Auth Flow           │   │ │
│  │  │  - Components    │  │   - App Flow            │   │ │
│  │  └──────────────────┘  └──────────────────────────┘   │ │
│  │  ┌──────────────────┐  ┌──────────────────────────┐   │ │
│  │  │  State Mgmt      │  │   API Integration       │   │ │
│  │  │  - Contexts      │  │   - Endpoints           │   │ │
│  │  │  - Auth Context  │  │   - Error Handling      │   │ │
│  │  └──────────────────┘  └──────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ▼
                         HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Backend)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Express.js REST API Server                  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │   Routes     │→ │ Controllers  │→ │   Models    │ │ │
│  │  │  - Band      │  │  - Band      │  │   - Band    │ │ │
│  │  │  - Musician  │  │  - Musician  │  │   - Musician│ │ │
│  │  │  - Event     │  │  - Event     │  │   - Event   │ │ │
│  │  │  - User      │  │  - User      │  │   - User    │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  │  ┌──────────────┐  ┌──────────────┐                  │ │
│  │  │ Middleware   │  │ Validations  │                  │ │
│  │  │  - Auth      │  │  - Schemas   │                  │ │
│  │  │  - Files     │  │  - Rules     │                  │ │
│  │  └──────────────┘  └──────────────┘                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ▼
              ┌──────────────────────────────┐
              │   Sequelize ORM              │
              └──────────────────────────────┘
                              ▼
              ┌──────────────────────────────┐
              │   MariaDB / MySQL Database   │
              └──────────────────────────────┘
```

### Patrón MVC (Model-View-Controller)

El backend implementa el patrón arquitectónico MVC:

- **Models**: Definición de esquemas y relaciones de base de datos (Sequelize)
- **Views**: Respuestas JSON (REST API)
- **Controllers**: Lógica de negocio y procesamiento de peticiones

---

## ⚙️ Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

### Para el Backend
- **Node.js** (v14.0.0 o superior)
- **npm** o **yarn**
- **MariaDB** o **MySQL** (v5.7 o superior)
- **Git**

### Para el Frontend
- **Node.js** (v14.0.0 o superior)
- **npm** o **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go** app en tu dispositivo móvil (iOS o Android)
- **Android Studio** (para emulador Android) o **Xcode** (para simulador iOS)

### Cuentas de Terceros
- Cuenta de **Cloudinary** (para almacenamiento de imágenes)

---

## 🚀 Instalación

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/ManunGar/Band-Manager.git
cd Band-Manager
```

### 2️⃣ Configurar el Backend

#### Instalar Dependencias
```bash
cd backend
npm install
```

#### Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# Configuración del Servidor
APP_PORT=3030
NODE_ENV=development

# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=band_manager
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_DIALECT=mariadb

# Cloudinary (Almacenamiento de Imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Seguridad
JWT_SECRET=tu_secreto_super_seguro_aqui
```

#### Configurar la Base de Datos

```bash
# Crear y migrar la base de datos
npm run migrate

# Opcional: Poblar con datos de ejemplo
npm run seed
```

#### Iniciar el Servidor

```bash
# Modo desarrollo (con auto-reload)
npm run start-dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3030`

### 3️⃣ Configurar el Frontend

#### Instalar Dependencias
```bash
cd ../frontend
npm install
```

#### Configurar la URL del Backend

Crea o edita el archivo de configuración de API en `frontend/api/` para apuntar a tu servidor backend:
Crea un archivo `.env.development` para apuntar al servidor backend:

```env
EXPO_PUBLIC_API_URL = http://localhost:3030 # O tu IP local para dispositivos físicos
```

> **Nota**: Si usas un dispositivo físico, reemplaza `localhost` con la IP local de tu computadora (ej: `http://192.168.1.100:3030`)

#### Iniciar la Aplicación

```bash
npm start
```

Esto abrirá el Metro Bundler de Expo. Puedes:
- Presionar `a` para abrir en Android
- Presionar `i` para abrir en iOS
- Escanear el código QR con la app **Expo Go** en tu dispositivo móvil

---

## 📂 Estructura del Proyecto

```
Band-Manager/
│
├── backend/                    # Servidor Node.js
│   ├── src/
│   │   ├── config/            # Configuraciones (DB, Passport)
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── database/          # Migraciones y seeders
│   │   ├── middleware/        # Middlewares personalizados
│   │   ├── models/            # Modelos Sequelize
│   │   ├── routes/            # Definición de rutas
│   │   ├── validations/       # Validaciones de datos
│   │   ├── app.js             # Configuración de Express
│   │   └── index.js           # Punto de entrada
│   ├── public/                # Archivos estáticos
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # Aplicación React Native
│   ├── api/                   # Integraciones con API
│   ├── assets/                # Recursos (imágenes, fuentes)
│   ├── components/            # Componentes reutilizables
│   ├── contexts/              # Context API (estado global)
│   ├── helpers/               # Funciones auxiliares
│   ├── screens/               # Pantallas de la app
│   │   ├── app/              # Pantallas principales
│   │   └── auth/             # Pantallas de autenticación
│   ├── App.js                 # Componente raíz
│   ├── GlobalStyle.js         # Estilos globales
│   └── package.json
│
├── doc/                        # Documentación
│   ├── icon/                  # Iconos del proyecto
│   └── UML/                   # Diagramas UML
│
└── README.md                   # Este archivo
```

---

## 📄 Licencia

Este proyecto está licenciado bajo la **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)**.

### ¿Qué significa esto?

✅ **Puedes:**
- Usar el código para proyectos personales, educativos o de investigación
- Modificar y adaptar el código
- Compartir el código original o modificado

❌ **No puedes:**
- Usar el código con fines comerciales sin permiso explícito
- Distribuir versiones modificadas bajo una licencia diferente

📄 **Atribución requerida:**
- Debes dar crédito apropiado al autor original
- Debes indicar si se realizaron cambios
- Debes mantener el aviso de licencia

Para más detalles, consulta el archivo [LICENSE](LICENSE) o visita [https://creativecommons.org/licenses/by-nc-sa/4.0/](https://creativecommons.org/licenses/by-nc-sa/4.0/)

---

## 👨‍💻 Autor

**ManunGar**

- GitHub: [@ManunGar](https://github.com/ManunGar)
- Proyecto: [Band Manager](https://github.com/ManunGar/Band-Manager)

---

<div align="center">
  
  ### ⭐ Si este proyecto te ha sido útil, considera darle una estrella!
  
  **Hecho con ❤️ para la comunidad musical**

</div>
