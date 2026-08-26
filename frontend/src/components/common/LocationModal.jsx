import { useState } from 'react';
import { MapPin, LocateFixed, X } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import './LocationModal.css';

export default function LocationModal({ isOpen, onClose, onLocationSelected }) {
  const { setLocation } = useLocation();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (inputValue.trim()) {
      setLocation(inputValue.trim());
      if (onLocationSelected) onLocationSelected(inputValue.trim());
      setInputValue('');
      onClose();
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        /* In production, reverse geocode the coordinates to get a city name.
           For Phase 1, use a placeholder name. */
        const locationName = 'Current Location';
        setLocation(locationName);
        if (onLocationSelected) onLocationSelected(locationName);
        setInputValue('');
        setLoading(false);
        onClose();
      },
      (error) => {
        setLoading(false);
        alert('Unable to retrieve your location. Please enter it manually.');
      },
      { timeout: 8000 }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="location-modal-overlay" onClick={handleOverlayClick}>
      <div className="location-modal" id="location-modal" role="dialog" aria-modal="true">
        {/* Close button */}
        <button className="location-modal-close" onClick={onClose} aria-label="Close location modal">
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="location-modal-icon">
          <MapPin size={32} />
        </div>

        {/* Heading */}
        <h2 className="location-modal-title">Select Your Location</h2>
        <p className="location-modal-subtitle">
          Enter your city or area to discover nearby shops
        </p>

        {/* Location input */}
        <div className="location-modal-input-wrap">
          <MapPin size={18} className="location-modal-input-icon" />
          <input
            type="text"
            className="location-modal-input"
            placeholder="Enter city or area name..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            id="location-input"
          />
        </div>

        {/* Use current location */}
        <button
          className="location-modal-current"
          onClick={handleUseCurrentLocation}
          disabled={loading}
          id="use-current-location"
        >
          <LocateFixed size={18} />
          <span>{loading ? 'Detecting...' : 'Use my current location'}</span>
        </button>

        {/* Submit */}
        <button
          className="location-modal-submit"
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
          id="location-submit"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
