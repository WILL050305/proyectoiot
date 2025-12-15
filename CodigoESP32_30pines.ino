
#define ENABLE_USER_AUTH
#define ENABLE_DATABASE

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <FirebaseClient.h>
#include <ArduinoJson.h>
#include <time.h>

// ================= WIFI =================
#define WIFI_SSID "Motog31"
#define WIFI_PASSWORD "antoniocardenas2005"

// ================= FIREBASE =================
#define Web_API_KEY "AIzaSyCQfLe1P85eO0nIZOFPx-J5KmYu_qR26jI"
#define DATABASE_URL "https://iotb2-6aafe-default-rtdb.firebaseio.com"
#define USER_EMAIL "gabrielcardenassanchez80@gmail.com"
#define USER_PASS "gabriel0503"

// ================= PINES =================
#define SENSOR1_PIN 34
#define SENSOR2_PIN 35
#define RELE1_PIN 26
#define RELE2_PIN 27
#define BOMBA_PIN 25

// ================= OBJETOS FIREBASE =================
UserAuth user_auth(Web_API_KEY, USER_EMAIL, USER_PASS);
WiFiClientSecure ssl_client, stream_ssl_client;
FirebaseApp app;
using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client), streamClient(stream_ssl_client);
RealtimeDatabase Database;

// ================= ESTRUCTURA DE DATOS =================
struct SensorData {
  String planta = "";
  String modo = "auto";
  bool manualOn = false;
  bool manualOff = false;
  int humedad = 0;
  int humedadMin = 0;
  unsigned long lastManual = 0;
  int relePin;
  String nombre;
  String firebasePath;
  int lastSentHumedad = -1;
  bool commandProcessed = true;
};

struct PendingAction {
  bool active = false;
  unsigned long startTime = 0;
  String action;
};

SensorData sensor1 = {
  .relePin = RELE1_PIN,
  .nombre = "sensor1",
  .firebasePath = "/sensores/sensor1"
};

SensorData sensor2 = {
  .relePin = RELE2_PIN,
  .nombre = "sensor2",
  .firebasePath = "/sensores/sensor2"
};

PendingAction pending1, pending2;

// ================= VARIABLES GLOBALES =================
unsigned long lastReadHumidity = 0;
unsigned long lastStatusUpdate = 0;
unsigned long lastDebugPrint = 0;

const unsigned long MANUAL_TIMEOUT = 20000;      // 20s
const unsigned long HUMIDITY_INTERVAL = 1000;    // 1s
const unsigned long STATUS_INTERVAL = 15000;     // 15s
const unsigned long DEBUG_INTERVAL = 5000;       // 5s

bool firebaseReady = false;
unsigned long lastPrintTime = 0;

// ================= DECLARACIÓN DE FUNCIONES =================
void processData(AsyncResult &aResult);
void setupFirebaseStream();
void cargarConfiguracionInicial();

// ================= FUNCIONES AUXILIARES =================
String obtenerFecha() {
  time_t now = time(nullptr);
  if (now < 100000) return "Sin sincronizar";
  
  struct tm* t = localtime(&now);
  char buf[25];
  sprintf(buf, "%04d-%02d-%02d %02d:%02d:%02d",
          t->tm_year + 1900, t->tm_mon + 1, t->tm_mday,
          t->tm_hour, t->tm_min, t->tm_sec);
  return String(buf);
}

void initWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("📶 Conectando a WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    Serial.print(".");
    delay(500);
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi conectado!");
    Serial.print("📍 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Error de conexión WiFi");
  }
}

// ================= CONTROL DE RELÉS =================
void controlarBomba() {
  bool rele1Activo = (digitalRead(RELE1_PIN) == LOW);
  bool rele2Activo = (digitalRead(RELE2_PIN) == LOW);
  
  digitalWrite(BOMBA_PIN, (rele1Activo || rele2Activo) ? LOW : HIGH);
}

