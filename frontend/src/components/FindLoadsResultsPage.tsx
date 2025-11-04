import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, SlidersHorizontal, Eye, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SwipeableTripCard } from './SwipeableTripCard';
import { AdvancedFiltersDialog } from './AdvancedFiltersDialog';
import { fetchFindLoads, ApiError } from '../services/api';
import type { AdvancedFilterValues, LoadRecord, LoadSearchFilters } from '../types/api';

const formatDate = (value: string) => {
    const date = new Date(`${value}T00:00:00`);
    return {
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }),
    };
};

interface Metric {
    id: string;
    label: string;
    enabled: boolean;
}

interface FindLoadsResultsPageProps {
    customMetrics: Metric[];
    onNavigate: (page: string) => void;
    filters: LoadSearchFilters;
    onFiltersChange: (filters: LoadSearchFilters) => void;
}

export function FindLoadsResultsPage({
    customMetrics,
    onNavigate,
    filters,
    onFiltersChange,
}: FindLoadsResultsPageProps) {
    const [tripData, setTripData] = useState<LoadRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dislikedTrips, setDislikedTrips] = useState<string[]>([]);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [sortBy, setSortBy] = useState('new');

    useEffect(() => {
        let isMounted = true;

        const loadFindLoads = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const loads = await fetchFindLoads(filters);
                if (isMounted) {
                    setTripData(loads);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error(err);
                setError(
                    err instanceof ApiError
                        ? 'Unable to load available loads. Please try again later.'
                        : 'Something went wrong while loading loads.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadFindLoads();

        return () => {
            isMounted = false;
        };
    }, [filters]);

    useEffect(() => {
        setDislikedTrips([]);
    }, [filters]);

    const handleDislike = (tripId: string) => {
        setDislikedTrips((prev) => [...prev, tripId]);
    };

    const handleUndoDislike = (tripId: string) => {
        setDislikedTrips((prev) => prev.filter((id) => id !== tripId));
    };

    const getSortedTrips = () => {
        const filtered = tripData.filter((trip) => !dislikedTrips.includes(trip.id));

        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'new':
                    return b.addedDate.getTime() - a.addedDate.getTime();
                case 'pickup-date':
                    return a.pickupDate.getTime() - b.pickupDate.getTime();
                case 'distance':
                    return a.distanceNum - b.distanceNum;
                case 'loaded-rpm':
                    return b.loadedRpmNum - a.loadedRpmNum;
                case 'total-rpm':
                    return b.totalRpmNum - a.totalRpmNum;
                case 'rate':
                    return b.priceNum - a.priceNum;
                case 'distance-to-origin':
                    return a.distanceToOrigin - b.distanceToOrigin;
                default:
                    return 0;
            }
        });

        return sorted;
    };

    const visibleTrips = getSortedTrips();

    const filterChips = useMemo(() => {
        const chips: string[] = [];
        if (filters.minLoadedRpm != null) {
            chips.push(`Min RPM $${filters.minLoadedRpm.toFixed(2)}`);
        }
        if (filters.minRcpm != null) {
            chips.push(`Min RCPM $${filters.minRcpm.toFixed(2)}`);
        }
        if (filters.minDistance != null && filters.minDistance > 0) {
            chips.push(`Min dist ${filters.minDistance} mi`);
        }
        if (filters.maxDistance != null) {
            chips.push(`Max dist ${filters.maxDistance} mi`);
        }
        if (filters.serviceExclusions.length > 0) {
            chips.push(`Exclusions ${filters.serviceExclusions.length}`);
        }
        if (filters.confirmedOnly) {
            chips.push('Confirmed only');
        }
        if (filters.standardNetworkOnly) {
            chips.push('Standard network');
        }
        if (filters.destination) {
            chips.push(`Dest ${filters.destination}`);
        }
        if (filters.destinationState) {
            chips.push(`State ${filters.destinationState}`);
        }
        if (filters.destinationRadius != null) {
            chips.push(`Dest radius ${filters.destinationRadius} mi`);
        }
        if (filters.originRadius != null) {
            chips.push(`Origin radius ${filters.originRadius} mi`);
        }

        const formatRange = (from?: string | null, to?: string | null) => {
            if (!from && !to) return null;
            const render = (value: string | null | undefined) =>
                value ? formatDate(value).dateStr : 'Any';
            return `${render(from)} → ${render(to)}`;
        };

        const pickupRange = formatRange(filters.pickupDateFrom, filters.pickupDateTo);
        if (pickupRange) {
            chips.push(`Pickup ${pickupRange}`);
        }

        const dropRange = formatRange(filters.dropDateFrom, filters.dropDateTo);
        if (dropRange) {
            chips.push(`Drop ${dropRange}`);
        }

        return chips;
    }, [filters]);

    const advancedFilterCount = useMemo(() => {
        let count = 0;
        if (filters.minLoadedRpm != null) count += 1;
        if (filters.minDistance != null && filters.minDistance > 0) count += 1;
        if (filters.maxDistance != null) count += 1;
        if (filters.serviceExclusions.length > 0) count += filters.serviceExclusions.length;
        return count;
    }, [
        filters.minLoadedRpm,
        filters.minRcpm,
        filters.minDistance,
        filters.maxDistance,
        filters.serviceExclusions,
    ]);

    const handleAdvancedApply = (values: AdvancedFilterValues) => {
        onFiltersChange({
            ...filters,
            ...values,
        });
    };

    return (
        <div className="bg-background text-foreground min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-accent">
                <div className="flex items-center gap-3">
                    <ChevronLeft
                        className="w-6 h-6 cursor-pointer text-primary"
                        onClick={() => onNavigate('search')}
                    />
                    <h1 className="text-xl text-primary">Available Loads</h1>
                </div>
                <button
                    onClick={() => setShowAdvancedFilters(true)}
                    className="text-primary hover:opacity-90"
                    aria-label={`Advanced filters${
                        advancedFilterCount ? ` (${advancedFilterCount})` : ''
                    }`}
                    title={`Advanced filters${
                        advancedFilterCount ? ` (${advancedFilterCount})` : ''
                    }`}
                >
                    <SlidersHorizontal className="w-6 h-6" />
                </button>
            </div>

            {/* Filters */}
            <div className="p-4 space-y-4 border-b bg-accent">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                        {isLoading
                            ? 'Loading matches…'
                            : `${visibleTrips.length} of ${tripData.length} Matches`}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Sort By:</span>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[160px] h-8 border-none bg-transparent p-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="pickup-date">Pick-up date</SelectItem>
                                <SelectItem value="distance">Distance</SelectItem>
                                <SelectItem value="loaded-rpm">Loaded RPM</SelectItem>
                                <SelectItem value="total-rpm">Est Total RPM</SelectItem>
                                <SelectItem value="rate">Rate</SelectItem>
                                <SelectItem value="distance-to-origin">
                                    Distance to Origin
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span>Confirmed Appointments Only</span>
                        <Switch
                            checked={filters.confirmedOnly}
                            onCheckedChange={(checked) =>
                                onFiltersChange({
                                    ...filters,
                                    confirmedOnly: checked === true,
                                })
                            }
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Standard Network Only</span>
                        <Switch
                            checked={filters.standardNetworkOnly}
                            onCheckedChange={(checked) =>
                                onFiltersChange({
                                    ...filters,
                                    standardNetworkOnly: checked === true,
                                })
                            }
                        />
                    </div>
                </div>

                {filterChips.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {filterChips.map((chip) => (
                            <span
                                key={chip}
                                className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full"
                            >
                                {chip}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Trip Cards */}
            <div className="p-4 space-y-4 min-h-[50vh]">
                {isLoading ? (
                    <div className="text-sm text-muted-foreground">
                        Loading loads based on your filters…
                    </div>
                ) : error ? (
                    <div className="text-sm text-red-600">{error}</div>
                ) : visibleTrips.length > 0 ? (
                    visibleTrips.map((trip) => (
                        <SwipeableTripCard
                            key={trip.id}
                            trip={trip}
                            customMetrics={customMetrics}
                            onDislike={handleDislike}
                            onUndoDislike={handleUndoDislike}
                        />
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="text-muted-foreground mb-4">
                            <Eye className="w-16 h-16 mx-auto mb-4" />
                        </div>
                        <h3 className="text-lg text-foreground mb-2">No more trips to show</h3>
                        <p className="text-muted-foreground text-sm mb-6">
                            You've dismissed all available trips. Check back later for new loads.
                        </p>
                        <button
                            onClick={() => setDislikedTrips([])}
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4 inline mr-2" />
                            Show All Trips Again
                        </button>
                    </div>
                )}
            </div>

            {/* Instructions */}
            {!isLoading && !error && visibleTrips.length > 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                    Swipe left to dislike a trip
                </div>
            )}

            {/* Advanced Filters Dialog */}
            <AdvancedFiltersDialog
                open={showAdvancedFilters}
                onOpenChange={setShowAdvancedFilters}
                value={{
                    minLoadedRpm: filters.minLoadedRpm,
                    minRcpm: filters.minRcpm,
                    minDistance: filters.minDistance,
                    maxDistance: filters.maxDistance,
                    serviceExclusions: filters.serviceExclusions,
                }}
                onApply={(values) => {
                    handleAdvancedApply(values);
                    setShowAdvancedFilters(false);
                }}
            />

            {/* Bottom Spacer to ensure navigation is always visible */}
            <div className="pb-8"></div>
        </div>
    );
}
