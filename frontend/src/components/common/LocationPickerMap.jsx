import { useState, useRef, useEffect } from 'react';
import { MapPin, LocateFixed, Navigation, Check, Search, AlertCircle, Loader2 } from 'lucide-react';
import './LocationPickerMap.css';

// Reference localities in Pune / Maharashtra region for coordinate-to-name mapping
const LOCALITY_ANCHORS = [
  { name: 'Kothrud, Pune', lat: 18.5074, lng: 73.8077, x: 28, y: 55 },
  { name: 'FC Road / Deccan, Pune', lat: 18.5196, lng: 73.8427, x: 48, y: 45 },
  { name: 'Viman Nagar, Pune', lat: 18.5679, lng: 73.9143, x: 78, y: 25 },
  { name: 'Baner, Pune', lat: 18.5590, lng: 73.7868, x: 22, y: 30 },
  { name: 'Koregaon Park, Pune', lat: 18.5362, lng: 73.8940, x: 68, y: 38 },
  { name: 'Hadapsar, Pune', lat: 18.5089, lng: 73.9260, x: 82, y: 65 },
  { name: 'Swargate, Pune', lat: 18.5018, lng: 73.8587, x: 50, y: 68 },
  { name: 'Aundh, Pune', lat: 18.5626, lng: 73.8087, x: 32, y: 28 },
  { name: 'Sangamner, MH', lat: 19.5760, lng: 74.2070, x: 50, y: 20 },
  { name: 'Nashik Road, MH', lat: 19.9975, lng: 73.7898, x: 45, y: 15 }
];

