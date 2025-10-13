import { useEffect, useState } from 'react';
import { ChevronLeft, CheckCircle2, Package } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { fetchCompletedRuns, ApiError } from '../services/api';
import type { CompletedRun } from '../types/api';

interface ResultsPageProps {
    onNavigate: (page: string) => void;
}

export function ResultsPage({ onNavigate }: ResultsPageProps) {
    const [completedTrips, setCompletedTrips] = useState<CompletedRun[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState('completion-date');

    useEffect(() => {
        let isMounted = true;

        const loadCompletedRuns = async () => {
            try {
                const runs = await fetchCompletedRuns();
                if (isMounted) {
                    setCompletedTrips(runs);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error(err);
                setError(
                    err instanceof ApiError
                        ? 'Unable to load completed runs.'
                        : 'Something went wrong while loading runs.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadCompletedRuns();

        return () => {
            isMounted = false;
        };
    }, []);

    const getSortedTrips = () => {
        const sorted = [...completedTrips].sort((a, b) => {
            switch (sortBy) {
                case 'completion-date':
                    return b.completionDate.getTime() - a.completionDate.getTime();
                case 'pickup-date':
                    return b.pickupDate.getTime() - a.pickupDate.getTime();
                case 'distance':
                    return b.distanceNum - a.distanceNum;
                case 'loaded-rpm':
                    return b.loadedRpmNum - a.loadedRpmNum;
                case 'earnings':
                    return b.priceNum - a.priceNum;
                default:
                    return 0;
            }
        });

        return sorted;
    };

    const visibleTrips = getSortedTrips();

    const totalEarnings = completedTrips.reduce((sum, trip) => sum + trip.priceNum, 0);
    const totalMiles = completedTrips.reduce((sum, trip) => sum + trip.distanceNum, 0);

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 border-b">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        type="button"
                        aria-label="Back to search"
                        onClick={() => onNavigate('search')}
                        className="rounded-full p-1 text-orange-600 hover:bg-orange-100 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <Package className="w-6 h-6 text-orange-600" />
                    <h1 className="text-xl text-orange-600">My Completed Runs</h1>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500">Total Runs</p>
                        <p className="text-lg text-gray-900">
                            {isLoading ? '…' : completedTrips.length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500">Total Miles</p>
                        <p className="text-lg text-gray-900">
                            {isLoading ? '…' : totalMiles.toFixed(0)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500">Total Earned</p>
                        <p className="text-lg text-green-600">
                            {isLoading ? '…' : `$${totalEarnings.toLocaleString()}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Sort Controls */}
            <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                        {isLoading
                            ? 'Loading completed runs…'
                            : error
                              ? 'Unable to load completed runs'
                              : `${visibleTrips.length} Completed`}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">Sort By:</span>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[160px] h-8 border-none bg-transparent p-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="completion-date">Completion Date</SelectItem>
                                <SelectItem value="pickup-date">Pickup Date</SelectItem>
                                <SelectItem value="distance">Distance</SelectItem>
                                <SelectItem value="loaded-rpm">RPM</SelectItem>
                                <SelectItem value="earnings">Earnings</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Completed Trip Cards */}
            <div className="p-4 space-y-4 min-h-[50vh]">
                {isLoading ? (
                    <div className="text-sm text-gray-500">Loading your completed runs…</div>
                ) : error ? (
                    <div className="text-sm text-red-600">{error}</div>
                ) : visibleTrips.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-sm">
                        No completed runs found for your filters.
                    </div>
                ) : (
                    visibleTrips.map((trip) => (
                        <div
                            key={trip.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Header with status */}
                            <div className="flex items-center justify-between mb-3">
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    {trip.status}
                                </Badge>
                                <span className="text-lg text-green-600">{trip.price}</span>
                            </div>

                            {/* Route */}
                            <div className="space-y-2 mb-3">
                                <div className="flex items-start gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-500 mt-1 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm text-gray-900">{trip.fromLocation}</p>
                                        <p className="text-xs text-gray-500">
                                            Picked up:{' '}
                                            {trip.pickupDate.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="ml-1.5 border-l-2 border-gray-300 h-4"></div>
                                <div className="flex items-start gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm text-gray-900">{trip.toLocation}</p>
                                        <p className="text-xs text-gray-500">
                                            Delivered:{' '}
                                            {trip.completionDate.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="flex gap-4 py-3 border-t border-gray-100">
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Distance</p>
                                    <p className="text-sm text-gray-900">{trip.distance}</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Weight</p>
                                    <p className="text-sm text-gray-900">{trip.weight}</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Loaded RPM</p>
                                    <p className="text-sm text-gray-900">{trip.loadedRpm}</p>
                                </div>
                            </div>

                            {/* Load Type & Details */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                        {trip.loadType}
                                    </span>
                                    <p className="text-xs text-gray-500">
                                        {trip.details.split('\\n')[0]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Bottom Spacer */}
            <div className="pb-8"></div>
        </div>
    );
}
