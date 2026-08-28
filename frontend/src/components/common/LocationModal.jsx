import { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  LocateFixed,
  Map as MapIcon,
  Type,
  X,
  Check,
  Loader2,
  Search,
  Building,
  Navigation
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { searchPlaces } from '../../services/locationService';
import LocationPickerMap from './LocationPickerMap';
import './LocationModal.css';

export default function LocationModal({ isOpen, onClose, onLocationSelected }) {
  const {
    location,
    coordinates,
    setLocation,
    detectCurrentLocation,
    isLocating,
    locationError
  } = useLocation();

  // Tab mode: 'manual' | 'map' | 'gps'
  const [tab, setTab] = useState('manual');
  const [inputValue, setInputValue] = useState(location || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [selectedMapData, setSelectedMapData] = useState({
    coordinates: coordinates || { lat: 18.5196, lng: 73.8427 },
    locationName: location || 'FC Road / Deccan, Pune'
  });

  const [gpsLoading, setGpsLoading] = useState(false);

  const searchAbortRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Sync state on modal open
  useEffect(() => {
    if (isOpen) {
      setInputValue(location || '');
      if (coordinates) {
        setSelectedMapData({
          coordinates,
          locationName: location || 'Selected Location'
        });
      }
      setIsDropdownOpen(false);
      setSuggestions([]);
      setHighlightedIndex(-1);
    }
  }, [isOpen, location, coordinates]);

  // Debounced live place search
  useEffect(() => {
    if (!inputValue || inputValue.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setIsDropdownOpen(false);
      return;
    }

    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    const abortController = new AbortController();
    searchAbortRef.current = abortController;
    setIsSearching(true);

    const timer = setTimeout(() => {
      searchPlaces(inputValue, abortController.signal)
        .then((results) => {
          setSuggestions(results);
          setHighlightedIndex(-1);
          setIsSearching(false);
          setIsDropdownOpen(true);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setIsSearching(false);
          }
        });
    }, 280);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [inputValue]);

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setIsDropdownOpen(true);
        setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setIsDropdownOpen(true);
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (isDropdownOpen && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      if (isDropdownOpen) {
        e.preventDefault();
        e.stopPropagation();
        setIsDropdownOpen(false);
      }
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion.displayName);
    setIsDropdownOpen(false);

    const newCoords = suggestion.coordinates || { lat: suggestion.lat, lng: suggestion.lng };

    // Update map state so map centers on this selection
    setSelectedMapData({
      coordinates: newCoords,
      locationName: suggestion.displayName
    });

    // Persist location
    setLocation(suggestion.displayName, newCoords);
    if (onLocationSelected) {
      onLocationSelected(suggestion.displayName, newCoords);
    }

    // Automatically transition to map tab for visual verification or close if preferred
    setTab('map');
  };

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    if (inputValue.trim()) {
      setIsDropdownOpen(false);
      setLocation(inputValue.trim(), selectedMapData.coordinates);
      if (onLocationSelected) {
        onLocationSelected(inputValue.trim(), selectedMapData.coordinates);
      }
      onClose();
    }
  };

  const handleMapSave = () => {
    if (selectedMapData.locationName) {
      setLocation(selectedMapData.locationName, selectedMapData.coordinates);
      if (onLocationSelected) {
        onLocationSelected(selectedMapData.locationName, selectedMapData.coordinates);
      }
      onClose();
    }
  };

  const handleUseCurrentLocation = async () => {
    setGpsLoading(true);
    try {
      const res = await detectCurrentLocation();
      if (onLocationSelected) {
        onLocationSelected(res.location, res.coordinates);
      }
      setSelectedMapData({
        coordinates: res.coordinates,
        locationName: res.location
      });
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

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="location-modal-overlay" onClick={handleOverlayClick} onKeyDown={handleKeyDown}>
      <div
        className="location-modal location-modal--enhanced"
        id="location-modal"
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          className="location-modal-close"
          onClick={onClose}
          aria-label="Close location modal"
        >
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
            id="tab-search-area"
          >
            <Type size={15} />
            <span>Search Place</span>
          </button>
          <button
            type="button"
            className={`location-tab-btn ${tab === 'map' ? 'location-tab-btn--active' : ''}`}
            onClick={() => setTab('map')}
            id="tab-pin-map"
          >
            <MapIcon size={15} />
            <span>Pin on Map</span>
          </button>
          <button
            type="button"
            className={`location-tab-btn ${tab === 'gps' ? 'location-tab-btn--active' : ''}`}
            onClick={() => setTab('gps')}
            id="tab-current-gps"
          >
            <LocateFixed size={15} />
            <span>Current GPS</span>
          </button>
        </div>

        {/* Tab 1: Live Autocomplete Search */}
        {tab === 'manual' && (
          <div className="location-tab-content">
            <form onSubmit={handleManualSubmit} className="location-manual-form">
              <div className="location-modal-input-wrap">
                <MapPin size={18} className="location-modal-input-icon" />
                <input
                  ref={inputRef}
                  type="text"
                  className="location-modal-input"
                  placeholder="Type city or place (e.g. Kopargaon, Nashik, FC Road)..."
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (!isDropdownOpen) setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setIsDropdownOpen(true);
                  }}
                  onKeyDown={handleInputKeyDown}
                  autoFocus
                  id="location-input"
                  autoComplete="off"
                />

                {isSearching && (
                  <Loader2 size={16} className="location-modal-input-spinner spin-anim" />
                )}

                {/* Live Autocomplete Dropdown */}
                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="location-autocomplete-dropdown"
                    id="location-autocomplete-dropdown"
                  >
                    {isSearching && suggestions.length === 0 && (
                      <div className="suggestion-state-msg">
                        <Loader2 size={14} className="spin-anim" />
                        <span>Searching places...</span>
                      </div>
                    )}

                    {!isSearching && suggestions.length === 0 && inputValue.trim().length >= 2 && (
                      <div className="suggestion-state-msg">
                        <span>No places found. Press enter to use "{inputValue.trim()}"</span>
                      </div>
                    )}

                    {suggestions.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`location-suggestion-item ${index === highlightedIndex ? 'location-suggestion-item--highlighted' : ''}`}
                        onClick={() => handleSuggestionSelect(item)}
                      >
                        <div className="suggestion-icon-wrap">
                          <MapPin size={14} />
                        </div>
                        <div className="suggestion-text-wrap">
                          <span className="suggestion-main-name">{item.name}</span>
                          <span className="suggestion-sub-name">{item.subtitle}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular quick chips */}
              <div className="location-quick-chips">
                <span className="chips-title">Popular localities:</span>
                <div className="chips-list">
                  {[
                    { label: 'Kopargaon, MH', lat: 19.8918, lng: 74.4789 },
                    { label: 'Sangamner, MH', lat: 19.5760, lng: 74.2070 },
                    { label: 'Nashik, MH', lat: 19.9975, lng: 73.7898 },
                    { label: 'Kothrud, Pune', lat: 18.5074, lng: 73.8077 },
                    { label: 'FC Road, Pune', lat: 18.5196, lng: 73.8427 }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      className="location-chip"
                      onClick={() => {
                        setInputValue(chip.label);
                        const newCoords = { lat: chip.lat, lng: chip.lng };
                        setSelectedMapData({
                          coordinates: newCoords,
                          locationName: chip.label
                        });
                        setLocation(chip.label, newCoords);
                        if (onLocationSelected) {
                          onLocationSelected(chip.label, newCoords);
                        }
                        setTab('map');
                      }}
                    >
                      {chip.label}
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
                Confirm Location
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Interactive Location Map Pin Picker */}
        {tab === 'map' && (
          <div className="location-tab-content">
            <LocationPickerMap
              initialCoordinates={selectedMapData.coordinates || coordinates}
              initialLocationName={selectedMapData.locationName || location}
              height="250px"
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
            <p>
              We'll detect your exact latitude and longitude to show stores right in your
              neighborhood.
            </p>

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
