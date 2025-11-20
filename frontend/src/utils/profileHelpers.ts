import type { LoadSearchFilters, Profile, Metric } from '../types/api';
import { createDefaultLoadFilters } from '../constants/loadFilters';

export const fallbackMetrics = [
    { id: 'distance', label: 'Distance', enabled: true },
    { id: 'weight', label: 'Weight', enabled: true },
    { id: 'loadedRpm', label: 'Loaded RPM', enabled: true },
    { id: 'totalRpm', label: 'Est Total RPM', enabled: false },
    { id: 'loadType', label: 'Load Type', enabled: false },
    { id: 'right_dates', label: 'Dates (Right)', enabled: true },
    { id: 'right_loadType', label: 'Load Type (Right)', enabled: true },
    { id: 'right_details', label: 'Details (Right)', enabled: true },
    { id: 'right_trailer', label: 'Trailer Info (Right)', enabled: true },
    { id: 'right_reload', label: 'Reload Info (Right)', enabled: true },
] satisfies readonly Metric[];

export const normalizeFilters = (
    incoming: Partial<LoadSearchFilters> | null | undefined
): LoadSearchFilters => {
    const defaults = createDefaultLoadFilters();
    return {
        ...defaults,
        ...(incoming ?? {}),
        serviceExclusions: incoming?.serviceExclusions ?? defaults.serviceExclusions,
        originRadius: incoming?.originRadius ?? defaults.originRadius,
        minRcpm: incoming?.minRcpm ?? defaults.minRcpm,
    };
};

export const normalizeProfile = (profile: Profile): Profile => ({
    ...profile,
    filters: normalizeFilters(profile.filters),
});
