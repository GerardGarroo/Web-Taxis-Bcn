
/* global __app_id, __initial_auth_token */ // Eliminado __firebase_config de aquí

// Importa las funciones necesarias del SDK de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Define appId para que sea accesible. Utiliza __app_id del entorno de Canvas si está disponible.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Configuración de Firebase.
// Si estás en el entorno de Canvas, usará __firebase_config.
// Si estás desarrollando localmente, DEBES REEMPLAZAR ESTOS VALORES CON TUS PROPIOS REALES DE FIREBASE.
const firebaseConfig = {
  apiKey: "AIzaSyByiTOwTgwILDccVKfrcNcQGRNnJP1ZY00",
  authDomain: "taxis-bcn.firebaseapp.com",
  projectId: "taxis-bcn",
  storageBucket: "taxis-bcn.firebasestorage.app",
  messagingSenderId: "533003215921",
  appId: "1:533003215921:web:f534385e00ce15baf9a110"
};

// initialAuthToken es proporcionado por el entorno de Canvas para la autenticación inicial.
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inicializa la aplicación Firebase con la configuración proporcionada
// Si 'app' no estaba definida antes, este es el punto donde se crea.
const app = initializeApp(firebaseConfig);

// Obtiene la instancia de autenticación de Firebase a partir de la app inicializada
const auth = getAuth(app);

// Obtiene la instancia de Firestore (base de datos) a partir de la app inicializada
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
// Asegúrate de que 'app', 'auth', 'db', 'initializeFirebaseAuth', 'appId' estén correctamente definidas arriba.
export { app, auth, db, initializeFirebaseAuth, appId };





