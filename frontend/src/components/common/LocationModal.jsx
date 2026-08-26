import { useState } from 'react';
import { MapPin, LocateFixed, Map as MapIcon, Type, X, Check, Loader2 } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import LocationPickerMap from './LocationPickerMap';
import './LocationModal.css';

export default function LocationModal({ isOpen, onClose, onLocationSelected }) {
  const { location, coordinates, setLocation, detectCurrentLocation, isLocating, locationError } = useLocation();

  // Tab mode: 'manual' | 'map' | 'gps'
  const [tab, setTab] = useState('manual');
  const [inputValue, setInputValue] = useState(location || '');
  const [selectedMapData, setSelectedMapData] = useState({
    coordinates: coordinates || { lat: 18.5196, lng: 73.8427 },
    locationName: location || 'FC Road / Deccan, Pune'
  });
  const [gpsLoading, setGpsLoading] = useState(false);

  if (!isOpen) return null;

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    if (inputValue.trim()) {
      setLocation(inputValue.trim());
      if (onLocationSelected) onLocationSelected(inputValue.trim());
      onClose();
    }
  };

  const handleMapSave = () => {
    if (selectedMapData.locationName) {
      setLocation(selectedMapData.locationName, selectedMapData.coordinates);
      if (onLocationSelected) onLocationSelected(selectedMapData.locationName, selectedMapData.coordinates);
      onClose();
    }
  };

  const handleUseCurrentLocation = async () => {
    setGpsLoading(true);
    try {
      const res = await detectCurrentLocation();
      if (onLocationSelected) onLocationSelected(res.location, res.coordinates);
      setGpsLoading(false);
      onClose();
    } catch {
      setGpsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="location-modal-overlay" onClick={handleOverlayClick}>
      <div className="location-modal location-modal--enhanced" id="location-modal" role="dialog" aria-modal="true">
        {/* Close button */}
        <button className="location-modal-close" onClick={onClose} aria-label="Close location modal">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="location-modal-header">
          <div className="location-modal-icon">
            <MapPin size={24} />
          </div>
          <div>
            <h2 className="location-modal-title">Change Your Location</h2>
            <p className="location-modal-subtitle">
              Discover verified local stores and products closest to you
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="location-tabs-switch">
          <button
            type="button"
            className={`location-tab-btn ${tab === 'manual' ? 'location-tab-btn--active' : ''}`}
            onClick={() => setTab('manual')}
          >
            <Type size={15} />
            <span>Search Area</span>
          </button>
          <button
            type="button"
            className={`location-tab-btn ${tab === 'map' ? 'location-tab-btn--active' : ''}`}
            onClick={() => setTab('map')}
          >
            <MapIcon size={15} />
            <span>Pin on Map</span>
          </button>
          <button
            type="button"
            className={`location-tab-btn ${tab === 'gps' ? 'location-tab-btn--active' : ''}`}
            onClick={() => setTab('gps')}
          >
            <LocateFixed size={15} />
            <span>Current GPS</span>
          </button>
        </div>

        {/* Tab 1: Manual / Quick Area Search */}
        {tab === 'manual' && (
          <div className="location-tab-content">
            <form onSubmit={handleManualSubmit} className="location-manual-form">
              <div className="location-modal-input-wrap">
                <MapPin size={18} className="location-modal-input-icon" />
                <input
                  type="text"
                  className="location-modal-input"
                  placeholder="Enter city or area (e.g. Kothrud, FC Road, Baner)..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoFocus
                  id="location-input"
                />
              </div>

              <div className="location-quick-chips">
                <span className="chips-title">Popular localities:</span>
                <div className="chips-list">
                  {['Kothrud, Pune', 'FC Road, Pune', 'Baner, Pune', 'Viman Nagar, Pune', 'Sangamner, MH'].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      className="location-chip"
                      onClick={() => {
                        setInputValue(loc);
                        setLocation(loc);
                        if (onLocationSelected) onLocationSelected(loc);
                        onClose();
                      }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="location-modal-submit"
                disabled={!inputValue.trim()}
                id="location-submit"
              >
                Set Location
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Interactive Location Map Pin Picker */}
        {tab === 'map' && (
          <div className="location-tab-content">
            <LocationPickerMap
              initialCoordinates={coordinates}
              initialLocationName={location}
              height="230px"
              onLocationChange={(data) => setSelectedMapData(data)}
            />
            <button
              type="button"
              className="location-modal-submit"
              onClick={handleMapSave}
              style={{ marginTop: '12px' }}
              id="save-map-location-btn"
            >
              Confirm Map Location
            </button>
          </div>
        )}

        {/* Tab 3: Current GPS */}
        {tab === 'gps' && (
          <div className="location-tab-content location-gps-box">
            <div className="location-gps-icon-circle">
              <LocateFixed size={32} color="var(--primary)" />
            </div>
            <h4>Use Device GPS</h4>
            <p>We'll detect your exact latitude and longitude to show stores right in your neighborhood.</p>

            {locationError && (
              <div className="location-picker-error" style={{ marginBottom: '12px' }}>
                <span>{locationError}</span>
              </div>
            )}

            <button
              type="button"
              className="location-modal-submit"
              onClick={handleUseCurrentLocation}
              disabled={gpsLoading || isLocating}
              id="detect-gps-location-btn"
            >
              {gpsLoading || isLocating ? (
                <>
                  <Loader2 size={16} className="spin-anim" />
                  <span>Accessing GPS...</span>
                </>
              ) : (
                <>
                  <LocateFixed size={16} />
                  <span>Detect My Location Now</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