const extractCoords = (c) => {
  if (!c) return { lat: 18.5196, lng: 73.8427 };
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
  height = '280px',
  showQuickPills = true
}) {
  const initialSafeCoords = extractCoords(initialCoordinates);

  // Pin position in percentage (0 to 100 on X and Y)
  const [pinPos, setPinPos] = useState(() => {
    const anchor = LOCALITY_ANCHORS.find(
      (a) =>
        Math.abs(a.lat - initialSafeCoords.lat) < 0.05 &&
        Math.abs(a.lng - initialSafeCoords.lng) < 0.05
    );
    return anchor ? { x: anchor.x, y: anchor.y } : { x: 48, y: 45 };
  });

  const [selectedCoords, setSelectedCoords] = useState(initialSafeCoords);
  const [selectedName, setSelectedName] = useState(initialLocationName || 'FC Road / Deccan, Pune');

  const [isDetecting, setIsDetecting] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const mapRef = useRef(null);

  // Synchronize when initialCoordinates or initialLocationName updates asynchronously
  useEffect(() => {
    if (initialCoordinates) {
      const coords = extractCoords(initialCoordinates);
      setSelectedCoords(coords);
      const anchor = LOCALITY_ANCHORS.find(
        (a) =>
          Math.abs(a.lat - coords.lat) < 0.05 &&
          Math.abs(a.lng - coords.lng) < 0.05
      );
      if (anchor) {
        setPinPos({ x: anchor.x, y: anchor.y });
      }
    }
    if (initialLocationName) {
      setSelectedName(initialLocationName);
    }
  }, [initialCoordinates, initialLocationName]);

  // Update pin and coords based on map click
  const handleMapClick = (e) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const pctX = Math.max(5, Math.min(95, (clickX / rect.width) * 100));
    const pctY = Math.max(5, Math.min(95, (clickY / rect.height) * 100));

    setPinPos({ x: pctX, y: pctY });

    // Derive approximate lat/lng from percentage
    const lat = Number((18.62 - (pctY / 100) * 0.2).toFixed(4));
    const lng = Number((73.72 + (pctX / 100) * 0.25).toFixed(4));
    const newCoords = { lat, lng };
    setSelectedCoords(newCoords);

    // Find closest anchor name
    let closest = LOCALITY_ANCHORS[0];
    let minD = 9999;
    LOCALITY_ANCHORS.forEach((a) => {
      const d = Math.hypot(a.x - pctX, a.y - pctY);
      if (d < minD) {
        minD = d;
        closest = a;
      }
    });

    const newLocName = minD < 18 ? closest.name : `Location (${lat}, ${lng})`;
    setSelectedName(newLocName);
    setGeoError(null);

    if (onLocationChange) {
      onLocationChange({
        coordinates: newCoords,
        locationName: newLocName,
        lat,
        lng
      });
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(4));
        const lng = Number(position.coords.longitude.toFixed(4));
        const newCoords = { lat, lng };

        setSelectedCoords(newCoords);
        setPinPos({ x: 50, y: 50 }); // Center pin

        const locName = 'Current Location (GPS)';
        setSelectedName(locName);
        setIsDetecting(false);

        if (onLocationChange) {
          onLocationChange({
            coordinates: newCoords,
            locationName: locName,
            lat,
            lng
          });
        }
      },
      (err) => {
        setIsDetecting(false);
        setGeoError('Permission denied or GPS unavailable. Click map to place pin manually.');
      },
      { timeout: 8000 }
    );
  };

  const selectAnchor = (anchor) => {
    setPinPos({ x: anchor.x, y: anchor.y });
    const coords = { lat: anchor.lat, lng: anchor.lng };
    setSelectedCoords(coords);
    setSelectedName(anchor.name);
    setGeoError(null);

    if (onLocationChange) {
      onLocationChange({
        coordinates: coords,
        locationName: anchor.name,
        lat: anchor.lat,
        lng: anchor.lng
      });
    }
  };

  const safeLat = typeof selectedCoords?.lat === 'number' ? selectedCoords.lat : 18.5196;
  const safeLng = typeof selectedCoords?.lng === 'number' ? selectedCoords.lng : 73.8427;
  const safeName = selectedName || 'Selected Location';

  return (
    <div className="location-picker-container">
      {/* Top Toolbar */}
      <div className="location-picker-toolbar">
        <button
          type="button"
          className="location-picker-gps-btn"
          onClick={handleUseCurrentLocation}
          disabled={isDetecting}
        >
          {isDetecting ? (
            <Loader2 size={15} className="spin-anim" />
          ) : (
            <LocateFixed size={15} />
          )}
          <span>{isDetecting ? 'Detecting GPS...' : 'Use My Current Location'}</span>
        </button>

        <span className="location-picker-hint">
          Click anywhere on the map to position your pin
        </span>
      </div>

      {geoError && (
        <div className="location-picker-error">
          <AlertCircle size={14} />
          <span>{geoError}</span>
        </div>
      )}

      {/* Interactive Map Canvas */}
      <div
        className="location-picker-canvas"
        style={{ height }}
        ref={mapRef}
        onClick={handleMapClick}
      >
        {/* SVG Grid / Map Background */}
        <svg className="location-picker-svg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="picker-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(14,140,127,0.12)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="var(--bg-page)" />
          <rect width="100%" height="100%" fill="url(#picker-grid)" />

          {/* Stylized River and Arterial Roads */}
          <path d="M 0,180 Q 200,160 350,220 T 700,200" fill="none" stroke="#bae6fd" strokeWidth="16" opacity="0.6" />
          <path d="M 50,0 Q 250,120 400,280" fill="none" stroke="#fef08a" strokeWidth="8" opacity="0.8" />
          <path d="M 0,90 Q 300,100 600,60" fill="none" stroke="#fed7aa" strokeWidth="6" opacity="0.8" />
          <path d="M 220,0 L 220,350" fill="none" stroke="#f1f5f9" strokeWidth="4" />
          <path d="M 450,0 L 450,350" fill="none" stroke="#f1f5f9" strokeWidth="4" />
        </svg>

        {/* Anchors / Popular Points */}
        {LOCALITY_ANCHORS.slice(0, 6).map((anchor, idx) => (
          <div
            key={idx}
            className="location-picker-anchor-dot"
            style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
            title={anchor.name}
            onClick={(e) => {
              e.stopPropagation();
              selectAnchor(anchor);
            }}
          >
            <span className="anchor-dot" />
            <span className="anchor-label">{anchor.name.split(',')[0]}</span>
          </div>
        ))}

        {/* Selected Location Pin Marker */}
        <div
          className="location-picker-pin"
          style={{ left: `${pinPos.x}%`, top: `${pinPos.y}%` }}
        >
          <div className="location-picker-pin-bubble">
            <MapPin size={22} fill="var(--primary)" color="#ffffff" />
          </div>
          <div className="location-picker-pin-shadow" />
        </div>
      </div>

      {/* Selected Location Bar */}
      <div className="location-picker-footer">
        <div className="location-picker-selected-info">
          <MapPin size={15} color="var(--primary)" />
          <div className="selected-info-text">
            <strong>{safeName}</strong>
            <span>Lat: {safeLat.toFixed(4)}, Lng: {safeLng.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Quick Area Selection Pills */}
      {showQuickPills && (
        <div className="location-picker-pills-row">
          <span className="pills-label">Quick select:</span>
          <div className="pills-scroll">
            {LOCALITY_ANCHORS.map((a, idx) => (
              <button
                key={idx}
                type="button"
                className={`picker-pill-btn ${safeName.toLowerCase().includes(a.name.split(',')[0].toLowerCase()) ? 'picker-pill-btn--active' : ''}`}
                onClick={() => selectAnchor(a)}
              >
                {a.name.split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
