export interface Metric {
    id: string;
    label: string;
    enabled: boolean;
}

export interface SuggestedLoad {
    id: string;
    title: string;
    price: string;
    distance: string;
    loadType: string;
    date: string;
    customer: string;
}

export type NoticeType = 'success' | 'warning' | 'info' | 'default';

export interface UnreadNotice {
    id: string;
    title: string;
    route: string;
    details: string;
}

export interface ReadNotice extends UnreadNotice {
    isSelected: boolean;
    type: NoticeType;
    time: string;
}

export interface SystemNotice {
    id: string;
    title: string;
    message: string;
    type: NoticeType;
    time: string;
}

export interface NoticesResponse {
    unread: UnreadNotice[];
    read: ReadNotice[];
    system: SystemNotice[];
}

export interface LoadRecord {
    id: string;
    price: string;
    priceNum: number;
    distance: string;
    distanceNum: number;
    weight: string;
    weightNum: number;
    loadedRpm: string;
    loadedRpmNum: number;
    totalRpm: string;
    totalRpmNum: number;
    rcpm?: string;
    rcpmNum?: number;
    loadType: string;
    fromLocation: string;
    fromDate: string;
    pickupDate: Date;
    toLocation: string;
    toDate: string;
    details: string;
    serviceTags: string[];
    hasReload: boolean;
    confirmedAppointment: boolean;
    distanceToOrigin: number;
    addedDate: Date;
    dropDate: Date;
    customer: string;
}

export interface LoadRecordResponse
    extends Omit<LoadRecord, 'pickupDate' | 'dropDate' | 'addedDate'> {
    pickupDate: string;
    addedDate: string;
    dropDate: string;
}

export interface CompletedRun {
    id: string;
    price: string;
    priceNum: number;
    distance: string;
    distanceNum: number;
    weight: string;
    loadedRpm: string;
    loadedRpmNum: number;
    loadType: string;
    fromLocation: string;
    toLocation: string;
    pickupDate: Date;
    completionDate: Date;
    details: string;
    status: string;
}

export interface CompletedRunResponse extends Omit<CompletedRun, 'pickupDate' | 'completionDate'> {
    pickupDate: string;
    completionDate: string;
}

export interface DriverProfile {
    name: string;
    email: string;
    phone: string;
    driverId: string;
    cdlNumber: string;
    rating: number;
    totalDeliveries: number;
    memberSince: string;
    fleet: string;
    homeTerminal: string;
}

export interface WalletInfo {
    balance: number;
    pendingEarnings: number;
    thisWeekEarnings: number;
    totalEarnings: number;
    schneiderPay: {
        mileageRate: number;
        bonusEarnings: number;
        fuelBonus: number;
    };
}

export interface MenuItem {
    icon: string;
    label: string;
    navigationTarget?: string;
}

export interface MenuSection {
    title: string;
    items: MenuItem[];
}

export interface PerformanceSummary {
    loadsCompleted: number;
    onTimeRate: number;
    averageRating: number;
}

export interface DriverPortalResponse {
    profile: DriverProfile;
    wallet: WalletInfo;
    menuSections: MenuSection[];
    performance?: PerformanceSummary;
    appVersion?: string;
}

export interface AdvancedFilterValues {
    minLoadedRpm: number | null;
    minRcpm: number | null;
    minDistance: number | null;
    maxDistance: number | null;
    serviceExclusions: string[];
}

export interface LoadSearchFilters extends AdvancedFilterValues {
    confirmedOnly: boolean;
    standardNetworkOnly: boolean;
    originRadius: number | null;
    destination: string | null;
    destinationState: string | null;
    destinationRadius: number | null;
    pickupDateFrom: string | null;
    pickupDateTo: string | null;
    dropDateFrom: string | null;
    dropDateTo: string | null;
}

export interface DestinationOption {
    label: string;
    city: string;
    state: string;
}

// Saved search profiles
export interface Profile {
    id: string;
    name: string;
    filters: LoadSearchFilters;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProfileInput {
    name: string;
    filters: LoadSearchFilters;
}

// Auth types
export interface SupabaseUser {
    id: string;
    email: string | null;
    phone?: string | null;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
    [key: string]: unknown;
}

export interface AuthResponse {
    expiresIn: number;
    user: SupabaseUser;
}

export interface CurrentUserResponse {
    user: SupabaseUser;
}

export interface SignupResponse {
    user: SupabaseUser;
    requiresConfirmation?: boolean;
}

// Leaderboard types
export interface LeaderboardEntry {
    rank: number;
    driverName: string;
    driverId: string;
    totalMiles: number;
    totalDeliveries: number;
}

export interface CoverageResponse {
    coveredAmount: number;
    startOfWeek: string;
    endOfWeek: string;
    runCount: number;
    referenceDate: string;
}
