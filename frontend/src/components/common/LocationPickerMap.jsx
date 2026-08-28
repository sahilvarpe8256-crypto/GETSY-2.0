import { useState, useRef, useEffect, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, LocateFixed, Loader2, Navigation, RotateCcw } from 'lucide-react';
import { reverseGeocode } from '../../services/locationService';
import './LocationPickerMap.css';

// Fix Leaflet's default icon paths in bundled environments
const defaultMarkerIcon = L.divIcon({
  className: 'getsy-custom-map-pin',
  html: `
    <div class="getsy-leaflet-pin-wrapper">
      <div class="getsy-leaflet-pin-bubble">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#0e8c7f" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
        </svg>
      </div>
      <div class="getsy-leaflet-pin-pulse"></div>
      <div class="getsy-leaflet-pin-shadow"></div>
    </div>
  `,
  iconSize: [36, 44],
  iconAnchor: [18, 42]
});

const extractSafeCoords = (c) => {
  if (!c) return { lat: 18.5196, lng: 73.8427 }; // Default Pune
  const lat =
    typeof c.lat === 'number'
      ? c.lat
      : typeof c.latitude === 'number'
      ? c.latitude
      : parseFloat(c.lat || c.latitude) || 18.5196;
  const lng =
    typeof c.lng === 'number'
      ? c.lng
      : typeof c.longitude === 'number'
      ? c.longitude
      : parseFloat(c.lng || c.longitude) || 73.8427;
  return { lat, lng };
};

export default function LocationPickerMap({
  initialCoordinates = null,
  initialLocationName = '',
  onLocationChange,
  height = '260px',
  showQuickPills = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  const [coords, setCoords] = useState(() => extractSafeCoords(initialCoordinates));
  const [locationName, setLocationName] = useState(initialLocationName || 'Selected Location');
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Initialize and mount Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCoords = extractSafeCoords(initialCoordinates);

      const map = L.map(mapContainerRef.current, {
        center: [initialCoords.lat, initialCoords.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Voyager modern map tiles (fast, beautiful, clear local street names)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd'
        }
      ).addTo(map);

      // Add draggable marker
      const marker = L.marker([initialCoords.lat, initialCoords.lng], {
        icon: defaultMarkerIcon,
        draggable: true,
        autoPan: true
      }).addTo(map);

      // Map click handler
      map.on('click', (e) => {
        const newLat = Number(e.latlng.lat.toFixed(5));
        const newLng = Number(e.latlng.lng.toFixed(5));
        const newCoords = { lat: newLat, lng: newLng };

        marker.setLatLng([newLat, newLng]);
        setCoords(newCoords);
        handleCoordsUpdate(newCoords);
      });

      // Marker dragend handler
      marker.on('dragend', () => {
        const latlng = marker.getLatLng();
        const newLat = Number(latlng.lat.toFixed(5));
        const newLng = Number(latlng.lng.toFixed(5));
        const newCoords = { lat: newLat, lng: newLng };

        setCoords(newCoords);
        handleCoordsUpdate(newCoords);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      // Invalidate map size after render
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, []);

  // Update reverse geocoded place name when coordinates change
  const handleCoordsUpdate = useCallback(
    async (newCoords, fallbackName = '') => {
      setIsGeocoding(true);
      try {
        const placeName = await reverseGeocode(newCoords.lat, newCoords.lng);
        const finalName = fallbackName || placeName || `Location (${newCoords.lat}, ${newCoords.lng})`;
        setLocationName(finalName);

        if (onLocationChange) {
          onLocationChange({
            coordinates: newCoords,
            locationName: finalName,
            lat: newCoords.lat,
            lng: newCoords.lng
          });
        }
      } catch {
        const safeName = fallbackName || `Location (${newCoords.lat}, ${newCoords.lng})`;
        setLocationName(safeName);
        if (onLocationChange) {
          onLocationChange({
            coordinates: newCoords,
            locationName: safeName,
            lat: newCoords.lat,
            lng: newCoords.lng
          });
        }
      } finally {
        setIsGeocoding(false);
      }
    },
    [onLocationChange]
  );

  // Synchronize when initialCoordinates or initialLocationName prop changes from outside (e.g. Autocomplete selection)
  useEffect(() => {
    if (!initialCoordinates) return;

    const newSafeCoords = extractSafeCoords(initialCoordinates);
    setCoords(newSafeCoords);

    if (initialLocationName) {
      setLocationName(initialLocationName);
    }

    if (mapInstanceRef.current && markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([newSafeCoords.lat, newSafeCoords.lng]);
      mapInstanceRef.current.setView([newSafeCoords.lat, newSafeCoords.lng], 14, {
        animate: true,
        duration: 0.8
      });

      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 150);
    }
  }, [initialCoordinates?.lat, initialCoordinates?.lng, initialLocationName]);

  // GPS locate me
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = {
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5))
        };

        setCoords(newCoords);
        if (mapInstanceRef.current && markerInstanceRef.current) {
          markerInstanceRef.current.setLatLng([newCoords.lat, newCoords.lng]);
          mapInstanceRef.current.setView([newCoords.lat, newCoords.lng], 15, { animate: true });
        }

        handleCoordsUpdate(newCoords, 'My Current Location (GPS)');
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([coords.lat, coords.lng], 14, { animate: true });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <div className="location-picker-container">
      {/* Top Toolbar */}
      <div className="location-picker-toolbar">
        <button
          type="button"
          className="location-picker-gps-btn"
          onClick={handleLocateMe}
          disabled={isLocating}
          id="location-picker-gps-btn"
        >
          {isLocating ? (
            <Loader2 size={14} className="spin-anim" />
          ) : (
            <LocateFixed size={14} />
          )}
          <span>{isLocating ? 'Detecting GPS...' : 'Use My GPS Location'}</span>
        </button>

        <span className="location-picker-hint">
          Click map or drag pin to position
        </span>
      </div>

      {/* Leaflet Map Viewport */}
      <div className="location-picker-map-wrap" style={{ height }}>
        <div ref={mapContainerRef} className="location-picker-leaflet-map" />

        {/* Floating map controls */}
        <div className="location-picker-ctrls">
          <button
            type="button"
            className="location-picker-ctrl-btn"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            className="location-picker-ctrl-btn"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            -
          </button>
          <button
            type="button"
            className="location-picker-ctrl-btn"
            onClick={handleRecenter}
            title="Center on pin"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Selected Location Details Footer */}
      <div className="location-picker-footer">
        <div className="location-picker-selected-info">
          <MapPin size={16} color="var(--primary)" />
          <div className="selected-info-text">
            <strong>
              {locationName}
              {isGeocoding && <span className="geocoding-spinner"> (resolving...)</span>}
            </strong>
            <span>
              Coordinates: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
