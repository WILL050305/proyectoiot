#define ENABLE_USER_AUTH
#define ENABLE_DATABASE

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <FirebaseClient.h>
#include <ArduinoJson.h>
#include <time.h>

// ================= CONFIGURACIÓN =================
#define WIFI_SSID "Motog31"
#define WIFI_PASSWORD "antoniocardenas2005"

#define Web_API_KEY "AIzaSyCQfLe1P85eO0nIZOFPx-J5KmYu_qR26jI"
#define DATABASE_URL "https://iotb2-6aafe-default-rtdb.firebaseio.com"
#define USER_EMAIL "gabrielcardenassanchez80@gmail.com"
#define USER_PASS "gabriel0503"

#define SENSOR1_PIN 34
#define SENSOR2_PIN 35
#define RELE1_PIN 26
#define RELE2_PIN 27
#define BOMBA_PIN 25

// ================= CONFIGURACIÓN ANTI-REBOTE =================
// SOLUCIÓN 1: Histéresis (zona muerta)
#define HISTERESIS 5  // Porcentaje de diferencia para evitar oscilaciones

// SOLUCIÓN 2: Tiempo mínimo entre cambios
#define MIN_TIEMPO_CAMBIO 30000  // 30 segundos mínimo entre cambios automáticos

// SOLUCIÓN 3: Filtro de promedio
#define NUM_LECTURAS 5  // Número de lecturas para promediar

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
  int relePin;
  String nombre;
  String firebasePath;
  int lastSentHumedad = -1;
  bool commandProcessed = true;
  unsigned long lastStateChange = 0;
  
  // SOLUCIÓN 3: Array para filtro de promedio
  int lecturas[NUM_LECTURAS];
  int indiceLectura = 0;
  bool lecturasFilled = false;
};

SensorData sensor1 = {.relePin = RELE1_PIN, .nombre = "sensor1", .firebasePath = "/sensores/sensor1"};
SensorData sensor2 = {.relePin = RELE2_PIN, .nombre = "sensor2", .firebasePath = "/sensores/sensor2"};

// ================= VARIABLES GLOBALES =================
unsigned long lastReadHumidity = 0;
unsigned long lastStatusUpdate = 0;
unsigned long lastPrintTime = 0;

const unsigned long HUMIDITY_INTERVAL = 1000;
const unsigned long STATUS_INTERVAL = 15000;

bool firebaseReady = false;

// ================= FUNCIONES =================
void processData(AsyncResult &aResult);

String obtenerFecha() {
  time_t now = time(nullptr);
  if (now < 100000) return "Sin fecha";
  struct tm* t = localtime(&now);
  char buf[20];
  sprintf(buf, "%02d/%02d %02d:%02d:%02d", t->tm_mday, t->tm_mon+1, t->tm_hour, t->tm_min, t->tm_sec);
  return String(buf);
}

void initWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts++ < 30) {
    Serial.print(".");
    delay(500);
  }
  Serial.println(WiFi.status() == WL_CONNECTED ? " OK" : " FAIL");
}

void controlarBomba() {
  bool r1 = (digitalRead(RELE1_PIN) == LOW);
  bool r2 = (digitalRead(RELE2_PIN) == LOW);
  digitalWrite(BOMBA_PIN, (r1 || r2) ? LOW : HIGH);
}

void registrarHistorial(String sensor, String accion) {
  if (WiFi.status() != WL_CONNECTED || !firebaseReady) return;
  String ts = String(time(nullptr));
  String path = "/historial/" + ts;
  String json = "{\"fecha\":\""+obtenerFecha()+"\",\"timestamp\":"+ts+",\"sensor\":\""+sensor+"\",\"accion\":\""+accion+"\"}";
  Database.set<String>(aClient, path, json);
}

void resetearComandosManuales(SensorData &s) {
  Database.set<bool>(aClient, s.firebasePath + "/manual_on", false);
  Database.set<bool>(aClient, s.firebasePath + "/manual_off", false);
}

// ================= SOLUCIÓN 3: FILTRO DE PROMEDIO =================
int leerHumedadFiltrada(SensorData &s, int pin) {
  // Leer valor actual del sensor
  int lecturaActual = constrain(map(analogRead(pin), 4095, 0, 0, 100), 0, 100);
  
  // Guardar en el array circular
  s.lecturas[s.indiceLectura] = lecturaActual;
  s.indiceLectura = (s.indiceLectura + 1) % NUM_LECTURAS;
  
  // Marcar que ya se llenó el array (después de NUM_LECTURAS)
  if (s.indiceLectura == 0) {
    s.lecturasFilled = true;
  }
  
  // Calcular promedio
  int suma = 0;
  int numLecturas = s.lecturasFilled ? NUM_LECTURAS : s.indiceLectura;
  
  for(int i = 0; i < numLecturas; i++) {
    suma += s.lecturas[i];
  }
  
  return numLecturas > 0 ? suma / numLecturas : lecturaActual;
}

