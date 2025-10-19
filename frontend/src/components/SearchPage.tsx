import React, { useState, useEffect } from 'react';

interface Location {
  city: string;
  state: string;
  displayName: string;
}

interface Profile {
  id: string;
  name: string;
  origin?: string;
  originState?: string;
  originRadius?: number | string;
  destination?: string;
  destinationState?: string;
  destinationRadius?: number | string;
  [key: string]: any;
}

interface Load {
  id: string;
  fromLocation: { city: string; state: string };
  toLocation: { city: string; state: string };
  distance: number;
  distanceToOrigin: number;
  pickupDate: string;
  dropDate: string;
  price: number;
  weight: number;
  loadedRpm: number;
  totalRpm: number;
}

/**
 * SearchPage provides a UI to discover loads. Users can select a saved profile
 * which pre-populates the search form. Inputs for origin and destination
 * leverage datalists to provide auto‑complete suggestions. A submit button
 * triggers a call to the backend and displays matching loads.
 */
const SearchPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [origins, setOrigins] = useState<Location[]>([]);
  const [destinations, setDestinations] = useState<Location[]>([]);

  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [originRadius, setOriginRadius] = useState<string>('');
  const [destinationRadius, setDestinationRadius] = useState<string>('');

  const [results, setResults] = useState<Load[]>([]);

  // Fetch profile and location data on mount
  useEffect(() => {
    fetch('/api/profiles')
      .then((res) => res.json())
      .then((data) => {
        setProfiles(data);
      })
      .catch(() => {
        // ignore errors in demo
      });
    fetch('/api/origins')
      .then((res) => res.json())
      .then((data) => {
        setOrigins(data);
      })
      .catch(() => {});
    fetch('/api/destinations')
      .then((res) => res.json())
      .then((data) => {
        setDestinations(data);
      })
      .catch(() => {});
  }, []);

  // When a profile is selected, populate form fields based on its values
  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const profileId = e.target.value;
    setSelectedProfile(profileId);
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      setOrigin(profile.origin || '');
      setDestination(profile.destination || '');
      setOriginRadius(profile.originRadius ? String(profile.originRadius) : '');
      setDestinationRadius(
        profile.destinationRadius ? String(profile.destinationRadius) : ''
      );
    }
  };

  // Perform search based on current form state
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedProfile) params.append('profile', selectedProfile);
    if (origin) params.append('origin', origin);
    if (destination) params.append('destination', destination);
    if (originRadius) params.append('originRadius', originRadius);
    if (destinationRadius) params.append('destinationRadius', destinationRadius);
    fetch(`/api/loads/find?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
      })
      .catch(() => {});
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '1rem' }}>
      <h1>Load Search</h1>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="profile-select">Profile: </label>
        <select
          id="profile-select"
          value={selectedProfile}
          onChange={handleProfileChange}
        >
          <option value="">-- None --</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="origin-input">Origin: </label>
        <input
          id="origin-input"
          list="origins-list"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
        <datalist id="origins-list">
          {origins.map((o) => (
            <option
              key={`${o.city}-${o.state}`}
              value={`${o.city}, ${o.state}`}
            />
          ))}
        </datalist>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="destination-input">Destination: </label>
        <input
          id="destination-input"
          list="destinations-list"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <datalist id="destinations-list">
          {destinations.map((d) => (
            <option
              key={`${d.city}-${d.state}`}
              value={`${d.city}, ${d.state}`}
            />
          ))}
        </datalist>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="origin-radius-input">Origin Radius (mi): </label>
        <input
          id="origin-radius-input"
          type="number"
          value={originRadius}
          onChange={(e) => setOriginRadius(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="destination-radius-input">Destination Radius (mi): </label>
        <input
          id="destination-radius-input"
          type="number"
          value={destinationRadius}
          onChange={(e) => setDestinationRadius(e.target.value)}
        />
      </div>
      <button onClick={handleSearch}>Search</button>
      <div style={{ marginTop: '2rem' }}>
        <h2>Results</h2>
        {results.length === 0 ? (
          <p>No matching loads.</p>
        ) : (
          <ul>
            {results.map((load) => (
              <li key={load.id}>
                {load.fromLocation.city}, {load.fromLocation.state} →{' '}
                {load.toLocation.city}, {load.toLocation.state} | Distance:{' '}
                {load.distance} mi | Price: ${load.price}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchPage;