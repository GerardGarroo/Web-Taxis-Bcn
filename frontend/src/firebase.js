
/* global __app_id, __firebase_config, __initial_auth_token */

// Importa las funciones necesarias del SDK de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth'; // Eliminado onAuthStateChanged de aquí
import { getFirestore } from 'firebase/firestore';

// Define las variables globales que Canvas proporciona para la configuración de Firebase
// __app_id: ID de la aplicación, útil para estructurar datos en Firestore si usas colecciones públicas/privadas.
// __firebase_config: Objeto de configuración JSON para inicializar Firebase.
// __initial_auth_token: Token de autenticación inicial para iniciar sesión.

// Verifica si las variables globales están definidas. Si no, usa valores por defecto (solo para desarrollo local si no están inyectadas).
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  // Configuración de Firebase de ejemplo (reemplaza con tus propias credenciales si no estás en Canvas)
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inicializa la aplicación Firebase con la configuración proporcionada
const app = initializeApp(firebaseConfig);

// Obtiene la instancia de autenticación de Firebase
const auth = getAuth(app);

// Obtiene la instancia de Firestore (base de datos)
const db = getFirestore(app);

// Función para manejar el inicio de sesión inicial
// Esta función se llamará al inicio de la aplicación para autenticar al usuario
// ya sea con un token personalizado (proporcionado por Canvas) o de forma anónima.
const initializeFirebaseAuth = async () => {
  try {
    if (initialAuthToken) {
      // Si hay un token de autenticación inicial, úsalo para iniciar sesión
      await signInWithCustomToken(auth, initialAuthToken);
      console.log("Sesión iniciada con token personalizado.");
    } else {
      // Si no hay token, inicia sesión de forma anónima
      await signInAnonymously(auth);
      console.log("Sesión iniciada de forma anónima.");
    }
  } catch (error) {
    console.error("Error al inicializar la autenticación de Firebase:", error);
    // Aquí podrías mostrar un mensaje al usuario o intentar de nuevo
  }
};

// Exporta las instancias de Firebase para que puedan ser utilizadas en otros archivos
export { app, auth, db, initializeFirebaseAuth, appId };