void registrarHistorial(String sensor, String accion) {
  if (WiFi.status() != WL_CONNECTED || !firebaseReady) return;

  String ts = String(time(nullptr));
  String path = "/historial/" + ts;
  
  String jsonStr = "{";
  jsonStr += "\"fecha\":\"" + obtenerFecha() + "\",";
  jsonStr += "\"timestamp\":" + ts + ",";
  jsonStr += "\"sensor\":\"" + sensor + "\",";
  jsonStr += "\"accion\":\"" + accion + "\"";
  jsonStr += "}";

  Database.set<String>(aClient, path, jsonStr);
  Serial.printf("📝 Historial: [%s] %s\n", sensor.c_str(), accion.c_str());
}

void resetearComandosManuales(SensorData &s) {
  Database.set<bool>(aClient, s.firebasePath + "/manual_on", false);
  Database.set<bool>(aClient, s.firebasePath + "/manual_off", false);
  Database.set<String>(aClient, s.firebasePath + "/manual_cmd", "none");
}

// ================= CONTROL SENSOR CON DEBUG =================
void controlarSensor(SensorData &s, PendingAction &p, int humedad) {
  s.humedad = humedad;

  // 🐛 DEBUG: Mostrar valores actuales cada 5 segundos
  if (millis() - lastDebugPrint >= DEBUG_INTERVAL) {
    Serial.printf("\n🔍 %s DEBUG:\n", s.nombre.c_str());
    Serial.printf("   ├─ Humedad actual: %d%%\n", humedad);
    Serial.printf("   ├─ Humedad mínima: %d%%\n", s.humedadMin);
    Serial.printf("   ├─ Modo: %s\n", s.modo.c_str());
    Serial.printf("   ├─ Planta: %s\n", s.planta.c_str());
    Serial.printf("   └─ Estado relé: %s\n", digitalRead(s.relePin) == LOW ? "🟢 ON" : "⚫ OFF");
    
    if (s.humedadMin == 0) {
      Serial.printf("   ⚠️  WARNING: humedadMin = 0, riego automático deshabilitado\n");
    } else if (humedad < s.humedadMin) {
      Serial.printf("   ⚠️  ALERTA: Humedad BAJA (%d%% < %d%%) - Debería regar\n", humedad, s.humedadMin);
    }
    Serial.println();
  }

  if (s.modo == "manual") {
    // Procesar comando manual ON
    if (s.manualOn && !s.commandProcessed) {
      digitalWrite(s.relePin, LOW);
      controlarBomba();
      p.active = true;
      p.startTime = millis();
      p.action = "Manual ON - " + s.planta;
      s.manualOn = false;
      s.commandProcessed = true;
      s.lastManual = millis();
      resetearComandosManuales(s);
      Serial.printf("🔵 %s: Manual ON ejecutado\n", s.nombre.c_str());
    }
    
    // Procesar comando manual OFF
    if (s.manualOff && !s.commandProcessed) {
      digitalWrite(s.relePin, HIGH);
      controlarBomba();
      p.active = true;
      p.startTime = millis();
      p.action = "Manual OFF - " + s.planta;
      s.manualOff = false;
      s.commandProcessed = true;
      s.lastManual = millis();
      resetearComandosManuales(s);
      Serial.printf("🔴 %s: Manual OFF ejecutado\n", s.nombre.c_str());
    }

    // Timeout de modo manual → volver a automático
    if (millis() - s.lastManual > MANUAL_TIMEOUT) {
      s.modo = "auto";
      Database.set<String>(aClient, s.firebasePath + "/modo", "auto");
      registrarHistorial(s.nombre, "Fin modo manual → automático");
      Serial.printf("⏰ %s: Timeout - volviendo a modo automático\n", s.nombre.c_str());
    }

    // Ejecutar acción pendiente después de 5s
    if (p.active && millis() - p.startTime >= 5000) {
      registrarHistorial(s.nombre, p.action);
      p.active = false;
    }
  }
  else if (s.humedadMin > 0) {
    // Modo automático
    int estadoAnterior = digitalRead(s.relePin);
    int nuevoEstado = (humedad < s.humedadMin) ? LOW : HIGH;
    
    // 🐛 DEBUG: Notificar cuando se detecta humedad baja
    if (humedad < s.humedadMin && estadoAnterior == HIGH) {
      Serial.printf("⚠️  %s: Humedad BAJA detectada (%d%% < %d%%) - Activando riego\n", 
                    s.nombre.c_str(), humedad, s.humedadMin);
    }
    
    digitalWrite(s.relePin, nuevoEstado);
    controlarBomba();

    if (nuevoEstado != estadoAnterior) {
      String accion = String("Auto ") + (nuevoEstado == LOW ? "ON" : "OFF") + " - " + s.planta;
      registrarHistorial(s.nombre, accion);
      Serial.printf("🤖 %s: %s (Humedad: %d%% < %d%%)\n", 
                    s.nombre.c_str(), accion.c_str(), humedad, s.humedadMin);
    }
  } else {
    // 🐛 DEBUG: Avisar si humedadMin es 0
    static unsigned long lastWarning = 0;
    if (millis() - lastWarning > 10000) {  // Cada 10 segundos
      Serial.printf("⚠️  %s: humedadMin = 0, riego automático DESHABILITADO\n", s.nombre.c_str());
      lastWarning = millis();
    }
  }

  // Actualizar humedad y fecha en Firebase
  if (WiFi.status() == WL_CONNECTED && firebaseReady && s.humedad != s.lastSentHumedad) {
    Database.set<int>(aClient, s.firebasePath + "/humedad", s.humedad);
    Database.set<String>(aClient, s.firebasePath + "/fecha", obtenerFecha());
    s.lastSentHumedad = s.humedad;
  }
}

// ================= CALLBACK FIREBASE MEJORADO =================
void processData(AsyncResult &aResult) {
  if (aResult.isEvent()) {
    RealtimeDatabaseResult &RTDB = aResult.to<RealtimeDatabaseResult>();
    
    if (RTDB.isStream()) {
      String path = RTDB.dataPath();
      String data = RTDB.to<String>();
      
      // 🐛 DEBUG: Mostrar todos los cambios de Firebase
      Serial.printf("🔔 Stream Update: %s = %s\n", path.c_str(), data.c_str());
      
      // ===== SENSOR 1 =====
      if (path.indexOf("sensor1") >= 0) {
        if (path.endsWith("/planta")) {
          sensor1.planta = data;
          sensor1.planta.replace("\"", "");
          Serial.printf("🌱 Sensor1: Planta = %s\n", sensor1.planta.c_str());
        }
        else if (path.endsWith("/modo")) {
          sensor1.modo = data;
          sensor1.modo.replace("\"", "");
          Serial.printf("🔧 Sensor1: Modo = %s\n", sensor1.modo.c_str());
        }
        else if (path.endsWith("/manual_on")) {
          sensor1.manualOn = (data == "true");
          if (sensor1.manualOn) {
            sensor1.commandProcessed = false;
            Serial.println("▶️  Sensor1: Comando Manual ON recibido");
          }
        }
        else if (path.endsWith("/manual_off")) {
          sensor1.manualOff = (data == "true");
          if (sensor1.manualOff) {
            sensor1.commandProcessed = false;
            Serial.println("⏸️  Sensor1: Comando Manual OFF recibido");
          }
        }
        else if (path.endsWith("/humedad_minima")) {
          sensor1.humedadMin = data.toInt();
          Serial.printf("💧 Sensor1: Humedad Mínima = %d%%\n", sensor1.humedadMin);
        }
      }
      
      // ===== SENSOR 2 =====
      else if (path.indexOf("sensor2") >= 0) {
        if (path.endsWith("/planta")) {
          sensor2.planta = data;
          sensor2.planta.replace("\"", "");
          Serial.printf("🌱 Sensor2: Planta = %s\n", sensor2.planta.c_str());
        }
        else if (path.endsWith("/modo")) {
          sensor2.modo = data;
          sensor2.modo.replace("\"", "");
          Serial.printf("🔧 Sensor2: Modo = %s\n", sensor2.modo.c_str());
        }
        else if (path.endsWith("/manual_on")) {
          sensor2.manualOn = (data == "true");
          if (sensor2.manualOn) {
            sensor2.commandProcessed = false;
            Serial.println("▶️  Sensor2: Comando Manual ON recibido");
          }
        }
        else if (path.endsWith("/manual_off")) {
          sensor2.manualOff = (data == "true");
          if (sensor2.manualOff) {
            sensor2.commandProcessed = false;
            Serial.println("⏸️  Sensor2: Comando Manual OFF recibido");
          }
        }
        else if (path.endsWith("/humedad_minima")) {
          sensor2.humedadMin = data.toInt();
          Serial.printf("💧 Sensor2: Humedad Mínima = %d%%\n", sensor2.humedadMin);
        }
      }
    }
  }
  
  if (aResult.isError()) {
    Serial.printf("❌ Error Firebase: %s\n", aResult.error().message().c_str());
  }
}

