import type {
    AuthResponse,
    CompletedRun,
    CompletedRunResponse,
    CurrentUserResponse,
    DestinationOption,
    DriverPortalResponse,
    LoadRecord,
    LoadRecordResponse,
    LoadSearchFilters,
    Metric,
    NoticesResponse,
    SuggestedLoad,
    Profile,
    ProfileInput,
    SignupResponse,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number
    ) {
        super(message);
    }
}

async function request<T>(path: string, init?: globalThis.RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const headers = new Headers(init?.headers ?? {});
    headers.set('Accept', 'application/json');

    const hasBody = init?.body !== undefined && !(init.body instanceof FormData);
    if (hasBody && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
        ...init,
        headers,
        credentials: 'include',
    });

    const text = await response.text();

    if (!response.ok) {
        let errorMessage = `Request to ${path} failed with ${response.status}`;
        try {
            if (text) {
                const errorData = JSON.parse(text);
                errorMessage =
                    errorData.error || errorData.message || errorData.details || errorMessage;
            }
        } catch {
            // If parsing fails, use the default message
        }
        throw new ApiError(errorMessage, response.status);
    }

    if (response.status === 204 || response.headers.get('Content-Length') === '0' || !text) {
        return undefined as T;
    }

    return JSON.parse(text) as T;
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

// Profiles API
export async function fetchProfiles(): Promise<Profile[]> {
    return request<Profile[]>('/profiles');
}

export async function fetchProfile(id: string): Promise<Profile> {
    return request<Profile>(`/profiles/${encodeURIComponent(id)}`);
}

export async function createProfile(input: ProfileInput): Promise<Profile> {
    return request<Profile>('/profiles', {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export async function updateProfile(id: string, input: ProfileInput): Promise<Profile> {
    return request<Profile>(`/profiles/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(input),
    });
}

export async function deleteProfile(id: string): Promise<void> {
    await request<void>(`/profiles/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// Helper that returns the filters from a profile so callers can apply them to UI state
export async function applyProfile(id: string): Promise<LoadSearchFilters> {
    const profile = await fetchProfile(id);
    return profile.filters;
}

// Auth API
export async function login(
    email: string,
    password: string,
    rememberMe: boolean
): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe }),
    });
}

export async function logout(): Promise<void> {
    await request('/auth/logout', {
        method: 'POST',
    });
}

export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
    return request<CurrentUserResponse>('/auth/me');
}

export interface SignupPayload {
    email: string;
    password: string;
    metadata?: Record<string, unknown>;
}

export async function signUp(payload: SignupPayload): Promise<SignupResponse> {
    return request<SignupResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}
