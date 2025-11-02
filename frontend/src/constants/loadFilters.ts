import type { LoadSearchFilters } from '../types/api';

export const createDefaultLoadFilters = (): LoadSearchFilters => ({
    minLoadedRpm: null,
    minDistance: null,
    maxDistance: null,
    serviceExclusions: [],
    confirmedOnly: false,
    standardNetworkOnly: false,
    originRadius: null,
    destination: null,
    destinationState: null,
    destinationRadius: null,
    pickupDateFrom: null,
    pickupDateTo: null,
    dropDateFrom: null,
    dropDateTo: null,
});
