
import React, { useRef, useEffect, useState } from 'react';

/**
 * MapComponent
 *
 * Componente que renderiza un mapa de Google Maps y gestiona el autocompletado de direcciones.
 * Utiliza la API de Google Maps JavaScript para mostrar un mapa, inicializar autocompletados
 * en campos de entrada específicos y opcionalmente mostrar marcadores.
 *
 * NOTA: Para que este componente funcione correctamente, debes cargar la API de Google Maps
 * en tu archivo public/index.html y proporcionar tu API Key. Asegúrate de incluir la librería 'places'.
 * Ejemplo de cómo cargar la API en index.html (antes de </body>):
 * <script async defer src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY_DE_GOOGLE_MAPS&libraries=places"></script>
 *
 * @param {object} props - Propiedades del componente.
 * @param {object} [props.center={ lat: 41.3851, lng: 2.1734 }] - Coordenadas iniciales del centro del mapa (por defecto: Barcelona).
 * @param {number} [props.zoom=14] - Nivel de zoom inicial del mapa.
 * @param {string[]} [props.autocompleteInputIds=[]] - Array de IDs de los inputs donde se activará el autocompletado.
 * @param {function} [props.onPlaceSelected] - Callback que se ejecuta cuando se selecciona un lugar en el autocompletado.
 * Recibe como argumento un objeto con { address, lat, lng, placeId }.
 */
const MapComponent = ({
  center = { lat: 41.3851, lng: 2.1734 },
  zoom = 14,
  autocompleteInputIds = [],
  onPlaceSelected
}) => {
  const mapRef = useRef(null);
  // CAMBIO CLAVE: Usa useRef para la instancia del mapa para evitar re-renderizaciones innecesarias.
  const mapInstanceRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const autocompleteInstances = useRef([]);
  const markers = useRef({});

  useEffect(() => {
    const initMapAndAutocomplete = () => {
      // SOLO intenta inicializar si mapRef.current NO es null y si el mapa no ha sido inicializado antes.
      if (mapRef.current && window.google && window.google.maps && !mapInitialized) {
        // Inicializa el mapa
        const map = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
          disableDefaultUI: false,
        });
        // Guarda la instancia del mapa en el ref
        mapInstanceRef.current = map;
        setMapInitialized(true);
        console.log("Google Map initialized.");

        // Inicializa el autocompletado para los inputs provistos
        autocompleteInputIds.forEach(id => {
          const input = document.getElementById(id);
          if (input) {
            const autocomplete = new window.google.maps.places.Autocomplete(input, {
              fields: ["address_components", "geometry", "name", "formatted_address", "place_id"], // Asegura que place_id esté incluido
              componentRestrictions: { country: ["es"] } // Restringe a España, puedes quitarlo si quieres global
            });

            autocomplete.addListener("place_changed", () => {
              const place = autocomplete.getPlace();
              if (!place.geometry || !place.geometry.location) { // Verificar también place.geometry.location
                // El usuario no seleccionó una sugerencia válida o la entrada no tiene datos geográficos.
                console.warn("No hay detalles de ubicación disponibles para la entrada: '" + (place.name || place.formatted_address || '') + "'");
                if (onPlaceSelected) { // Llama al callback incluso si no hay geolocalización, para limpiar el estado si es necesario
                  onPlaceSelected({ id: id, address: place.formatted_address || place.name || '', lat: null, lng: null, placeId: place.place_id || null });
                }
                return;
              }

              // Centra el mapa en el lugar seleccionado usando la instancia del mapa desde el ref
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setCenter(place.geometry.location);
                mapInstanceRef.current.setZoom(16); // Un zoom más cercano para la ubicación seleccionada
              }


              // Opcional: añade o actualiza un marcador para el lugar
              const markerKey = id; // Usa el ID del input como clave para el marcador
              if (markers.current[markerKey]) {
                markers.current[markerKey].setMap(null); // Elimina el marcador anterior si existe
              }
              const newMarker = new window.google.maps.Marker({
                map: mapInstanceRef.current, // Usar la instancia del mapa desde el ref
                position: place.geometry.location,
                title: place.formatted_address,
              });
              markers.current[markerKey] = newMarker; // Guarda el nuevo marcador

              // Llama al callback con la información del lugar seleccionado
              if (onPlaceSelected) {
                onPlaceSelected({
                  id: id, // Para saber qué campo fue el que seleccionó el lugar
                  address: place.formatted_address,
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                  placeId: place.place_id,
                  // Puedes añadir más detalles si los necesitas, ej: place.address_components
                });
              }
            });
            autocompleteInstances.current.push(autocomplete);
          } else {
            console.warn(`Input con ID '${id}' no encontrado para autocompletado.`);
          }
        });
      }
    };

    const checkIfGoogleMapsIsReady = () => {
      // Verifica si el script de Google Maps está cargado Y si mapRef.current no es null.
      // mapRef.current es null hasta que React realmente renderiza el div.
      if (window.google && window.google.maps && mapRef.current) {
        initMapAndAutocomplete();
      } else {
        // Reintentar hasta que ambos estén disponibles
        setTimeout(checkIfGoogleMapsIsReady, 100);
      }
    };

    checkIfGoogleMapsIsReady();

    // Función de limpieza para cuando el componente se desmonta (o se "reinicia" en StrictMode)
    return () => {
      // Limpieza de marcadores
      Object.values(markers.current).forEach(marker => marker.setMap(null));
      markers.current = {};
      
      // Limpieza de instancias de autocompletado
      // No hay un método 'destroy' para Autocomplete, pero sus listeners se limpian al quitar los inputs.
      autocompleteInstances.current = [];

      // CRÍTICO: Detach the Google Map instance from its DOM element.
      // Esto previene el error 'removeChild' en StrictMode al permitir que React maneje el DOM
      // sin que Google Maps lo siga controlando.
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setDiv(null); // Desvincula el mapa de su div
        mapInstanceRef.current = null; // Limpia la referencia al mapa
      }
    };
    // Dependencias del useEffect: Solo si estas cambian, el efecto se re-ejecutará.
    // mapInstance ya no es una dependencia porque ahora es un ref.
  }, [center, zoom, mapInitialized, autocompleteInputIds, onPlaceSelected]);

  return (
    // Hemos movido el mensaje de carga fuera del div con mapRef,
    // y lo hemos hecho condicionalmente visible con un estilo.
    <div className="map-container-wrapper"> {/* Nuevo div contenedor */}
      <div
        ref={mapRef} // Asigna la referencia al div. ESTO ES CLAVE.
        className="map-container" // Clase CSS para estilizar el mapa
        style={{ opacity: mapInitialized ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }} // Oculta el mapa hasta que se inicialice
      />
      {!mapInitialized && (
        <div className="map-loading-overlay">
          <p>Cargando mapa...</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
