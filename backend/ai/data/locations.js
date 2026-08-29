/**
 * GETSY 2.0 — Known Locations with Coordinates
 * -----------------------------------------------
 * Each location name (lowercase key) maps to { latitude, longitude }.
 * The parser resolves location names extracted from queries against this map.
 *
 * Focused on Maharashtra (India) towns and cities relevant to GETSY users.
 */

const LOCATIONS = {
  sangamner:    { latitude: 19.57,  longitude: 74.21 },
  pune:         { latitude: 18.52,  longitude: 73.86 },
  mumbai:       { latitude: 19.08,  longitude: 72.88 },
  nashik:       { latitude: 20.00,  longitude: 73.78 },
  nagpur:       { latitude: 21.15,  longitude: 79.09 },
  aurangabad:   { latitude: 19.88,  longitude: 75.34 },
  thane:        { latitude: 19.22,  longitude: 72.98 },
  solapur:      { latitude: 17.68,  longitude: 75.91 },
  kolhapur:     { latitude: 16.70,  longitude: 74.24 },
  ahmednagar:   { latitude: 19.09,  longitude: 74.74 },
  shirdi:       { latitude: 19.77,  longitude: 74.48 },
  akola:        { latitude: 20.71,  longitude: 77.00 },
  latur:        { latitude: 18.40,  longitude: 76.57 },
  navi_mumbai:  { latitude: 19.03,  longitude: 73.03 },
  satara:       { latitude: 17.68,  longitude: 73.99 },
  sangli:       { latitude: 16.85,  longitude: 74.56 },
  jalgaon:      { latitude: 21.01,  longitude: 75.57 },
  ratnagiri:    { latitude: 16.99,  longitude: 73.30 },
  amravati:     { latitude: 20.93,  longitude: 77.75 },
  nanded:       { latitude: 19.16,  longitude: 77.30 },
  kopargaon:    { latitude: 19.88,  longitude: 74.48 },
};

module.exports = { LOCATIONS };
