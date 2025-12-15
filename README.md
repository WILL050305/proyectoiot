# 🌱 Sistema de Riego Inteligente IoT

Sistema completo de monitoreo y control de riego automático para plantas, desarrollado con React + Firebase + ESP32. Permite gestionar múltiples sensores de humedad, asignar plantas específicas a cada sensor, visualizar consumo de agua y generar reportes detallados.

![React](https://img.shields.io/badge/React-19.2.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-12.6.0-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.17-cyan)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación Paso a Paso](#-instalación-paso-a-paso)
- [Configuración de Firebase](#-configuración-de-firebase)
- [Uso de la Aplicación](#-uso-de-la-aplicación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Hardware (ESP32)](#-hardware-esp32)
- [Solución de Problemas](#-solución-de-problemas)

---

## ✨ Características

### 🎯 Funcionalidades Principales

- **Monitoreo en Tiempo Real**: Visualiza la humedad de tus plantas en tiempo real
- **CRUD de Plantas**: Crea, edita y elimina plantas con sus niveles de humedad recomendados
- **Asignación Inteligente**: Asigna plantas específicas a cada sensor (sensor1, sensor2)
- **Control de Riego**: Activa/desactiva el riego de forma manual o automática
- **Consumo de Agua**: Calcula y muestra el consumo diario de agua (1.67 L/min)
- **Reportes Completos**: Genera reportes filtrables y exportables a Excel
- **Historial Detallado**: Registra todos los eventos del sistema con timestamps

### 🏗️ Arquitectura

- **Patrón MVC**: Models, Views, Controllers separados
- **Context API**: Estado global centralizado
- **Firebase Realtime Database**: Base de datos en tiempo real
- **Autenticación Automática**: Login automático con Firebase Auth
- **Responsive Design**: Interfaz adaptable a móviles y tablets

---

## 🛠️ Tecnologías

- **Frontend**: React 19.2.0 + Vite
- **Estilos**: Tailwind CSS 4.1.17
- **Base de Datos**: Firebase Realtime Database
- **Autenticación**: Firebase Authentication
- **Gráficos**: Recharts 3.4.1
- **Exportación**: xlsx (Excel)
- **Hardware**: ESP32 + Sensores de humedad

---

## 📦 Requisitos Previos

Antes de empezar, necesitas tener instalado:

1. **Node.js** (versión 16 o superior)
   - Descarga desde: https://nodejs.org/
   - Verifica la instalación: `node --version`

2. **Git** (opcional, para clonar el repositorio)
   - Descarga desde: https://git-scm.com/

3. **Una cuenta de Firebase** (gratuita)
   - Crea una cuenta en: https://firebase.google.com/

4. **Un editor de código** (recomendado)
   - Visual Studio Code: https://code.visualstudio.com/

---

## 🚀 Instalación Paso a Paso

### Paso 1: Descargar el Proyecto

**Opción A: Con Git (recomendado)**
```bash
git clone https://github.com/WILL050305/proyectoiot.git
cd proyectoiot
```

**Opción B: Descarga ZIP**
1. Ve a https://github.com/WILL050305/proyectoiot
2. Haz clic en el botón verde "Code"
3. Selecciona "Download ZIP"
4. Extrae el archivo ZIP
5. Abre la carpeta en tu terminal/CMD

### Paso 2: Instalar Dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Esto instalará todas las librerías necesarias (React, Firebase, Tailwind, etc.)

⏱️ **Tiempo estimado**: 2-3 minutos

### Paso 3: Configurar Variables de Entorno

El proyecto ya viene configurado con Firebase. Si quieres usar tu propia base de datos:

1. Ve a la carpeta `src/firebase/`
2. Abre el archivo `config.js`
3. Reemplaza las credenciales con las tuyas (ver siguiente sección)

---

## 🔥 Configuración de Firebase

### Para Usuarios Sin Experiencia

Si no tienes experiencia con bases de datos, **puedes usar la configuración existente** que ya está en el proyecto. El sistema funcionará inmediatamente.

### Para Crear Tu Propia Base de Datos

#### 1️⃣ Crear Proyecto en Firebase

1. Ve a https://console.firebase.google.com/
2. Haz clic en "Agregar proyecto"
3. Nombra tu proyecto (ejemplo: "sistema-riego")
4. Desactiva Google Analytics (opcional)
5. Haz clic en "Crear proyecto"

#### 2️⃣ Configurar Realtime Database

1. En el menú lateral, ve a "Realtime Database"
2. Haz clic en "Crear base de datos"
3. Selecciona ubicación (ejemplo: us-central1)
4. Selecciona "Modo de prueba" por ahora
5. Haz clic en "Habilitar"

#### 3️⃣ Configurar Reglas de Seguridad

En la pestaña "Reglas", pega esto:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

Haz clic en "Publicar"

#### 4️⃣ Habilitar Autenticación

1. Ve a "Authentication" en el menú
2. Haz clic en "Comenzar"
3. Selecciona "Correo electrónico/contraseña"
4. Activa la primera opción
5. Guarda

#### 5️⃣ Crear Usuario

1. Ve a la pestaña "Users"
2. Haz clic en "Agregar usuario"
3. Ingresa un correo y contraseña
4. Guarda las credenciales

#### 6️⃣ Obtener Credenciales

1. Ve a "Configuración del proyecto" (ícono de engranaje)
2. Baja hasta "Tus apps"
3. Haz clic en el ícono web `</>`
4. Registra la app
5. Copia las credenciales que aparecen

#### 7️⃣ Actualizar config.js

Abre `src/firebase/config.js` y reemplaza:

```javascript
const firebaseConfig = {
  apiKey: "TU-API-KEY-AQUI",
  authDomain: "TU-AUTH-DOMAIN.firebaseapp.com",
  databaseURL: "https://TU-DATABASE.firebaseio.com",
  projectId: "TU-PROJECT-ID",
  storageBucket: "TU-BUCKET.appspot.com",
  messagingSenderId: "TU-SENDER-ID",
  appId: "TU-APP-ID"
};
```

#### 8️⃣ Actualizar AuthService.js

Abre `src/services/AuthService.js` y cambia las credenciales:

```javascript
const result = await signInWithEmailAndPassword(
  auth,
  'tu-email@ejemplo.com',  // Tu correo de Firebase
  'tu-contraseña'          // Tu contraseña de Firebase
);
```

#### 9️⃣ Importar Datos Iniciales (Opcional)

Si quieres usar los datos de ejemplo:

1. Ve a tu Realtime Database en Firebase
2. Haz clic en los tres puntos (⋮)
3. Selecciona "Importar JSON"
4. Sube el archivo `BD.json` que está en la raíz del proyecto

---

## 🎮 Uso de la Aplicación

### Iniciar el Proyecto

En la terminal, dentro de la carpeta del proyecto:

```bash
npm run dev
```

La aplicación se abrirá en: `http://localhost:5173`

### Interfaz Principal

#### 🏠 Página de Inicio

Al abrir la aplicación verás tres tarjetas:

1. **Monitoreo de Humedad**
   - Muestra el porcentaje de humedad actual de cada planta

2. **Sistema de Riego**
   - Muestra cuándo fue el último riego de cada planta

3. **Consumo de Agua**
   - Muestra cuántos litros se han usado hoy

#### 🌱 Gestión de Plantas

1. Haz clic en "Plantas" en el menú superior
2. Verás todas tus plantas registradas

**Para agregar una planta:**
- Haz clic en "Nueva Planta"
- Ingresa el nombre (ejemplo: "Lechuga")
- Ingresa la humedad mínima recomendada (ejemplo: 70%)
- Haz clic en "Guardar"

**Para asignar a un sensor:**
- En la columna "Asignación", haz clic en "Sensor 1" o "Sensor 2"
- La humedad mínima se copiará automáticamente al sensor

**Para editar:**
- Haz clic en el ícono ✏️
- Modifica los datos
- Guarda (si la planta está asignada, se actualizará el sensor)

**Para eliminar:**
- Haz clic en el ícono 🗑️
- Confirma la eliminación
- ⚠️ No puedes eliminar plantas asignadas a sensores

#### 💧 Consumo de Agua

1. Haz clic en "💧 Consumo" en el menú
2. Verás 4 pestañas:
   - **Resumen**: Vista general con últimos días y por planta
   - **Por Día**: Tabla con consumo diario
   - **Por Planta**: Estadísticas de cada sensor
   - **Periodos**: Lista completa de riegos ON-OFF

#### 📊 Reportes

1. Haz clic en "Reportes" en el menú
2. Selecciona el periodo:
   - **Día**: Últimas 24 horas
   - **Semana**: Últimos 7 días
   - **Mes**: Últimos 30 días
   - **Año**: Últimos 365 días
   - **Todo**: Historial completo
   - **Personalizado**: Selecciona fechas específicas

3. Para exportar a Excel:
   - Haz clic en "📥 Exportar a Excel"
   - Se descargará un archivo `.xlsx`

#### ⚙️ Control de Riego

En la sección de control unitario puedes:
- Ver humedad actual
- Ver humedad mínima configurada
- Activar/desactivar riego manual
- Cambiar entre modo manual y automático

---

## 📁 Estructura del Proyecto

```
proyectoiot/
├── src/
│   ├── components/          # Componentes de UI antiguos
│   ├── context/             # Context API
│   │   └── AppContext.jsx   # Estado global
│   ├── controllers/         # Lógica de negocio
│   │   ├── SensorController.js
│   │   ├── PlantaController.js
│   │   ├── HistorialController.js
│   │   └── NavigationController.js
│   ├── models/             # Modelos de datos
│   │   ├── SensorModel.js
│   │   ├── PlantaModel.js
│   │   └── HistorialModel.js
│   ├── services/           # Servicios externos
│   │   ├── FirebaseService.js
│   │   ├── FirestoreService.js
│   │   ├── AuthService.js
│   │   ├── ConsumoAguaService.js
│   │   └── SensorAssignmentService.js
│   ├── views/              # Vistas principales
│   │   ├── InicioView.jsx
│   │   ├── PlantasView.jsx
│   │   ├── ConsumoAguaView.jsx
│   │   ├── ReportesView.jsx
│   │   └── UnitarioView.jsx
│   ├── firebase/           # Configuración Firebase
│   │   └── config.js
│   ├── App.jsx             # Componente principal
│   └── main.jsx            # Punto de entrada
├── public/                 # Archivos estáticos
├── BD.json                 # Datos de ejemplo
├── Codigo_ESP32.ino        # Código para ESP32
├── ARQUITECTURA.md         # Documentación arquitectura
├── package.json            # Dependencias
└── README.md              # Este archivo
```

---

## 🔌 Hardware (ESP32)

### Componentes Necesarios

- ESP32 (cualquier modelo)
- 2x Sensores de humedad de suelo
- 1x Módulo relé de 2 canales
- 1x Bomba de agua 12V
- Fuente de alimentación
- Cables jumper

### Conexiones

**Sensores de Humedad:**
- Sensor 1 → GPIO 34 (A0)
- Sensor 2 → GPIO 35 (A6)

**Relé:**
- IN1 → GPIO 13
- IN2 → GPIO 12
- VCC → 5V
- GND → GND

### Cargar Código al ESP32

1. Instala Arduino IDE
2. Agrega soporte para ESP32:
   - Ve a Archivo → Preferencias
   - Agrega: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Ve a Herramientas → Placa → Gestor de tarjetas
   - Busca "ESP32" e instala

3. Abre `Codigo_ESP32.ino`
4. Configura tu WiFi:
   ```cpp
   const char* ssid = "TU-WIFI";
   const char* password = "TU-CONTRASEÑA";
   ```

5. Configura tu Firebase URL:
   ```cpp
   #define DATABASE_URL "https://TU-DATABASE.firebaseio.com"
   ```

6. Selecciona tu placa y puerto
7. Haz clic en "Subir"

---

## ❓ Solución de Problemas

### ⚠️ Error: "Module not found"

**Solución:**
```bash
npm install
```

### ⚠️ Error de Firebase: "Permission Denied"

**Causas posibles:**
1. Credenciales incorrectas en `AuthService.js`
2. Reglas de Firebase mal configuradas
3. Usuario no creado en Firebase Auth

**Solución:**
1. Verifica las credenciales en `src/services/AuthService.js`
2. Verifica las reglas en Firebase Console
3. Crea el usuario en Firebase Authentication

### ⚠️ No se muestran datos

**Solución:**
1. Verifica que Firebase tenga datos (importa `BD.json`)
2. Abre la consola del navegador (F12) y busca errores
3. Verifica la conexión del ESP32

### ⚠️ El ESP32 no se conecta

**Solución:**
1. Verifica el nombre y contraseña del WiFi
2. Verifica la URL de Firebase
3. Revisa el monitor serial en Arduino IDE

### ⚠️ No se puede exportar a Excel

**Solución:**
```bash
npm install xlsx
```

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la sección de [Solución de Problemas](#-solución-de-problemas)
2. Abre un issue en: https://github.com/WILL050305/proyectoiot/issues
3. Contacta al desarrollador

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👨‍💻 Autor

**William**
- GitHub: [@WILL050305](https://github.com/WILL050305)
- Proyecto: [proyectoiot](https://github.com/WILL050305/proyectoiot)

---

## 🙏 Agradecimientos

- Firebase por la infraestructura
- React por el framework
- Tailwind CSS por los estilos
- Recharts por las gráficas
- La comunidad de ESP32

---

## 📚 Recursos Adicionales

- [Documentación de React](https://react.dev/)
- [Documentación de Firebase](https://firebase.google.com/docs)
- [Guía de ESP32](https://docs.espressif.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**¡Gracias por usar este sistema! 🌱💧**

