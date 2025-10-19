/*
 * Sample mock data used by the backend service.
 * This file exports three collections: loads, origins, destinations and profiles.
 * Loads describe individual freight shipments. Origins and destinations are
 * locations that can be selected from the UI. Profiles capture saved search
 * criteria such as where a driver wants to go (“Get Home”) and what radius
 * they are willing to consider.
 */

// List of possible origin locations. Each entry includes a city and state.
const origins = [
  { city: 'Madison', state: 'WI', displayName: 'Madison, WI' },
  { city: 'Chicago', state: 'IL', displayName: 'Chicago, IL' },
  { city: 'Milwaukee', state: 'WI', displayName: 'Milwaukee, WI' },
  { city: 'Dallas', state: 'TX', displayName: 'Dallas, TX' },
  { city: 'Minneapolis', state: 'MN', displayName: 'Minneapolis, MN' }
];

// Destinations mirror origins for the purpose of this demo. In a real system
// destinations may be a different subset.
const destinations = [
  { city: 'Madison', state: 'WI', displayName: 'Madison, WI' },
  { city: 'Chicago', state: 'IL', displayName: 'Chicago, IL' },
  { city: 'Milwaukee', state: 'WI', displayName: 'Milwaukee, WI' },
  { city: 'Dallas', state: 'TX', displayName: 'Dallas, TX' },
  { city: 'Minneapolis', state: 'MN', displayName: 'Minneapolis, MN' }
];

// Saved search profiles. Each profile contains only those fields that can be
// applied to the /api/loads/find endpoint. If you add new filters to
// find loads, mirror them here as needed so that a profile can set a default.
const profiles = [
  {
    id: '1',
    name: 'Get Home',
    origin: 'Chicago, IL',
    originState: 'IL',
    originRadius: 50,
    destination: 'Madison, WI',
    destinationState: 'WI',
    destinationRadius: 100
  },
  {
    id: '2',
    name: 'Long Haul',
    origin: 'Madison, WI',
    originState: 'WI',
    originRadius: 100,
    destination: 'Dallas, TX',
    destinationState: 'TX',
    destinationRadius: 1000,
    minLoadedRpm: 2.0
  }
];

// Generate a few loads manually. In a real application this data would come
// from a database or another service. For this assignment only a handful of
// loads are necessary to illustrate filtering and profiles.
const loads = [
  {
    id: 'L1',
    fromLocation: { city: 'Chicago', state: 'IL' },
    toLocation: { city: 'Madison', state: 'WI' },
    distance: 150,
    distanceToOrigin: 40, // distance from driver origin, in miles
    pickupDate: '2025-10-21',
    dropDate: '2025-10-22',
    price: 1200,
    weight: 10000,
    loadedRpm: 2.5,
    totalRpm: 2.8,
    serviceTags: ['Standard']
  },
  {
    id: 'L2',
    fromLocation: { city: 'Madison', state: 'WI' },
    toLocation: { city: 'Dallas', state: 'TX' },
    distance: 900,
    distanceToOrigin: 30,
    pickupDate: '2025-10-23',
    dropDate: '2025-10-24',
    price: 2500,
    weight: 12000,
    loadedRpm: 2.0,
    totalRpm: 2.2,
    serviceTags: ['Reefer']
  },
  {
    id: 'L3',
    fromLocation: { city: 'Milwaukee', state: 'WI' },
    toLocation: { city: 'Chicago', state: 'IL' },
    distance: 90,
    distanceToOrigin: 20,
    pickupDate: '2025-10-20',
    dropDate: '2025-10-20',
    price: 800,
    weight: 8000,
    loadedRpm: 2.3,
    totalRpm: 2.5,
    serviceTags: ['Flatbed']
  },
  {
    id: 'L4',
    fromLocation: { city: 'Dallas', state: 'TX' },
    toLocation: { city: 'Minneapolis', state: 'MN' },
    distance: 950,
    distanceToOrigin: 200,
    pickupDate: '2025-10-25',
    dropDate: '2025-10-26',
    price: 2600,
    weight: 15000,
    loadedRpm: 1.9,
    totalRpm: 2.0,
    serviceTags: ['LongHaul']
  }
];

module.exports = {
  loads,
  origins,
  destinations,
  profiles
};