// ================= CONTROL SENSOR CON LAS 3 SOLUCIONES =================
void controlarSensor(SensorData &s, int humedad) {
  s.humedad = humedad;
  
  // Leer estado actual del relé
  int estadoActualPin = digitalRead(s.relePin);

  if (s.modo == "manual") {
    // MODO MANUAL (sin restricciones de tiempo)
    if (s.manualOn && !s.commandProcessed) {
      Serial.printf("\n>>> [%s] MANUAL ON EJECUTANDO <<<\n", s.nombre.c_str());
      Serial.printf("    Pin %d: %s -> LOW\n", s.relePin, estadoActualPin==LOW?"LOW":"HIGH");
      
      digitalWrite(s.relePin, LOW);
      controlarBomba();
      s.manualOn = false;
      s.commandProcessed = true;
      s.lastStateChange = millis();
      resetearComandosManuales(s);
      registrarHistorial(s.nombre, "Manual ON - " + s.planta);
      
      Serial.printf("    Estado final: %s\n", digitalRead(s.relePin)==LOW?"LOW":"HIGH");
      Serial.printf("    Timestamp: %lu ms\n\n", millis());
    }
    
    if (s.manualOff && !s.commandProcessed) {
      Serial.printf("\n>>> [%s] MANUAL OFF EJECUTANDO <<<\n", s.nombre.c_str());
      Serial.printf("    Pin %d: %s -> HIGH\n", s.relePin, estadoActualPin==LOW?"LOW":"HIGH");
      
      digitalWrite(s.relePin, HIGH);
      controlarBomba();
      s.manualOff = false;
      s.commandProcessed = true;
      s.lastStateChange = millis();
      resetearComandosManuales(s);
      registrarHistorial(s.nombre, "Manual OFF - " + s.planta);
      
      Serial.printf("    Estado final: %s\n", digitalRead(s.relePin)==LOW?"LOW":"HIGH");
      Serial.printf("    Timestamp: %lu ms\n\n", millis());
    }
  }
  else if (s.humedadMin > 0) {
    // MODO AUTOMÁTICO CON LAS 3 SOLUCIONES IMPLEMENTADAS
    
    // SOLUCIÓN 1: HISTÉRESIS - Determinar estado deseado con zona muerta
    int estadoDeseado = estadoActualPin; // Mantener estado actual por defecto
    
    if (estadoActualPin == HIGH) { 
      // Si está APAGADO, enciende solo si baja suficiente
      if (humedad < s.humedadMin - HISTERESIS) {
        estadoDeseado = LOW;
      }
    } else { 
      // Si está ENCENDIDO, apaga solo si sube suficiente
      if (humedad >= s.humedadMin + HISTERESIS) {
        estadoDeseado = HIGH;
      }
    }
    
    // SOLUCIÓN 2: TIEMPO MÍNIMO - Verificar si ha pasado suficiente tiempo
    unsigned long tiempoDesdeUltimoCambio = millis() - s.lastStateChange;
    bool puedeCambiar = (tiempoDesdeUltimoCambio >= MIN_TIEMPO_CAMBIO);
    
    // SOLO cambiar si es diferente Y ha pasado el tiempo mínimo
    if (estadoDeseado != estadoActualPin) {
      if (puedeCambiar) {
        Serial.printf("\n>>> [%s] AUTO CAMBIO DETECTADO <<<\n", s.nombre.c_str());
        Serial.printf("    Razón: Humedad %d%% (umbral:%d%% ±%d%%)\n", 
                      humedad, s.humedadMin, HISTERESIS);
        Serial.printf("    Pin %d: %s -> %s\n", s.relePin, 
                      estadoActualPin==LOW?"LOW":"HIGH",
                      estadoDeseado==LOW?"LOW":"HIGH");
        Serial.printf("    Hace %lu ms del último cambio\n", tiempoDesdeUltimoCambio);
        
        digitalWrite(s.relePin, estadoDeseado);
        controlarBomba();
        s.lastStateChange = millis();
        
        String accion = String("Auto ") + (estadoDeseado == LOW ? "ON" : "OFF") + " - " + s.planta;
        registrarHistorial(s.nombre, accion);
        
        Serial.printf("    Estado final: %s\n", digitalRead(s.relePin)==LOW?"LOW":"HIGH");
        Serial.printf("    Timestamp: %lu ms\n\n", millis());
      } else {
        // Cambio bloqueado por tiempo mínimo
        unsigned long tiempoRestante = MIN_TIEMPO_CAMBIO - tiempoDesdeUltimoCambio;
        Serial.printf("[%s] Cambio bloqueado - faltan %lu ms (H:%d%% U:%d%%±%d%%)\n", 
                      s.nombre.c_str(), tiempoRestante, humedad, s.humedadMin, HISTERESIS);
      }
    }
  }

  // Actualizar Firebase
  if (WiFi.status() == WL_CONNECTED && firebaseReady && s.humedad != s.lastSentHumedad) {
    Database.set<int>(aClient, s.firebasePath + "/humedad", s.humedad);
    Database.set<String>(aClient, s.firebasePath + "/fecha", obtenerFecha());
    s.lastSentHumedad = s.humedad;
  }
}

