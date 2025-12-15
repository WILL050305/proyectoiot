/**
 * SERVICIO: AuthService
 * Maneja la autenticación con Firebase
 */

import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase/config';

const auth = getAuth(app);

// Credenciales del usuario autorizado
const CREDENTIALS = {
  email: 'gabrielcardenassanchez80@gmail.com',
  password: 'gabriel0503'
};

export class AuthService {
  /**
   * Iniciar sesión automáticamente
   */
  static async autoLogin() {
    try {
      console.log('🔐 Intentando autenticación automática...');
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        CREDENTIALS.email, 
        CREDENTIALS.password
      );
      console.log('✅ Usuario autenticado:', userCredential.user.uid);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ Error de autenticación:', error);
      return { success: false, error };
    }
  }

  /**
   * Verificar estado de autenticación
   */
  static onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Obtener usuario actual
   */
  static getCurrentUser() {
    return auth.currentUser;
  }
}

export default AuthService;
