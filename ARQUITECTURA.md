# 🏗️ Arquitectura del Proyecto IoT

> **Proyecto IoT con Arquitectura MVC** - Sistema de monitoreo y control de riego inteligente

## 📑 Índice

1. [Stack Tecnológico](#-stack-tecnológico)
2. [Arquitectura MVC](#%EF%B8%8F-arquitectura-mvc-modelo-vista-controlador)
   - [Estructura del Proyecto](#-estructura-del-proyecto-actualizada)
   - [Flujo de Datos MVC](#-flujo-de-datos-mvc)
3. [Componentes MVC](#-componentes-mvc---detalle-técnico)
   - [Modelos (Models)](#1-modelos-models)
   - [Vistas (Views)](#2-vistas-views)
   - [Controladores (Controllers)](#3-controladores-controllers)
   - [Servicios (Services)](#4-servicios-services)
   - [Context (AppContext)](#5-context-appcontext)
4. [Componentes Legacy](#-componentes-principales-legacy---referencia)
5. [Configuración Firebase](#-configuración-firebase)
6. [Patrones de Diseño](#-patrones-de-diseño-utilizados)
7. [Características Clave](#-características-clave)
8. [Ventajas del Patrón MVC](#-ventajas-del-patrón-mvc-en-este-proyecto)
9. [Comparación Antes vs Después](#-comparación-antes-vs-después)
10. [Guía para Desarrolladores](#-guía-rápida-para-desarrolladores)
11. [Escalabilidad y Mejoras](#-escalabilidad-y-mejoras-futuras)
12. [Debugging](#-debugging-y-logs)
13. [Comandos](#-comandos)

---

## 📋 Stack Tecnológico

### Frontend:
- **React 19.2.0** - Biblioteca UI principal
- **Vite 7.2.2** - Build tool y dev server
- **Tailwind CSS 4.1.17** - Framework CSS utility-first
- **Recharts 3.4.1** - Librería de gráficos para visualización de datos

### Backend:
- **Firebase 12.6.0**
  - **Realtime Database** - Para datos de sensores IoT en tiempo real
  - **Firestore** - Para almacenar el CRUD de plantas
  - **Analytics** - Análisis de uso

### Hardware:
- **ESP32** - Microcontrolador IoT (ver archivos `.ino`)

---

## 🏗️ ARQUITECTURA MVC (Modelo-Vista-Controlador)

### 📌 Nueva Estructura Implementada

El proyecto ha sido refactorizado siguiendo el patrón de diseño **MVC** adaptado para React, mejorando la organización del código, facilitando el mantenimiento y permitiendo mejor escalabilidad.

### 📁 Estructura del Proyecto (Actualizada)

```
proyectoiot/
├── public/                          # Archivos estáticos
├── src/
│   ├── assets/                      # Imágenes y recursos
│   │
│   ├── models/                      # 📦 MODELOS - Estructura de datos
│   │   ├── SensorModel.js          # Modelo de sensores
│   │   ├── PlantaModel.js          # Modelo de plantas
│   │   ├── HistorialModel.js       # Modelo de historial
│   │   └── GraficoModel.js         # Modelo de datos de gráfico
│   │
│   ├── views/                       # 📱 VISTAS - Componentes de presentación
│   │   ├── HeaderView.jsx          # Vista de cabecera
│   │   ├── InicioView.jsx          # Vista de inicio
│   │   ├── GraficoView.jsx         # Vista de gráfico
│   │   ├── UnitarioView.jsx        # Vista individual de sensores
│   │   └── PlantasView.jsx         # Vista CRUD de plantas
│   │
│   ├── controllers/                 # 🎮 CONTROLADORES - Lógica de negocio
│   │   ├── SensorController.js     # Controlador de sensores
│   │   ├── PlantaController.js     # Controlador de plantas
│   │   ├── HistorialController.js  # Controlador de historial
│   │   └── NavigationController.js # Controlador de navegación
│   │
│   ├── services/                    # 🔌 SERVICIOS - Comunicación Firebase
│   │   ├── FirebaseService.js      # Servicio Realtime Database
│   │   └── FirestoreService.js     # Servicio Firestore
│   │
│   ├── context/                     # 🌐 Context API - Estado global
│   │   ├── AppContext.jsx          # Context principal MVC
│   │   └── HumedadContext.jsx      # (Legacy - puede eliminarse)
│   │
│   ├── components/                  # (Legacy - componentes originales)
│   │   ├── Header.jsx
│   │   ├── Inicio.jsx
│   │   ├── Grafico.jsx
│   │   ├── Unitario.jsx
│   │   └── Plantas.jsx
│   │
│   ├── firebase/
│   │   └── config.js               # Configuración Firebase
│   │
│   ├── App.jsx                     # Componente principal (actualizado a MVC)
│   ├── App.css                     # Estilos globales
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Estilos base
│
├── esp32_codigo_corregido.ino      # Código ESP32 (versión corregida)
├── esp32_codigo_final.ino          # Código ESP32 (versión final)
├── package.json                    # Dependencias del proyecto
├── vite.config.js                  # Configuración de Vite
└── eslint.config.js                # Configuración de ESLint
```

---

## 🔄 Flujo de Datos MVC

### Arquitectura General MVC

```
┌──────────────────────────────────────────────────────────┐
│                    👤 USUARIO INTERACTÚA                  │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  📱 VISTAS (Views)                                        │
│  - HeaderView, InicioView, GraficoView                    │
│  - UnitarioView, PlantasView                              │
│  Componentes React puros de presentación                 │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  🎮 CONTROLADORES (Controllers)                           │
│  - useSensorController()                                  │
│  - usePlantaController()                                  │
│  - useHistorialController()                               │
│  - useNavigationController()                              │
│  Custom Hooks con lógica de negocio                      │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  🔌 SERVICIOS (Services)                                  │
│  - FirebaseService (Realtime Database)                    │
│  - FirestoreService (Firestore)                           │
│  Comunicación con Firebase                                │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  📦 MODELOS (Models)                                      │
│  - SensorModel, PlantaModel                               │
│  - HistorialModel, GraficoModel                           │
│  Estructura y validación de datos                         │
└──────────────────────────────────────────────────────────┘
```

### Flujo de Sensores IoT (Tiempo Real) - Con MVC

```
┌─────────────┐
│   ESP32     │ (Sensores de humedad)
└──────┬──────┘
       │ WiFi
       ▼
┌─────────────────────────┐
│  Firebase Realtime DB   │ (sensores/sensor1, sensores/sensor2)
└──────┬──────────────────┘
       │ onValue() listener
       ▼
┌─────────────────────────┐
│  FirebaseService.js     │ (Servicio)
└──────┬──────────────────┘
       │ Convierte a modelos
       ▼
┌─────────────────────────┐
│  SensorModel.js         │ (Modelo)
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ useSensorController()   │ (Controlador)
└──────┬──────────────────┘
       │ Centraliza en Context
       ▼
┌─────────────────────────┐
│   AppContext.jsx        │ (Estado global MVC)
└──────┬──────────────────┘
       │ Distribuye a vistas
       ├──────────┬──────────┬──────────┐
       ▼          ▼          ▼          ▼
  InicioView  GraficoView  UnitarioView [Otras Vistas]
```

### Flujo de Gestión de Plantas (Manual) - Con MVC

```
┌──────────────┐
│   Usuario    │ (Interactúa con formulario)
└──────┬───────┘
       │ onClick, onSubmit
       ▼
┌─────────────────┐
│ PlantasView.jsx │ (Vista)
└──────┬──────────┘
       │ Llama a controlador
       ▼
┌──────────────────────┐
│ usePlantaController()│ (Controlador)
└──────┬───────────────┘
       │ Valida con modelo
       ▼
┌─────────────────┐
│ PlantaModel.js  │ (Modelo - validación)
└──────┬──────────┘
       │ Si válido
       ▼
┌──────────────────────┐
│ FirestoreService.js  │ (Servicio)
└──────┬───────────────┘
       │ CRUD operations
       ▼
┌─────────────────┐
│   Firestore     │ (Base de datos)
└─────────────────┘
```

---

## 📦 Componentes MVC - Detalle Técnico

### 1. MODELOS (Models)

Los modelos definen la estructura de datos y contienen métodos de validación y transformación.

#### **SensorModel.js**
```javascript
class SensorModel {
  constructor(data) {
    this.humedad = data.humedad || 0;
    this.planta = data.planta || '';
    this.fecha = data.fecha || new Date().toISOString();
    this.rele_estado = data.rele_estado !== undefined ? data.rele_estado : 1;
  }
  
  // Métodos de negocio
  estaRiegoActivo() {
    return this.rele_estado === 0;  // Relé activo en LOW
  }
  
  estaOnline(segundosMaximo = 15) {
    const sensorTime = new Date(this.fecha).getTime();
    const now = Date.now();
    return (now - sensorTime) < (segundosMaximo * 1000);
  }
  
  toJSON() { /* ... */ }
}
```

#### **PlantaModel.js**
```javascript
class PlantaModel {
  constructor(data) {
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.especie = data.especie || '';
    this.ubicacion = data.ubicacion || '';
    this.fechaPlantado = data.fechaPlantado || '';
    this.estado = data.estado || 'saludable';
    this.fechaRegistro = data.fechaRegistro || new Date().toISOString();
  }
  
  // Validación
  isValid() {
    return this.nombre.trim() !== '' && 
           this.especie.trim() !== '' && 
           this.ubicacion.trim() !== '';
  }
  
  getEstadoConColor() { /* ... */ }
  toJSON() { /* ... */ }
  toFormData() { /* ... */ }
}
```

#### **HistorialModel.js** y **GraficoModel.js**
Modelos adicionales para datos históricos y puntos del gráfico.

---

### 2. VISTAS (Views)

Componentes React puros enfocados únicamente en la presentación. **No contienen lógica de negocio**.

#### **HeaderView.jsx**
```javascript
const HeaderView = ({ onNavigate }) => {
  return (
    <header>
      {/* Barra de navegación */}
      <button onClick={() => onNavigate('/plantas')}>Plantas</button>
    </header>
  );
};
```

**Características:**
- Recibe callbacks como props
- No maneja estado propio de negocio
- Solo presenta datos

#### **GraficoView.jsx**
```javascript
const GraficoView = ({ datosGrafico, sensores, isOnline }) => {
  return (
    <ResponsiveContainer>
      <LineChart data={datosGrafico}>
        {/* Configuración del gráfico */}
      </LineChart>
    </ResponsiveContainer>
  );
};
```

**Props:**
- `datosGrafico`: Array de puntos para el gráfico
- `sensores`: Objetos SensorModel
- `isOnline`: Estado de conexión

#### **UnitarioView.jsx**
```javascript
const UnitarioView = ({ sensores, onToggleRiego }) => {
  // Solo maneja estado UI local (loading)
  const [loading, setLoading] = useState(false);
  
  return (
    <div>
      {/* Controles individuales por sensor */}
      <button onClick={() => onToggleRiego('sensor1', nuevoEstado)}>
        {sensores.sensor1?.estaRiegoActivo() ? 'Apagar' : 'Encender'}
      </button>
    </div>
  );
};
```

#### **PlantasView.jsx**
Vista completa con formulario y tabla para gestión de plantas.

---

### 3. CONTROLADORES (Controllers)

Custom Hooks que contienen **toda la lógica de negocio** y orquestan la comunicación entre vistas y servicios.

#### **useSensorController()**
```javascript
export const useSensorController = () => {
  const [sensores, setSensores] = useState({ sensor1: null, sensor2: null });
  const [isOnline, setIsOnline] = useState({ sensor1: false, sensor2: false });
  const [datosGrafico, setDatosGrafico] = useState([]);

  // Suscribirse a Firebase
  useEffect(() => {
    const unsubscribe = FirebaseService.onSensoresChange((data, error) => {
      if (data) {
        setSensores(data);
        setIsOnline({
          sensor1: data.sensor1?.estaOnline() || false,
          sensor2: data.sensor2?.estaOnline() || false
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Actualizar gráfico
  useEffect(() => {
    if (sensores.sensor1 && sensores.sensor2) {
      const newPoint = new GraficoModel({
        humedad1: sensores.sensor1.humedad,
        humedad2: sensores.sensor2.humedad,
        timestamp: Date.now()
      });
      setDatosGrafico(prev => [...prev, newPoint].slice(-12));
    }
  }, [sensores]);

  // Función de control
  const toggleRiego = async (sensorId, nuevoEstado) => {
    return await FirebaseService.updateReleEstado(sensorId, nuevoEstado);
  };

  return { sensores, isOnline, datosGrafico, toggleRiego, setDatosGrafico };
};
```

**Responsabilidades:**
- Gestiona suscripciones a Firebase
- Transforma datos en modelos
- Actualiza estado de forma reactiva
- Proporciona funciones de control

#### **usePlantaController()**
```javascript
export const usePlantaController = () => {
  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPlanta = async (plantaData) => {
    setLoading(true);
    const result = await FirestoreService.createPlanta(plantaData);
    if (result.success) {
      await fetchPlantas();
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  // Más funciones CRUD...
  
  return {
    plantas,
    loading,
    error,
    createPlanta,
    updatePlanta,
    deletePlanta,
    fetchPlantas
  };
};
```

**Responsabilidades:**
- Orquesta operaciones CRUD
- Maneja estados de carga y error
- Valida datos con modelos
- Actualiza vista automáticamente

#### **useHistorialController()** y **useNavigationController()**
Controladores adicionales para historial y navegación.

---

### 4. SERVICIOS (Services)

Clases estáticas que **solo se comunican con Firebase**. No contienen lógica de UI ni estado de React.

#### **FirebaseService.js**
```javascript
export class FirebaseService {
  // Suscripción a sensores
  static onSensoresChange(callback) {
    const sensoresRef = ref(database, 'sensores');
    
    return onValue(sensoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sensoresModels = {
          sensor1: new SensorModel(data.sensor1),
          sensor2: new SensorModel(data.sensor2)
        };
        callback(sensoresModels, null);
      }
    }, (error) => {
      callback(null, error);
    });
  }

  // Actualizar relé
  static async updateReleEstado(sensorId, nuevoEstado) {
    try {
      const updates = {};
      updates[`sensores/${sensorId}/rele_estado`] = nuevoEstado;
      await update(ref(database), updates);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
  
  // Más métodos...
}
```

#### **FirestoreService.js**
```javascript
export class FirestoreService {
  static COLLECTION_NAME = 'plantas';

  static async getPlantas() {
    try {
      const querySnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      const plantas = querySnapshot.docs.map(doc => 
        new PlantaModel({ id: doc.id, ...doc.data() })
      );
      return { success: true, data: plantas };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async createPlanta(plantaData) {
    const planta = new PlantaModel(plantaData);
    if (!planta.isValid()) {
      throw new Error('Datos inválidos');
    }
    const docRef = await addDoc(collection(db, this.COLLECTION_NAME), planta.toJSON());
    return { success: true, id: docRef.id };
  }
  
  // updatePlanta, deletePlanta...
}
```

**Características:**
- Métodos estáticos (sin instanciación)
- Retornan objetos de resultado consistentes
- Convierten datos a modelos
- Manejan errores internamente

---

### 5. CONTEXT (AppContext)

Context API que **centraliza todos los controladores** y proporciona acceso global.

#### **AppContext.jsx**
```javascript
export const AppProvider = ({ children }) => {
  // Instanciar todos los controladores
  const sensorController = useSensorController();
  const plantaController = usePlantaController();
  const historialController = useHistorialController();
  const navigationController = useNavigationController();

  // Combinar en un único objeto de contexto
  const value = {
    // Sensor Controller
    sensores: sensorController.sensores,
    isOnline: sensorController.isOnline,
    datosGrafico: sensorController.datosGrafico,
    toggleRiego: sensorController.toggleRiego,
    
    // Planta Controller
    plantas: plantaController.plantas,
    createPlanta: plantaController.createPlanta,
    updatePlanta: plantaController.updatePlanta,
    deletePlanta: plantaController.deletePlanta,
    
    // Historial Controller
    historial: historialController.historial,
    
    // Navigation Controller
    showPlantas: navigationController.showPlantas,
    navigate: navigationController.navigate,
    closePlantas: navigationController.closePlantas
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook para usar el contexto
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider');
  }
  return context;
};
```

---

### 6. App.jsx (Actualizado a MVC)

```javascript
function AppContent() {
  // Obtener todo del contexto MVC
  const {
    sensores, isOnline, datosGrafico, toggleRiego,
    plantas, createPlanta, updatePlanta, deletePlanta,
    historial, showPlantas, navigate, closePlantas
  } = useAppContext();

  return (
    <>
      <HeaderView onNavigate={navigate} />
      <InicioView sensores={sensores} historial={historial} />
      <GraficoView datosGrafico={datosGrafico} sensores={sensores} isOnline={isOnline} />
      <UnitarioView datosGrafico={datosGrafico} sensores={sensores} onToggleRiego={toggleRiego} />
      
      {showPlantas && (
        <div className="modal">
          <PlantasView 
            plantas={plantas}
            onCreatePlanta={createPlanta}
            onUpdatePlanta={updatePlanta}
            onDeletePlanta={deletePlanta}
          />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
```

---

## 🎨 Componentes Principales (Legacy - Referencia)

### 1. App.jsx - Orquestador Principal (Versión Original)
**Responsabilidades:**
- Maneja el estado de navegación
- Controla la apertura/cierre del modal de Plantas
- Provee el contexto global (`HumedadProvider`)
- Renderiza la estructura principal de la aplicación

**Estado:**
```javascript
- showPlantas: boolean  // Controla visibilidad del modal de Plantas
```

**Funciones:**
```javascript
- handleNavigate(route)      // Maneja la navegación entre vistas
- handleClosePlantas()       // Cierra el modal de Plantas
```

---

### 2. HumedadContext.jsx - Gestor de Estado IoT (Legacy)
**Responsabilidades:**
- Conexión en tiempo real con Firebase Realtime Database
- Monitoreo de 2 sensores de humedad
- Detección de estado online/offline de sensores
- Generación de datos históricos y para gráficos
- Gestión de plantas asociadas a sensores
- Control de servo/riego

**Estado Global:**
```javascript
- sensores: {
    sensor1: { humedad, fecha, ... },
    sensor2: { humedad, fecha, ... }
  }
- plantas: {}                    // Asociación de plantas a sensores
- historial: []                  // Histórico de lecturas
- datosGrafico: []               // Datos formateados para Recharts
- isOnline: {
    sensor1: boolean,
    sensor2: boolean
  }
```

**Funciones Exportadas:**
```javascript

- useHumedad()                   // Hook para acceder al contexto
```

**Lógica de Detección Online:**
- Un sensor se considera online si envió datos en los últimos 15 segundos
- Se verifica comparando timestamp actual con la fecha de última lectura

---

### 3. Header.jsx - Navegación
**Responsabilidades:**
- Barra de navegación fija en la parte superior
- Botones de navegación: Reportes, Plantas
- Trigger de modales/vistas mediante callback `onNavigate`

**Props:**
```javascript
- onNavigate: function  // Callback para manejar navegación
```

**Estilos:**
- Fondo gris (`bg-gray-500`)
- Posición fija (`fixed top-0`)
- Efectos hover con transiciones suaves
- Logo/imagen en la izquierda, navegación en la derecha

---

### 4. Inicio.jsx - Dashboard
**Responsabilidades:**
- Vista general de sensores
- Tarjetas con información en tiempo real
- Dashboard principal de la aplicación

**Acceso a Datos:**
```javascript
const { sensores, isOnline } = useHumedad();
```

---

### 5. Grafico.jsx - Visualización
**Responsabilidades:**
- Visualización gráfica de datos históricos de sensores
- Usa **Recharts** para gráficos de línea/área
- Muestra histórico de humedad de ambos sensores

**Acceso a Datos:**
```javascript
const { datosGrafico } = useHumedad();
```

**Tipos de Gráficos:**
- LineChart / AreaChart
- Comparación de múltiples sensores
- Eje temporal (X) vs Humedad (Y)

---

### 6. Unitario.jsx - Vista Detallada
**Responsabilidades:**
- Información individual por sensor
- Control manual de actuadores (riego)
- Vista detallada de estado de cada sensor

**Acceso a Datos:**
```javascript
const { sensores, isOnline } = useHumedad();
```

---

### 7. Plantas.jsx - CRUD Completo
**Responsabilidades:**
- **Create**: Agregar nuevas plantas
- **Read**: Lista/tabla de plantas desde Firestore
- **Update**: Editar plantas existentes
- **Delete**: Eliminar plantas con confirmación

**Estado Local:**
```javascript
- plantas: []                    // Lista de plantas desde Firestore
- formData: {
    nombre: string,
    especie: string,
    ubicacion: string,
    fechaPlantado: date,
    estado: enum
  }
- editingId: string | null       // ID de planta en edición
- showForm: boolean              // Controla visibilidad del formulario
```

**Funciones:**
```javascript
- fetchPlantas()                 // Obtiene plantas desde Firestore
- handleSubmit(e)                // Crea o actualiza planta
- handleEdit(planta)             // Prepara formulario para editar
- handleDelete(id)               // Elimina planta con confirmación
- handleCancel()                 // Cancela edición/creación
- getEstadoColor(estado)         // Retorna clases CSS según estado
```

**Estados de Plantas:**
- `saludable` - Verde
- `enfermo` - Rojo
- `crecimiento` - Azul

**Features Adicionales:**
- Modal flotante sobre el contenido principal
- Botón de cerrar en esquina superior derecha
- Formulario que se oculta/muestra dinámicamente
- Tabla responsive con todas las plantas
- Estadísticas: Total, Saludables, Enfermas
- Validación de campos requeridos

---

## 🔥 Configuración Firebase

### Realtime Database (Estructura)
```json
/sensores
  /sensor1
    {
      "humedad": 45.5,
      "fecha": "2025-12-13T10:30:00.000Z",
      "online": true
    }
  /sensor2
    {
      "humedad": 62.3,
      "fecha": "2025-12-13T10:30:05.000Z",
      "online": true
    }
```

**Uso:**
- Escritura: ESP32 → Firebase (WiFi)
- Lectura: React App → Firebase (`onValue()` listener)
- Actualización en tiempo real automática

---

### Firestore (Colecciones)
```
/plantas
  /{plantaId}
    {
      "nombre": "Rosa del jardín",
      "especie": "Rosa chinensis",
      "ubicacion": "Jardín frontal",
      "fechaPlantado": "2025-01-15",
      "estado": "saludable",
      "fechaRegistro": "2025-12-13T08:00:00.000Z"
    }
```

**Operaciones:**
- `addDoc()` - Crear nueva planta
- `getDocs()` - Obtener todas las plantas
- `updateDoc()` - Actualizar planta existente
- `deleteDoc()` - Eliminar planta

---

## 🎯 Patrones de Diseño Utilizados

### 1. Context API Pattern
**Archivo:** `HumedadContext.jsx`
- Evita prop drilling
- Estado global accesible desde cualquier componente
- Un único provider en la raíz de la aplicación

### 2. Component Composition
- Componentes pequeños y reutilizables
- Separación de responsabilidades
- Fácil mantenimiento y testing

### 3. Real-time Listeners Pattern
```javascript
onValue(ref(database, 'sensores'), (snapshot) => {
  // Actualización automática cuando cambian los datos
});
```

### 4. Modal Pattern
- UI flotante para Plantas
- Fondo semitransparente
- Cierre con botón o click fuera del contenido

### 5. CRUD Operations
**Firestore:**
```javascript
// Create
await addDoc(collection(db, 'plantas'), data);

// Read
const querySnapshot = await getDocs(collection(db, 'plantas'));

// Update
await updateDoc(doc(db, 'plantas', id), data);

// Delete
await deleteDoc(doc(db, 'plantas', id));
```

### 6. Responsive Design
- Tailwind CSS utilities
- Grid system (`grid-cols-1 md:grid-cols-2`)
- Mobile-first approach

---

## ⚡ Características Clave

✅ **Monitoreo IoT en tiempo real** - Datos actualizados automáticamente desde ESP32  
✅ **Detección automática de sensores online/offline** - Basado en timestamp de última lectura  
✅ **Visualización de datos históricos** - Gráficos interactivos con Recharts  
✅ **CRUD completo para gestión de plantas** - Create, Read, Update, Delete  
✅ **UI moderna y responsive** - Tailwind CSS con diseño adaptable  
✅ **Integración dual** - Realtime DB para IoT + Firestore para datos estructurados  
✅ **Sistema de navegación modal** - UX fluida sin cambio de página  
✅ **Estados visuales** - Colores diferenciados por estado de planta  

---

## 🚀 Comandos

```bash
# Desarrollo
npm run dev      # Inicia servidor de desarrollo en http://localhost:5174

# Producción
npm run build    # Genera build optimizado en /dist
npm run preview  # Preview del build de producción

# Calidad de código
npm run lint     # Ejecuta ESLint para encontrar errores
```

---

## 🔧 Configuración de Desarrollo

### Variables de Entorno
No se utilizan variables de entorno en este proyecto. La configuración de Firebase está directamente en `src/firebase/config.js`.

### Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174  // Puerto personalizado
  }
})
```

---

## 📊 Flujo de Trabajo del Usuario

### 1. Monitoreo de Sensores (Pasivo)
```
Usuario abre app → 
Visualiza Inicio.jsx (dashboard) → 
Ve datos en tiempo real de sensores → 
Revisa Grafico.jsx para histórico → 
Consulta Unitario.jsx para detalles
```

### 2. Gestión de Plantas (Activo)
```
Usuario click en "Plantas" → 
Modal flotante se abre → 
Usuario ve lista de plantas → 
Click "+ Nueva Planta" → 
Completa formulario → 
Click "Guardar" → 
Planta se agrega a Firestore → 
Lista se actualiza automáticamente
```

### 3. Edición de Plantas
```
Usuario abre modal de Plantas → 
Click "✏️ Editar" en una planta → 
Formulario se rellena con datos existentes → 
Usuario modifica campos → 
Click "Actualizar" → 
Cambios se guardan en Firestore → 
Lista se actualiza
```

---

## 🎨 Paleta de Colores y Estilos

### Header
- Fondo: `bg-gray-500`
- Texto: `text-white`
- Hover: `text-blue-300`

### Estados de Plantas
- **Saludable**: `bg-green-100 text-green-800`
- **Enfermo**: `bg-red-100 text-red-800`
- **Crecimiento**: `bg-blue-100 text-blue-800`

### Botones Principales
- **Primario**: `bg-green-600 hover:bg-green-700`
- **Peligro**: `bg-red-500 hover:bg-red-600`
- **Secundario**: `bg-gray-400 hover:bg-gray-500`

---

## 🔐 Seguridad

### Firebase Rules (Recomendado)
```javascript
// Realtime Database Rules
{
  "rules": {
    "sensores": {
      ".read": true,
      ".write": true  // Solo ESP32 debería poder escribir
    }
  }
}

// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /plantas/{plantaId} {
      allow read, write: if true;  // Cambiar en producción
    }
  }
}
```

---

## 🎯 Ventajas del Patrón MVC en este Proyecto

### ✅ Separación de Responsabilidades
- **Modelos**: Solo estructura de datos y validación
- **Vistas**: Solo presentación visual (React components)
- **Controladores**: Solo lógica de negocio (custom hooks)
- **Servicios**: Solo comunicación con Firebase

**Beneficio:** Cada desarrollador puede trabajar en una capa sin afectar las otras.

### ✅ Reutilización de Código
- Los controladores (hooks) se pueden usar en múltiples componentes
- Los modelos se comparten entre toda la aplicación
- Los servicios son independientes de la UI

**Ejemplo:**
```javascript
// El mismo controlador puede usarse en diferentes vistas
const { sensores, toggleRiego } = useAppContext();
```

### ✅ Facilidad de Testing
- **Modelos**: Testear validación sin UI
- **Servicios**: Mockear Firebase fácilmente
- **Controladores**: Testear lógica sin renderizar componentes
- **Vistas**: Testear UI con datos mockeados

**Ejemplo de test unitario:**
```javascript
// Testear modelo sin UI
const planta = new PlantaModel({ nombre: '', especie: 'Rosa' });
expect(planta.isValid()).toBe(false);  // nombre vacío
```

### ✅ Mantenibilidad
- Código organizado y predecible
- Cambios en Firebase no afectan las vistas
- Cambios en UI no afectan la lógica
- Estructura consistente y escalable

**Ejemplo:** Cambiar de Firebase a otra base de datos solo requiere modificar los Servicios.

### ✅ Escalabilidad
```
Agregar nueva funcionalidad:
1. Crear modelo en /models
2. Crear servicio en /services
3. Crear controlador en /controllers
4. Crear vista en /views
5. Conectar en AppContext
```

**Patrón repetible** para cualquier nueva feature.

---

## 📖 Comparación: Antes vs Después

### ❌ ANTES (Sin MVC)
```
src/components/
├── Plantas.jsx
│   ├── ❌ Lógica de negocio mezclada
│   ├── ❌ Llamadas directas a Firebase
│   ├── ❌ Validación en el componente
│   ├── ❌ Estado local complejo
│   └── ❌ Difícil de testear
```

### ✅ AHORA (Con MVC)
```
src/
├── models/PlantaModel.js       → Validación y estructura
├── services/FirestoreService.js → Comunicación Firebase
├── controllers/PlantaController.js → Lógica de negocio
└── views/PlantasView.jsx       → Solo presentación

✅ Separación clara
✅ Fácil de testear
✅ Fácil de mantener
✅ Escalable
```

---

## 📝 Ejemplo de Flujo Completo MVC

### Escenario: Usuario crea una nueva planta

```
1. Usuario completa formulario en PlantasView
   └─> Vista: Captura datos del form

2. Usuario hace clic en "Guardar"
   └─> Vista: Llama a onCreatePlanta(formData)

3. PlantasView llama al controlador
   └─> Controlador: usePlantaController().createPlanta()

4. Controlador valida con el modelo
   └─> Modelo: new PlantaModel(formData).isValid()

5. Si válido, controlador llama al servicio
   └─> Servicio: FirestoreService.createPlanta()

6. Servicio comunica con Firebase
   └─> Firebase: addDoc() a colección 'plantas'

7. Servicio retorna resultado
   └─> { success: true, id: 'abc123' }

8. Controlador actualiza estado
   └─> setPlantas([...plantas, nuevaPlanta])

9. React re-renderiza automáticamente
   └─> PlantasView muestra la nueva planta en la tabla

✅ TODO SEPARADO Y ORGANIZADO
```

---

## 🚀 Guía Rápida para Desarrolladores

### Agregar una Nueva Funcionalidad

#### 1. Definir el Modelo
```javascript
// src/models/NuevoModel.js
export class NuevoModel {
  constructor(data) {
    this.propiedad = data.propiedad || '';
  }
  
  isValid() {
    return this.propiedad !== '';
  }
}
```

#### 2. Crear el Servicio
```javascript
// src/services/NuevoService.js
export class NuevoService {
  static async getData() {
    const snapshot = await getDocs(collection(db, 'coleccion'));
    return snapshot.docs.map(doc => new NuevoModel(doc.data()));
  }
}
```

#### 3. Implementar el Controlador
```javascript
// src/controllers/NuevoController.js
export const useNuevoController = () => {
  const [data, setData] = useState([]);
  
  const fetchData = async () => {
    const result = await NuevoService.getData();
    setData(result);
  };
  
  return { data, fetchData };
};
```

#### 4. Crear la Vista
```javascript
// src/views/NuevoView.jsx
const NuevoView = ({ data }) => {
  return (
    <div>
      {data.map(item => <div key={item.id}>{item.propiedad}</div>)}
    </div>
  );
};
```

#### 5. Integrar en AppContext
```javascript
// src/context/AppContext.jsx
const nuevoController = useNuevoController();

const value = {
  ...existingValues,
  data: nuevoController.data,
  fetchData: nuevoController.fetchData
};
```

#### 6. Usar en App.jsx
```javascript
const { data } = useAppContext();
<NuevoView data={data} />
```

---

## 📈 Escalabilidad y Mejoras Futuras

### Posibles Mejoras con MVC:
1. **Autenticación de usuarios** - Agregar AuthController y AuthService
2. **Roles y permisos** - Agregar PermissionModel
3. **Notificaciones push** - Agregar NotificationController
4. **Dashboard de análisis** - Agregar AnalyticsController
5. **Exportación de datos** - Agregar ExportService
6. **Modo offline** - Agregar CacheService con IndexedDB
7. **Múltiples ubicaciones** - Extender SensorModel con ubicación
8. **Control automático de riego** - Agregar AutomationController
9. **Integración con otros sensores** - Nuevos modelos por tipo de sensor
10. **Modo oscuro** - Agregar ThemeController

**Ventaja MVC:** Cada mejora se implementa en su capa correspondiente sin afectar el resto del sistema.

---

## 🐛 Debugging y Logs

### Console Logs MVC
```javascript
// Controllers
console.log('🎮 [Controller] Sensor data updated:', sensores);

// Services  
console.log('🔌 [Service] Firebase connection established');
console.log('📊 [Service] Data received from Firebase:', data);

// Models
console.log('📦 [Model] Validation failed:', planta.errors);

// Views
console.log('📱 [View] Rendering with props:', props);
```

### Verificación de Estado
```javascript
// Desde cualquier componente
const context = useAppContext();
console.table({
  'Sensores': context.sensores,
  'Plantas': context.plantas.length,
  'Historial': context.historial.length
});
```

---

## 📞 Contacto y Soporte

**Repositorio:** github.com/WILL050305/proyectoiot  
**Arquitectura:** Modelo-Vista-Controlador (MVC)  
**Fecha de Refactorización:** 14 de diciembre de 2025  
**Última Actualización:** 14 de diciembre de 2025  

---

## 📝 Notas Técnicas

### Stack Tecnológico
- **React 19.2.0** - Con Hooks para controladores
- **Firebase 12.6.0** - Realtime DB + Firestore
- **Tailwind CSS 4.1.17** - Estilos utility-first
- **Recharts 3.4.1** - Visualización de datos
- **Vite 7.2.2** - Build tool rápido
- **ESP32** - Hardware IoT

### Arquitectura
- **Patrón MVC** adaptado para React
- **Custom Hooks** como controladores
- **Context API** para estado global
- **Clases ES6** para modelos
- **Métodos estáticos** para servicios

### Mejores Prácticas Implementadas
✅ Separación de responsabilidades  
✅ Single Responsibility Principle  
✅ DRY (Don't Repeat Yourself)  
✅ Composición sobre herencia  
✅ Código autodocumentado  
✅ Validación en modelos  
✅ Manejo centralizado de errores  

---

## 🎓 Recursos de Aprendizaje

### Para entender MVC en React:
- **Modelos**: Clases JavaScript ES6
- **Vistas**: Componentes React funcionales
- **Controladores**: Custom Hooks (useState, useEffect)
- **Context**: React Context API

### Flujo de datos:
```
Vista → Controlador → Servicio → Firebase → Servicio → Controlador → Vista
```

---