// ================= CALLBACK FIREBASE CON DEBUG =================
void processData(AsyncResult &aResult) {
  if (aResult.isEvent()) {
    RealtimeDatabaseResult &RTDB = aResult.to<RealtimeDatabaseResult>();
    if (RTDB.isStream()) {
      String path = RTDB.dataPath();
      String data = RTDB.to<String>();
      
      // MOSTRAR TODOS LOS CAMBIOS DE FIREBASE
      Serial.printf("FIREBASE >> %s = %s\n", path.c_str(), data.c_str());
      
      SensorData* s = nullptr;
      if (path.indexOf("sensor1") >= 0) s = &sensor1;
      else if (path.indexOf("sensor2") >= 0) s = &sensor2;
      
      if (s) {
        if (path.endsWith("/planta")) { 
          s->planta = data; 
          s->planta.replace("\"", "");
          Serial.printf("   -> Planta de %s cambiada a: %s\n", s->nombre.c_str(), s->planta.c_str());
        }
        else if (path.endsWith("/modo")) { 
          String modoAnterior = s->modo;
          s->modo = data; 
          s->modo.replace("\"", "");
          Serial.printf("   -> Modo de %s: %s -> %s\n", s->nombre.c_str(), modoAnterior.c_str(), s->modo.c_str());
        }
        else if (path.endsWith("/manual_on")) { 
          s->manualOn = (data == "true"); 
          s->commandProcessed = !s->manualOn;
          if (s->manualOn) {
            Serial.printf("   -> Comando MANUAL ON recibido para %s\n", s->nombre.c_str());
          }
        }
        else if (path.endsWith("/manual_off")) { 
          s->manualOff = (data == "true"); 
          s->commandProcessed = !s->manualOff;
          if (s->manualOff) {
            Serial.printf("   -> Comando MANUAL OFF recibido para %s\n", s->nombre.c_str());
          }
        }
        else if (path.endsWith("/humedad_minima")) {
          int minAnterior = s->humedadMin;
          s->humedadMin = data.toInt();
          Serial.printf("   -> Humedad mínima de %s: %d%% -> %d%%\n", s->nombre.c_str(), minAnterior, s->humedadMin);
        }
      }
    }
  }
}

