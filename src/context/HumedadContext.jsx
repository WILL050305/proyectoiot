import { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebase/config';
import { ref, onValue, update } from 'firebase/database';

const HumedadContext = createContext();

export const useHumedad = () => {
  const context = useContext(HumedadContext);
  if (!context) {
    throw new Error('useHumedad debe usarse dentro de HumedadProvider');
  }
  return context;
};

export const HumedadProvider = ({ children }) => {
  const [sensores, setSensores] = useState({
    sensor1: null,
    sensor2: null
  });
  const [plantas, setPlantas] = useState({});
  const [historial, setHistorial] = useState([]);
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [isOnline, setIsOnline] = useState({
    sensor1: false,
    sensor2: false
  });

  // Escuchar cambios en sensores
  useEffect(() => {
    console.log('🔥 Conectando a Firebase Realtime Database...');
    const sensoresRef = ref(database, 'sensores');
    const unsubscribe = onValue(sensoresRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📊 Datos recibidos de Firebase:', data);
      if (data) {
        setSensores(data);
        
        // Verificar estado online (si recibió datos en los últimos 15 segundos)
        const now = Date.now();
        const checkOnline = (sensorData) => {
          if (!sensorData || !sensorData.fecha) return false;
          const sensorTime = new Date(sensorData.fecha).getTime();
          return (now - sensorTime) < 15000; // 15 segundos
        };
        
        setIsOnline({
          sensor1: checkOnline(data.sensor1),
          sensor2: checkOnline(data.sensor2)
        });
        
        console.log('✅ Sensores actualizados:', {
          sensor1: { planta: data.sensor1?.planta, humedad: data.sensor1?.humedad, rele: data.sensor1?.rele_estado },
          sensor2: { planta: data.sensor2?.planta, humedad: data.sensor2?.humedad, rele: data.sensor2?.rele_estado }
        });
      } else {
        console.warn('⚠️ No hay datos en Firebase');
      }
    }, (error) => {
      console.error('❌ Error al conectar con Firebase:', error);
    });

    return () => unsubscribe();
  }, []);

  // Escuchar cambios en plantas
  useEffect(() => {
    const plantasRef = ref(database, 'plantas');
    const unsubscribe = onValue(plantasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlantas(data);
      }
    });

    return () => unsubscribe();
  }, []);

  // Escuchar cambios en historial
  useEffect(() => {
    const historialRef = ref(database, 'historial');
    const unsubscribe = onValue(historialRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const historialArray = Object.values(data)
          .filter(item => item.timestamp && item.timestamp > 1700000000)
          .sort((a, b) => a.timestamp - b.timestamp);
        setHistorial(historialArray);
      }
    });

    return () => unsubscribe();
  }, []);

  // Verificar estado online cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (sensores.sensor1 || sensores.sensor2) {
        const now = Date.now();
        const checkOnline = (sensorData) => {
          if (!sensorData || !sensorData.fecha) return false;
          const sensorTime = new Date(sensorData.fecha).getTime();
          return (now - sensorTime) < 15000;
        };
        
        setIsOnline({
          sensor1: checkOnline(sensores.sensor1),
          sensor2: checkOnline(sensores.sensor2)
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sensores]);

  // Función para activar/desactivar riego
  // Recibe nuevoEstado: 0 = encender (LOW), 1 = apagar (HIGH)
  const toggleRiego = async (sensorId, nuevoEstado) => {
    try {
      const updates = {};
      
      // Si nuevoEstado es 0 → Encender riego (manual_on = true)
      // Si nuevoEstado es 1 → Apagar riego (manual_off = true)
      if (nuevoEstado === 0) {
        updates[`sensores/${sensorId}/manual_on`] = true;
        updates[`sensores/${sensorId}/manual_off`] = false;
        console.log(`🚿 Activando riego para ${sensorId}`);
      } else {
        updates[`sensores/${sensorId}/manual_on`] = false;
        updates[`sensores/${sensorId}/manual_off`] = true;
        console.log(`💧 Desactivando riego para ${sensorId}`);
      }
      
      console.log('📤 Enviando a Firebase:', updates);
      await update(ref(database), updates);
      console.log('✅ Actualización exitosa en Firebase');
    } catch (error) {
      console.error('❌ Error al actualizar riego:', error);
      throw error;
    }
  };

  const value = {
    sensores,
    plantas,
    historial,
    datosGrafico,
    setDatosGrafico,
    isOnline,
    toggleRiego
  };

  return (
    <HumedadContext.Provider value={value}>
      {children}
    </HumedadContext.Provider>
  );
};
