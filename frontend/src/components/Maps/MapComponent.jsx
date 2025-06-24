
import React, { useRef, useEffect, useState } from 'react';

/**
 * MapComponent
 *
 * Componente que renderiza un mapa de Google Maps.
 * Utiliza la API de Google Maps JavaScript para mostrar un mapa centrado en una ubicación inicial.
 *
 * NOTA: Para que este componente funcione correctamente, debes cargar la API de Google Maps
 * en tu archivo public/index.html y proporcionar tu API Key.
 * Ejemplo de cómo cargar la API en index.html (dentro de <head> o antes de </body>):
 * <script async defer src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY_DE_GOOGLE_MAPS&libraries=places"></script>
 * Reemplaza 'TU_API_KEY_DE_GOOGLE_MAPS' con tu clave real.
 * La librería 'places' es opcional pero útil para autocompletado de direcciones.
 *
 * @param {object} props - Propiedades del componente.
 * @param {object} [props.center={ lat: 41.3851, lng: 2.1734 }] - Coordenadas iniciales del centro del mapa (por defecto: Barcelona).
 * @param {number} [props.zoom=14] - Nivel de zoom inicial del mapa.
 */
const MapComponent = ({ center = { lat: 41.3851, lng: 2.1734 }, zoom = 14 }) => {
  // useRef para mantener una referencia al elemento div donde se renderizará el mapa.
  const mapRef = useRef(null);
  // useState para saber si la API de Google Maps se ha cargado.
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Función para inicializar el mapa una vez que la API de Google Maps esté disponible.
    const initMap = () => {
      // Verifica si 'google' y 'google.maps' están disponibles globalmente.
      if (window.google && window.google.maps) {
        setMapLoaded(true); // Marca la API como cargada
        // Crea una nueva instancia de Google Map y la adjunta al div referenciado por mapRef.
        // Las opciones incluyen el centro inicial y el nivel de zoom.
        new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
          disableDefaultUI: false, // Puedes deshabilitar la UI por defecto si quieres personalizarla.
        });
        console.log("Google Map initialized.");
      } else {
        console.warn("Google Maps API no disponible. Reintentando...");
        // Reintentar si la API no está lista, útil si se carga asíncronamente
        setTimeout(initMap, 500);
      }
    };

    // Llama a initMap cuando el componente se monta.
    // También escuchamos el evento 'load' en la ventana por si la API se carga después del montaje.
    if (document.readyState === 'complete' || window.google?.maps) {
      initMap();
    } else {
      window.addEventListener('load', initMap);
      return () => window.removeEventListener('load', initMap);
    }

  }, [center, zoom]); // Las dependencias aseguran que el efecto se ejecute si cambian el centro o el zoom.

  // Si el mapa aún no ha cargado, se muestra un mensaje de carga.
  if (!mapLoaded) {
    return (
      <div className="map-loading-container">
        <p>Cargando mapa...</p>
      </div>
    );
  }

  // Renderiza un div que actuará como contenedor para el mapa de Google.
  return (
    <div
      ref={mapRef} // Asigna la referencia al div
      className="map-container" // Clase CSS para estilizar el mapa
      style={{ width: '100%', height: 'calc(100vh - 100px)' }} // Estilo en línea para que el mapa ocupe espacio
    />
  );
};

export default MapComponent;