void cargarConfiguracionInicial() {
  Serial.println("Cargando config...");
  
  Database.get(aClient, sensor1.firebasePath+"/planta", [](AsyncResult &r){
    if(!r.isError()){ sensor1.planta=r.to<RealtimeDatabaseResult>().to<String>(); sensor1.planta.replace("\"",""); }
  });
  Database.get(aClient, sensor1.firebasePath+"/humedad_minima", [](AsyncResult &r){
    if(!r.isError()) sensor1.humedadMin=r.to<RealtimeDatabaseResult>().to<int>();
  });
  Database.get(aClient, sensor1.firebasePath+"/modo", [](AsyncResult &r){
    if(!r.isError()){ sensor1.modo=r.to<RealtimeDatabaseResult>().to<String>(); sensor1.modo.replace("\"",""); }
  });
  
  Database.get(aClient, sensor2.firebasePath+"/planta", [](AsyncResult &r){
    if(!r.isError()){ sensor2.planta=r.to<RealtimeDatabaseResult>().to<String>(); sensor2.planta.replace("\"",""); }
  });
  Database.get(aClient, sensor2.firebasePath+"/humedad_minima", [](AsyncResult &r){
    if(!r.isError()) sensor2.humedadMin=r.to<RealtimeDatabaseResult>().to<int>();
  });
  Database.get(aClient, sensor2.firebasePath+"/modo", [](AsyncResult &r){
    if(!r.isError()){ sensor2.modo=r.to<RealtimeDatabaseResult>().to<String>(); sensor2.modo.replace("\"",""); }
  });
  
  for(int i=0; i<50; i++) { app.loop(); Database.loop(); delay(100); }
  
  Serial.printf("S1: %s (%d%%, modo:%s)  S2: %s (%d%%, modo:%s)\n\n", 
    sensor1.planta.c_str(), sensor1.humedadMin, sensor1.modo.c_str(),
    sensor2.planta.c_str(), sensor2.humedadMin, sensor2.modo.c_str());
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== Sistema Riego v3.0 - ANTI-REBOTE ===");
  Serial.printf("Configuración:\n");
  Serial.printf("  - Histéresis: ±%d%%\n", HISTERESIS);
  Serial.printf("  - Tiempo mínimo: %lu ms\n", MIN_TIEMPO_CAMBIO);
  Serial.printf("  - Filtro promedio: %d lecturas\n\n", NUM_LECTURAS);

  pinMode(RELE1_PIN, OUTPUT);
  pinMode(RELE2_PIN, OUTPUT);
  pinMode(BOMBA_PIN, OUTPUT);
  digitalWrite(RELE1_PIN, HIGH);
  digitalWrite(RELE2_PIN, HIGH);
  digitalWrite(BOMBA_PIN, HIGH);
  
  // Inicializar arrays de lecturas en cero
  for(int i=0; i<NUM_LECTURAS; i++) {
    sensor1.lecturas[i] = 0;
    sensor2.lecturas[i] = 0;
  }

  initWiFi();

  Serial.print("Sincronizando NTP");
  configTime(-5*3600, 0, "pool.ntp.org");
  for(int i=0; i<15 && time(nullptr)<100000; i++) { Serial.print("."); delay(1000); }
  Serial.println(" OK");

  ssl_client.setInsecure();
  stream_ssl_client.setInsecure();

  Serial.print("Conectando Firebase");
  initializeApp(aClient, app, getAuth(user_auth), processData, "auth");
  app.getApp<RealtimeDatabase>(Database);
  Database.url(DATABASE_URL);
  
  while (!app.ready()) { app.loop(); Serial.print("."); delay(100); }
  Serial.println(" OK");
  
  firebaseReady = true;
  Database.get(streamClient, "/sensores", processData, true);
  
  cargarConfiguracionInicial();
  Serial.println("=== Sistema Listo - Monitoreando cambios ===\n");
}

// ================= LOOP =================
void loop() {
  app.loop();
  Database.loop();
  if (!app.ready()) return;

  if (millis() - lastReadHumidity >= HUMIDITY_INTERVAL) {
    // SOLUCIÓN 3: Usar filtro de promedio para las lecturas
    int h1 = leerHumedadFiltrada(sensor1, SENSOR1_PIN);
    int h2 = leerHumedadFiltrada(sensor2, SENSOR2_PIN);

    // Mostrar estado cada 5s
    if (millis() - lastPrintTime >= 5000) {
      Serial.printf("[%lu ms] S1:%d%% S2:%d%% | R1:%s R2:%s | Modo: S1=%s S2=%s\n",
        millis(),
        h1, h2,
        digitalRead(RELE1_PIN)==LOW?"ON":"--",
        digitalRead(RELE2_PIN)==LOW?"ON":"--",
        sensor1.modo.c_str(),
        sensor2.modo.c_str());
      lastPrintTime = millis();
    }

    controlarSensor(sensor1, h1);
    controlarSensor(sensor2, h2);
    lastReadHumidity = millis();
  }

  if (millis() - lastStatusUpdate >= STATUS_INTERVAL) {
    if (WiFi.status() == WL_CONNECTED && firebaseReady) {
      Database.set<int>(aClient, sensor1.firebasePath+"/rele_estado", digitalRead(RELE1_PIN));
      Database.set<int>(aClient, sensor2.firebasePath+"/rele_estado", digitalRead(RELE2_PIN));
      Database.set<int>(aClient, "/sistema/bomba_estado", digitalRead(BOMBA_PIN));
    }
    lastStatusUpdate = millis();
  }

  delay(10);
}
