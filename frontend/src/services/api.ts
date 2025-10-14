import type {
    CompletedRun,
    CompletedRunResponse,
    DestinationOption,
    DriverPortalResponse,
    LoadRecord,
    LoadRecordResponse,
    LoadSearchFilters,
    Metric,
    NoticesResponse,
    SuggestedLoad,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

class ApiError extends Error {
    constructor(
        message: string,
        public status: number
    ) {
        super(message);
    }
}

async function request<T>(path: string, init?: globalThis.RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
        },
        ...init,
    });

    if (!response.ok) {
        const message = `Request to ${path} failed with ${response.status}`;
        throw new ApiError(message, response.status);
    }

    return response.json() as Promise<T>;
}

type SuggestedLoadsResponse = SuggestedLoad[] | { suggestedLoads?: SuggestedLoad[] };

export async function fetchSuggestedLoads(): Promise<SuggestedLoad[]> {
    const data = await request<SuggestedLoadsResponse>('/loads/suggested');

    if (Array.isArray(data)) {
        return data;
    }

    if (data && Array.isArray(data.suggestedLoads)) {
        return data.suggestedLoads;
    }

    console.warn('Unexpected response format for suggested loads', data);
    throw new ApiError('Unexpected response format while loading suggested assignments.', 500);
}

export async function fetchNotices(): Promise<NoticesResponse> {
    return request<NoticesResponse>('/notices');
}

const buildLoadQuery = (filters?: LoadSearchFilters) => {
    if (!filters) {
        return '';
    }

    const params = new URLSearchParams();

    if (filters.minLoadedRpm != null) {
        params.set('minLoadedRpm', filters.minLoadedRpm.toString());
    }

    if (filters.minDistance != null) {
        params.set('minDistance', filters.minDistance.toString());
    }

    if (filters.maxDistance != null) {
        params.set('maxDistance', filters.maxDistance.toString());
    }

    if (filters.serviceExclusions.length > 0) {
        params.set('serviceExclusions', filters.serviceExclusions.join(','));
    }

    if (filters.confirmedOnly) {
        params.set('confirmedOnly', 'true');
    }

    if (filters.standardNetworkOnly) {
        params.set('standardNetworkOnly', 'true');
    }

    if (filters.destination) {
        params.set('destination', filters.destination);
    }

    if (filters.destinationState) {
        params.set('destinationState', filters.destinationState);
    }

    if (filters.destinationRadius != null) {
        params.set('destinationRadius', filters.destinationRadius.toString());
    }

    if (filters.pickupDateFrom) {
        params.set('startDate', filters.pickupDateFrom);
    }

    if (filters.pickupDateTo) {
        params.set('endDate', filters.pickupDateTo);
    }

    if (filters.dropDateFrom) {
        params.set('destinationDateFrom', filters.dropDateFrom);
    }

    if (filters.dropDateTo) {
        params.set('destinationDateTo', filters.dropDateTo);
    }

    const query = params.toString();
    return query ? `?${query}` : '';
};

export async function fetchFindLoads(filters?: LoadSearchFilters): Promise<LoadRecord[]> {
    const query = buildLoadQuery(filters);
    const data = await request<LoadRecordResponse[]>(`/loads/find${query}`);
    return data.map((load) => ({
        ...load,
        pickupDate: new Date(load.pickupDate),
        addedDate: new Date(load.addedDate),
        dropDate: new Date(load.dropDate),
    }));
}

export async function fetchCompletedRuns(): Promise<CompletedRun[]> {
    const data = await request<CompletedRunResponse[]>('/loads/completed');
    return data.map((run) => ({
        ...run,
        pickupDate: new Date(run.pickupDate),
        completionDate: new Date(run.completionDate),
    }));
}

export async function fetchDriverPortal(): Promise<DriverPortalResponse> {
    return request<DriverPortalResponse>('/driver/portal');
}

export async function fetchCustomMetrics(): Promise<Metric[]> {
    return request<Metric[]>('/settings/metrics');
}

export async function fetchDestinations(): Promise<DestinationOption[]> {
    return request<DestinationOption[]>('/destinations');
}

export { ApiError };
