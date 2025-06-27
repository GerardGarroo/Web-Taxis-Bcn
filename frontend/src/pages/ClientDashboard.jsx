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
 * Recibe como argumento un objeto con { address, lat, lng, type }.
 */
const MapComponent = ({
  center = { lat: 41.3851, lng: 2.1734 },
  zoom = 14,
  autocompleteInputIds = [],
  onPlaceSelected
}) => {
  const mapRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapInstance, setMapInstance] = useState(null); // Para guardar la instancia del mapa
  const autocompleteInstances = useRef([]); // Para guardar las instancias de Autocomplete
  const markers = useRef({}); // Para guardar referencias a los marcadores (ej: pickup, destination)

  useEffect(() => {
    const initMapAndAutocomplete = () => {
      if (mapRef.current && window.google && window.google.maps && !mapInitialized) {
        // Inicializa el mapa
        const map = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
          disableDefaultUI: false,
        });
        setMapInstance(map); // Guarda la instancia del mapa
        setMapInitialized(true);
        console.log("Google Map initialized.");

        // Inicializa el autocompletado para los inputs provistos
        autocompleteInputIds.forEach(id => {
          const input = document.getElementById(id);
          if (input) {
            const autocomplete = new window.google.maps.places.Autocomplete(input, {
              fields: ["address_components", "geometry", "name", "formatted_address"],
              componentRestrictions: { country: ["es"] } // Restringe a España, puedes quitarlo si quieres global
            });

            autocomplete.addListener("place_changed", () => {
              const place = autocomplete.getPlace();
              if (!place.geometry) {
                // El usuario no seleccionó una sugerencia o la entrada no tiene datos geográficos.
                console.warn("No hay detalles disponibles para la entrada: '" + place.name + "'");
                return;
              }

              // Centra el mapa en el lugar seleccionado
              map.setCenter(place.geometry.location);
              map.setZoom(16); // Un zoom más cercano para la ubicación seleccionada

              // Opcional: añade o actualiza un marcador para el lugar
              const markerKey = id; // Usa el ID del input como clave para el marcador
              if (markers.current[markerKey]) {
                markers.current[markerKey].setMap(null); // Elimina el marcador anterior si existe
              }
              const newMarker = new window.google.maps.Marker({
                map: map,
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
      if (window.google && window.google.maps && mapRef.current) {
        initMapAndAutocomplete();
      } else {
        setTimeout(checkIfGoogleMapsIsReady, 100);
      }
    };

    checkIfGoogleMapsIsReady();

    return () => {
      // Limpieza de marcadores
      Object.values(markers.current).forEach(marker => marker.setMap(null));
      markers.current = {};
      // No hay una forma directa de "destruir" las instancias de Autocomplete,
      // pero al eliminar los inputs del DOM, sus listeners también se limpian.
      autocompleteInstances.current = [];
      // Aquí está el cambio: solo limpia la instancia del mapa si existe.
      if (mapInstance) {
        // mapInstance.setMap(null); // Descomenta si necesitas "destruir" el mapa visiblemente
      }
    };
    // mapInstance ha sido añadido como dependencia para el efecto.
    // onPlaceSelected también se añade para que ESLint no advierta si cambia (aunque es useCallback con []).
  }, [center, zoom, mapInitialized, autocompleteInputIds, onPlaceSelected, mapInstance]);

  return (
    <div
      ref={mapRef}
      className="map-container"
    >
      {!mapInitialized && (
        <div className="map-loading-overlay">
          <p>Cargando mapa...</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;