
/* global __app_id */ // Añadimos esta línea para que ESLint reconozca __app_id como global

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; // Importa onAuthStateChanged de firebase/auth
import { auth, db, initializeFirebaseAuth } from '../firebase'; // Importa la instancia de auth y la función de inicialización de firebase.js
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Importa funciones de Firestore para obtener y AHORA setDoc

// Crea el contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación fácilmente
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor de autenticación que envolverá nuestra aplicación
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Estado para el usuario actualmente autenticado
  const [loading, setLoading] = useState(true); // Estado para saber si la autenticación está inicializando
  const [userId, setUserId] = useState(null); // Estado para el ID del usuario

  // Define appId aquí para que sea accesible dentro del AuthProvider y pase el linter
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  useEffect(() => {
    // 1. Inicializa la autenticación de Firebase al cargar la aplicación
    // Esta función maneja el signInWithCustomToken o signInAnonymously
    initializeFirebaseAuth().then(() => {
      console.log("Firebase Auth Initialization complete.");
    }).catch(error => {
      console.error("Error during Firebase Auth Initialization:", error);
    });

    // 2. Establece un listener para los cambios en el estado de autenticación de Firebase
    // onAuthStateChanged se dispara cuando el usuario inicia o cierra sesión, o al inicio de la app
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Si hay un usuario (logeado), lo establece como el currentUser
      if (user) {
        // Asegúrate de que el userId se obtenga del user de Firebase Auth
        const currentUserId = user.uid;
        setUserId(currentUserId);

        // Intenta obtener el rol del usuario desde Firestore
        try {
          // La ruta sigue la estructura de datos privados: /artifacts/{appId}/users/{userId}/users/{documentId}
          const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/users`, user.uid);

          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setCurrentUser({ ...user, ...userDoc.data(), userId: currentUserId });
          } else {
            // Si el documento del usuario no existe, asigna un rol por defecto y crea el documento
            // Esto puede pasar si el usuario se autentica pero aún no tiene datos adicionales en Firestore
            const defaultUserData = {
              email: user.email,
              role: 'client', // Rol por defecto si no se encuentra
              createdAt: new Date(),
              profileImageUrl: '',
              isVerified: false,
              isOnboarded: false,
            };
            // Usamos setDoc para crear el documento con los datos por defecto
            await setDoc(userDocRef, defaultUserData);
            setCurrentUser({ ...user, ...defaultUserData, userId: currentUserId });
            console.warn("Documento de usuario no encontrado en Firestore. Asignando rol 'client' y creando documento.");
          }
        } catch (error) {
          console.error("Error al obtener o crear datos del usuario desde Firestore:", error);
          setCurrentUser({ ...user, role: 'client', userId: currentUserId }); // Fallback a rol 'client' si hay error
        }
      } else {
        // Si no hay usuario (sesión cerrada), establece currentUser a null
        setCurrentUser(null);
        setUserId(null);
      }
      setLoading(false); // La carga inicial de autenticación ha terminado
    });

    // Limpia el listener cuando el componente se desmonta para evitar fugas de memoria
    return () => unsubscribe();
  }, [appId]); // AÑADIDO: appId como dependencia del useEffect
  // El array asegura que este efecto se ejecute solo una vez al montar el componente,
  // pero también si appId cambiara (aunque en este caso es constante).

  // Valor que será proporcionado a todos los componentes hijos
  const value = {
    currentUser,
    userId, // Exporta el userId para que sea fácilmente accesible
    loading,
    auth, // Exporta la instancia de auth para facilitar operaciones como signInWithEmailAndPassword, etc.
    db, // Exporta la instancia de db para interactuar con Firestore
    appId // Exporta appId para que otros componentes puedan construir rutas de Firestore
  };

  // Solo renderiza los componentes hijos cuando la autenticación haya terminado de cargar
  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Renderiza los hijos solo si no está cargando */}
      {loading && (
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl font-semibold text-gray-700">Cargando aplicación...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};
