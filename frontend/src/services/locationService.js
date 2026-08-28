/**
 * Location and Geocoding Service for GETSY 2.0
 * Provides live place autocomplete, forward geocoding, and reverse geocoding
 * using OpenStreetMap/Photon with zero required API keys and graceful offline fallback.
 */

// Popular fallback localities for offline or instant suggestions
const LOCAL_FALLBACK_PLACES = [
  { name: 'Kopargaon, Maharashtra', lat: 19.8918, lng: 74.4789, type: 'city' },
  { name: 'Kopargaon Bus Stand, Kopargaon', lat: 19.8890, lng: 74.4812, type: 'transit' },
  { name: 'Kopargaon Railway Station, Kopargaon', lat: 19.8985, lng: 74.4920, type: 'station' },
  { name: 'Sangamner, Maharashtra', lat: 19.5760, lng: 74.2070, type: 'city' },
  { name: 'Sangamner Bus Stand, Sangamner', lat: 19.5785, lng: 74.2120, type: 'transit' },
  { name: 'Nashik, Maharashtra', lat: 19.9975, lng: 73.7898, type: 'city' },
  { name: 'Nashik Road, Nashik', lat: 19.9535, lng: 73.8340, type: 'area' },
  { name: 'Kothrud, Pune', lat: 18.5074, lng: 73.8077, type: 'area' },
  { name: 'FC Road, Pune', lat: 18.5196, lng: 73.8427, type: 'area' },
  { name: 'Baner, Pune', lat: 18.5590, lng: 73.7868, type: 'area' },
  { name: 'Viman Nagar, Pune', lat: 18.5679, lng: 73.9143, type: 'area' },
  { name: 'Swargate, Pune', lat: 18.5018, lng: 73.8587, type: 'transit' },
  { name: 'Hadapsar, Pune', lat: 18.5089, lng: 73.9260, type: 'area' },
  { name: 'Aundh, Pune', lat: 18.5626, lng: 73.8087, type: 'area' },
  { name: 'Koregaon Park, Pune', lat: 18.5362, lng: 73.8940, type: 'area' },
  { name: 'Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777, type: 'city' },
  { name: 'Thane, Maharashtra', lat: 19.2183, lng: 72.9781, type: 'city' },
  { name: 'Navi Mumbai, Maharashtra', lat: 19.0330, lng: 73.0297, type: 'city' },
  { name: 'Shirdi, Maharashtra', lat: 19.7645, lng: 74.4762, type: 'city' },
  { name: 'Ahmednagar, Maharashtra', lat: 19.0952, lng: 74.7480, type: 'city' },
  { name: 'Aurangabad (Chhatrapati Sambhaji Nagar)', lat: 19.8762, lng: 75.3433, type: 'city' }
];

/**
 * Format Photon GeoJSON feature into standard Suggestion object
 */
function formatPhotonFeature(feature) {
  const props = feature.properties || {};
  const coords = feature.geometry?.coordinates || [];
  const lng = coords[0];
  const lat = coords[1];

  const nameParts = [props.name];
  if (props.street && props.street !== props.name) nameParts.push(props.street);
  if (props.district && props.district !== props.name) nameParts.push(props.district);
  if (props.city && props.city !== props.name) nameParts.push(props.city);
  if (props.state && props.state !== props.name) nameParts.push(props.state);

  const mainName = props.name || props.city || props.district || 'Place';
  const subtitle = [props.district, props.city, props.state, props.country]
    .filter((v, i, arr) => Boolean(v) && v !== mainName && arr.indexOf(v) === i)
    .join(', ');

  const displayName = subtitle ? `${mainName}, ${subtitle}` : mainName;

  return {
    id: `osm-${props.osm_id || Math.random().toString(36).slice(2)}`,
    name: mainName,
    subtitle: subtitle || 'India',
    displayName,
    lat: Number(lat),
    lng: Number(lng),
    coordinates: { lat: Number(lat), lng: Number(lng) },
    type: props.osm_value || props.type || 'place'
  };
}

/**
 * Search places dynamically with debouncing, geo-prioritization, and fallback
 */
export async function searchPlaces(query, signal) {
  if (!query || !query.trim() || query.trim().length < 2) {
    return [];
  }

  const cleanQuery = query.trim();

  try {
    // Photon API (OpenStreetMap-powered, zero API key required, fast typeahead)
    const encoded = encodeURIComponent(cleanQuery);
    // Prioritize Maharashtra / India region coordinates (lat ~19.5, lon ~74.5)
    const url = `https://photon.komoot.io/api/?q=${encoded}&limit=6&lat=19.5&lon=74.5&lang=en`;

    const res = await fetch(url, { signal });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.features) && data.features.length > 0) {
        const results = data.features
          .filter((f) => f.geometry && Array.isArray(f.geometry.coordinates))
          .map(formatPhotonFeature);

        if (results.length > 0) {
          return results;
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    // Network failure: fall through to fallback
  }

  // Fallback matching
  const qLower = cleanQuery.toLowerCase();
  const matchedFallbacks = LOCAL_FALLBACK_PLACES.filter((p) =>
    p.name.toLowerCase().includes(qLower)
  ).map((p, idx) => ({
    id: `fallback-${idx}-${p.lat}`,
    name: p.name.split(',')[0],
    subtitle: p.name.split(',').slice(1).join(',').trim() || 'Maharashtra',
    displayName: p.name,
    lat: p.lat,
    lng: p.lng,
    coordinates: { lat: p.lat, lng: p.lng },
    type: p.type
  }));

  return matchedFallbacks;
}

/**
 * Reverse geocode coordinates to readable location name
 */
export async function reverseGeocode(lat, lng, signal) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }

  try {
    const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&lang=en`;
    const res = await fetch(url, { signal });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.features) && data.features.length > 0) {
        const feat = formatPhotonFeature(data.features[0]);
        return feat.displayName;
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err;
  }

  // Find nearest local fallback place
  let closest = LOCAL_FALLBACK_PLACES[0];
  let minD = 9999;
  LOCAL_FALLBACK_PLACES.forEach((p) => {
    const d = Math.hypot(p.lat - lat, p.lng - lng);
    if (d < minD) {
      minD = d;
      closest = p;
    }
  });

  if (minD < 0.15) {
    return closest.name;
  }

  return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

export { LOCAL_FALLBACK_PLACES };
