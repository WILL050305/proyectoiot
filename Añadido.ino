// === SOLO SE MODIFICÓ controlarSensor() ===
// === TODO LO DEMÁS ES TU MISMO CÓDIGO ===

void controlarSensor(SensorData &s, PendingAction &p, int humedad) {
  s.humedad = humedad;

  if (s.modo == "manual") {

    if (s.manualOn && !s.commandProcessed) {
      digitalWrite(s.relePin, LOW);
      controlarBomba();
      s.commandProcessed = true;
      s.manualOn = false;
      s.lastManual = millis();
      resetearComandosManuales(s);
      Serial.printf("🔵 %s: Manual ON\n", s.nombre.c_str());
    }

    if (s.manualOff && !s.commandProcessed) {
      digitalWrite(s.relePin, HIGH);
      controlarBomba();
      s.commandProcessed = true;
      s.manualOff = false;
      s.lastManual = millis();
      resetearComandosManuales(s);
      Serial.printf("🔴 %s: Manual OFF\n", s.nombre.c_str());
    }

    // 🔥 FIX REAL: solo timeout si hubo acción manual
    if (s.lastManual > 0 && millis() - s.lastManual > MANUAL_TIMEOUT) {
      s.modo = "auto";
      s.lastManual = 0;
      Database.set<String>(aClient, s.firebasePath + "/modo", "auto");
      Serial.printf("⏰ %s: Fin modo manual → auto\n", s.nombre.c_str());
    }
  }
  else {
    // 🔥 MODO AUTOMÁTICO ESTABLE (NO SE INTERRUMPE)
    if (s.humedadMin > 0) {
      if (humedad < s.humedadMin) {
        digitalWrite(s.relePin, LOW);   // Mantener ON
      } else {
        digitalWrite(s.relePin, HIGH);  // Apagar solo si supera mínimo
      }
      controlarBomba();
    }
  }

  // Actualizar humedad
  if (firebaseReady && s.humedad != s.lastSentHumedad) {
    Database.set<int>(aClient, s.firebasePath + "/humedad", s.humedad);
    Database.set<String>(aClient, s.firebasePath + "/fecha", obtenerFecha());
    s.lastSentHumedad = s.humedad;
  }
}
