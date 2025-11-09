import type { LoadSearchFilters, Profile, Metric } from '../types/api';
import { createDefaultLoadFilters } from '../constants/loadFilters';

export const fallbackMetrics = [
    { id: 'distance', label: 'Distance', enabled: true },
    { id: 'weight', label: 'Weight', enabled: true },
    { id: 'loadedRpm', label: 'Loaded RPM', enabled: true },
    { id: 'totalRpm', label: 'Est Total RPM', enabled: false },
    { id: 'loadType', label: 'Load Type', enabled: false },
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