// ================= CARGA INICIAL DE CONFIGURACIÓN =================
void cargarConfiguracionInicial() {
  Serial.println("\n📥 Cargando configuración inicial desde Firebase...");
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Leer configuración de sensor1
  Database.get(aClient, sensor1.firebasePath + "/planta", [](AsyncResult &result) {
    if (!result.isError()) {
      sensor1.planta = result.to<RealtimeDatabaseResult>().to<String>();
      sensor1.planta.replace("\"", "");
      Serial.printf("✅ Sensor1 - Planta: %s\n", sensor1.planta.c_str());
    }
  });
  
  Database.get(aClient, sensor1.firebasePath + "/humedad_minima", [](AsyncResult &result) {
    if (!result.isError()) {
      sensor1.humedadMin = result.to<RealtimeDatabaseResult>().to<int>();
      Serial.printf("✅ Sensor1 - Humedad Mínima: %d%%\n", sensor1.humedadMin);
    }
  });
  
  Database.get(aClient, sensor1.firebasePath + "/modo", [](AsyncResult &result) {
    if (!result.isError()) {
      sensor1.modo = result.to<RealtimeDatabaseResult>().to<String>();
      sensor1.modo.replace("\"", "");
      Serial.printf("✅ Sensor1 - Modo: %s\n", sensor1.modo.c_str());
    }
  });
  
  // Leer configuración de sensor2
  Database.get(aClient, sensor2.firebasePath + "/planta", [](AsyncResult &result) {
    if (!result.isError()) {
      sensor2.planta = result.to<RealtimeDatabaseResult>().to<String>();
      sensor2.planta.replace("\"", "");
      Serial.printf("✅ Sensor2 - Planta: %s\n", sensor2.planta.c_str());
    }
  });
  
  Database.get(aClient, sensor2.firebasePath + "/humedad_minima", [](AsyncResult &result) {
    if (!result.isError()) {
      sensor2.humedadMin = result.to<RealtimeDatabaseResult>().to<int>();
      Serial.printf("✅ Sensor2 - Humedad Mínima: %d%%\n", sensor2.humedadMin);
    }
  });
  
  Database.get(aClient, sensor2.firebasePath + "/modo", [](AsyncResult &result) {
    if (!result.isError()) {
      sensor2.modo = result.to<RealtimeDatabaseResult>().to<String>();
      sensor2.modo.replace("\"", "");
      Serial.printf("✅ Sensor2 - Modo: %s\n", sensor2.modo.c_str());
    }
  });
  
  // Esperar a que se procesen todas las lecturas usando app.loop()
  Serial.print("⏳ Procesando lecturas");
  for (int i = 0; i < 50; i++) {
    app.loop();
    Database.loop();
    Serial.print(".");
    delay(100);
  }
  
  Serial.println("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.println("📥 Configuración inicial cargada!\n");
  
  // Mostrar resumen
  Serial.println("📊 RESUMEN DE CONFIGURACIÓN:");
  Serial.printf("   Sensor1: Planta='%s', Min=%d%%, Modo=%s\n", 
                sensor1.planta.c_str(), sensor1.humedadMin, sensor1.modo.c_str());
  Serial.printf("   Sensor2: Planta='%s', Min=%d%%, Modo=%s\n\n", 
                sensor2.planta.c_str(), sensor2.humedadMin, sensor2.modo.c_str());
}

// ================= STREAMING FIREBASE =================
void setupFirebaseStream() {
  Database.get(streamClient, "/sensores", processData, true);
  Serial.println("🔥 Firebase Stream iniciado en /sensores");
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n╔═══════════════════════════════════════╗");
  Serial.println("║  Sistema de Riego Inteligente v2.1  ║");
  Serial.println("║  Con Debug y Carga Inicial Mejorada  ║");
  Serial.println("╚═══════════════════════════════════════╝\n");

  // Configurar pines
  pinMode(RELE1_PIN, OUTPUT);
  pinMode(RELE2_PIN, OUTPUT);
  pinMode(BOMBA_PIN, OUTPUT);
  digitalWrite(RELE1_PIN, HIGH);  // Relés apagados (activos en bajo)
  digitalWrite(RELE2_PIN, HIGH);
  digitalWrite(BOMBA_PIN, HIGH);

  initWiFi();

  // Configurar NTP
  Serial.print("🕐 Sincronizando reloj");
  configTime(-5 * 3600, 0, "pool.ntp.org", "time.nist.gov");
  int timeAttempts = 0;
  while (time(nullptr) < 100000 && timeAttempts < 15) { 
    Serial.print(".");
    delay(1000); 
    timeAttempts++; 
  }
  Serial.println(time(nullptr) >= 100000 ? " ✅" : " ⚠️ (continuar sin NTP)");

  // Configurar SSL
  ssl_client.setInsecure();
  stream_ssl_client.setInsecure();
  ssl_client.setConnectionTimeout(1000);
  ssl_client.setHandshakeTimeout(5);
  stream_ssl_client.setConnectionTimeout(1000);
  stream_ssl_client.setHandshakeTimeout(5);

  // Inicializar Firebase
  Serial.println("🔥 Inicializando Firebase...");
  initializeApp(aClient, app, getAuth(user_auth), processData, "authTask");
  app.getApp<RealtimeDatabase>(Database);
  Database.url(DATABASE_URL);
  
  // Esperar autenticación
  Serial.print("🔐 Autenticando");
  while (!app.ready()) {
    app.loop();
    Serial.print(".");
    delay(100);
  }
  
  Serial.println(" ✅");
  firebaseReady = true;
  
  // Iniciar streaming
  setupFirebaseStream();
  
  // ⭐ CARGAR CONFIGURACIÓN INICIAL
  cargarConfiguracionInicial();
  
  Serial.println("\n✨ Sistema listo - Iniciando monitoreo ✨\n");
}

// ================= LOOP =================
void loop() {
  app.loop();
  Database.loop();
  
  if (!app.ready()) return;

  // Actualizar timestamp de debug
  if (millis() - lastDebugPrint >= DEBUG_INTERVAL) {
    lastDebugPrint = millis();
  }

  // Leer sensores de humedad
  if (millis() - lastReadHumidity >= HUMIDITY_INTERVAL) {
    int h1 = constrain(map(analogRead(SENSOR1_PIN), 4095, 0, 0, 100), 0, 100);
    int h2 = constrain(map(analogRead(SENSOR2_PIN), 4095, 0, 0, 100), 0, 100);

    // Mostrar estado cada 3s
    if (millis() - lastPrintTime >= 3000) {
      Serial.printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      Serial.printf("💧 S1: %3d%% [%s] | S2: %3d%% [%s] | Planta: %s/%s\n",
                    h1, sensor1.modo.c_str(), h2, sensor2.modo.c_str(),
                    sensor1.planta.c_str(), sensor2.planta.c_str());
      Serial.printf("🔌 R1: %s | R2: %s | 💦 Bomba: %s\n",
                    digitalRead(RELE1_PIN) == LOW ? "🟢 ON " : "⚫ OFF",
                    digitalRead(RELE2_PIN) == LOW ? "🟢 ON " : "⚫ OFF",
                    digitalRead(BOMBA_PIN) == LOW ? "🟢 ON " : "⚫ OFF");
      Serial.printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
      lastPrintTime = millis();
    }

    // Controlar sensores
    controlarSensor(sensor1, pending1, h1);
    controlarSensor(sensor2, pending2, h2);

    lastReadHumidity = millis();
  }

  // Actualizar estado de relés en Firebase
  if (millis() - lastStatusUpdate >= STATUS_INTERVAL) {
    if (WiFi.status() == WL_CONNECTED && firebaseReady) {
      Database.set<int>(aClient, sensor1.firebasePath + "/rele_estado", digitalRead(RELE1_PIN));
      Database.set<int>(aClient, sensor2.firebasePath + "/rele_estado", digitalRead(RELE2_PIN));
      Database.set<int>(aClient, "/sistema/bomba_estado", digitalRead(BOMBA_PIN));
    }
    lastStatusUpdate = millis();
  }

  delay(10);
}
