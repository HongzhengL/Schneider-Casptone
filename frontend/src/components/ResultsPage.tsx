import { useState } from 'react';
import { ChevronLeft, CheckCircle2, Package } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface ResultsPageProps {
    onNavigate: (page: string) => void;
}

export function ResultsPage({ onNavigate }: ResultsPageProps) {
    const [sortBy, setSortBy] = useState('completion-date');

    // Completed trips from the past
    const completedTrips = [
        {
            id: '1',
            price: '$1,285',
            priceNum: 1285,
            distance: '186.3 miles',
            distanceNum: 186.3,
            weight: '13,944 lb',
            loadedRpm: '$1.25',
            loadedRpmNum: 1.25,
            loadType: 'Schneider Dedicated',
            fromLocation: 'Green Bay, WI',
            toLocation: 'Milwaukee, WI',
            pickupDate: new Date('2025-09-30T07:00:00'),
            completionDate: new Date('2025-09-30T17:12:00'),
            details: 'Customer: Walmart\\nSNI-4721',
            status: 'Delivered',
        },
        {
            id: '2',
            price: '$2,450',
            priceNum: 2450,
            distance: '412.5 miles',
            distanceNum: 412.5,
            weight: '43,000 lb',
            loadedRpm: '$2.15',
            loadedRpmNum: 2.15,
            loadType: 'Temperature Control',
            fromLocation: 'Milwaukee, WI',
            toLocation: 'Des Moines, IA',
            pickupDate: new Date('2025-10-01T05:00:00'),
            completionDate: new Date('2025-10-01T15:45:00'),
            details: 'Customer: Sysco\\nTemp: 34-38°F\\nSNI-4722',
            status: 'Delivered',
        },
        {
            id: '3',
            price: '$1,950',
            priceNum: 1950,
            distance: '328.7 miles',
            distanceNum: 328.7,
            weight: '38,500 lb',
            loadedRpm: '$2.08',
            loadedRpmNum: 2.08,
            loadType: 'Dry Van',
            fromLocation: 'Chicago, IL',
            toLocation: 'Indianapolis, IN',
            pickupDate: new Date('2025-10-02T08:00:00'),
            completionDate: new Date('2025-10-02T16:55:00'),
            details: 'Customer: Target\\nSNI-4723',
            status: 'Delivered',
        },
        {
            id: '4',
            price: '$2,125',
            priceNum: 2125,
            distance: '367.4 miles',
            distanceNum: 367.4,
            weight: '41,200 lb',
            loadedRpm: '$2.18',
            loadedRpmNum: 2.18,
            loadType: 'Refrigerated',
            fromLocation: 'Green Bay, WI',
            toLocation: 'Grand Rapids, MI',
            pickupDate: new Date('2025-10-03T05:30:00'),
            completionDate: new Date('2025-10-03T14:42:00'),
            details: 'Temp: 32-36°F\\nSNI-4724',
            status: 'Delivered',
        },
        {
            id: '5',
            price: '$1,625',
            priceNum: 1625,
            distance: '274.3 miles',
            distanceNum: 274.3,
            weight: '35,800 lb',
            loadedRpm: '$1.92',
            loadedRpmNum: 1.92,
            loadType: 'Schneider Dedicated',
            fromLocation: 'Appleton, WI',
            toLocation: 'Rockford, IL',
            pickupDate: new Date('2025-10-04T09:00:00'),
            completionDate: new Date('2025-10-04T16:10:00'),
            details: 'Customer: John Deere\\nSNI-4825',
            status: 'Delivered',
        },
        {
            id: '6',
            price: '$3,475',
            priceNum: 3475,
            distance: '623.2 miles',
            distanceNum: 623.2,
            weight: '48,800 lb',
            loadedRpm: '$2.48',
            loadedRpmNum: 2.48,
            loadType: 'Flatbed',
            fromLocation: 'Gary, IN',
            toLocation: 'Nashville, TN',
            pickupDate: new Date('2025-10-05T06:00:00'),
            completionDate: new Date('2025-10-06T14:35:00'),
            details: 'Steel Beams\\nSNI-4926',
            status: 'Delivered',
        },
        {
            id: '7',
            price: '$1,485',
            priceNum: 1485,
            distance: '258.8 miles',
            distanceNum: 258.8,
            weight: '33,200 lb',
            loadedRpm: '$1.88',
            loadedRpmNum: 1.88,
            loadType: 'Live Load',
            fromLocation: 'Madison, WI',
            toLocation: 'Cedar Rapids, IA',
            pickupDate: new Date('2025-10-07T10:15:00'),
            completionDate: new Date('2025-10-07T17:52:00'),
            details: 'Appointment Required\\nSNI-5027',
            status: 'Delivered',
        },
        {
            id: '8',
            price: '$2,875',
            priceNum: 2875,
            distance: '512.9 miles',
            distanceNum: 512.9,
            weight: '44,600 lb',
            loadedRpm: '$2.32',
            loadedRpmNum: 2.32,
            loadType: 'Temperature Control',
            fromLocation: 'Sioux Falls, SD',
            toLocation: 'Omaha, NE',
            pickupDate: new Date('2025-10-08T04:00:00'),
            completionDate: new Date('2025-10-08T18:12:00'),
            details: 'Temp: 34-38°F\\nSNI-5128',
            status: 'Delivered',
        },
        {
            id: '9',
            price: '$1,750',
            priceNum: 1750,
            distance: '298.5 miles',
            distanceNum: 298.5,
            weight: '37,400 lb',
            loadedRpm: '$1.98',
            loadedRpmNum: 1.98,
            loadType: 'Dry Van',
            fromLocation: 'Kenosha, WI',
            toLocation: 'Fort Wayne, IN',
            pickupDate: new Date('2025-10-09T07:30:00'),
            completionDate: new Date('2025-10-09T15:45:00'),
            details: 'General Freight\\nSNI-5229',
            status: 'Delivered',
        },
        {
            id: '10',
            price: '$3,825',
            priceNum: 3825,
            distance: '687.3 miles',
            distanceNum: 687.3,
            weight: '51,200 lb',
            loadedRpm: '$2.55',
            loadedRpmNum: 2.55,
            loadType: 'Schneider Intermodal',
            fromLocation: 'Detroit, MI',
            toLocation: 'Memphis, TN',
            pickupDate: new Date('2025-10-10T06:00:00'),
            completionDate: new Date('2025-10-11T16:30:00'),
            details: 'Container: SNLU-456789\\nSNI-5330',
            status: 'Delivered',
        },
        {
            id: '11',
            price: '$1,295',
            priceNum: 1295,
            distance: '218.6 miles',
            distanceNum: 218.6,
            weight: '29,800 lb',
            loadedRpm: '$1.78',
            loadedRpmNum: 1.78,
            loadType: 'Drop Trailer',
            fromLocation: 'Eau Claire, WI',
            toLocation: 'La Crosse, WI',
            pickupDate: new Date('2025-09-28T13:00:00'),
            completionDate: new Date('2025-09-28T18:20:00'),
            details: 'Drop & Hook\\nSNI-4620',
            status: 'Delivered',
        },
        {
            id: '12',
            price: '$2,650',
            priceNum: 2650,
            distance: '478.9 miles',
            distanceNum: 478.9,
            weight: '46,300 lb',
            loadedRpm: '$2.28',
            loadedRpmNum: 2.28,
            loadType: 'Refrigerated',
            fromLocation: 'Lincoln, NE',
            toLocation: 'Kansas City, MO',
            pickupDate: new Date('2025-09-29T05:00:00'),
            completionDate: new Date('2025-09-29T17:35:00'),
            details: 'Frozen Foods\\nTemp: -10°F\\nSNI-4719',
            status: 'Delivered',
        },
    ];

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
                        <p className="text-lg text-gray-900">{completedTrips.length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500">Total Miles</p>
                        <p className="text-lg text-gray-900">{totalMiles.toFixed(0)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500">Total Earned</p>
                        <p className="text-lg text-green-600">${totalEarnings.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Sort Controls */}
            <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">{visibleTrips.length} Completed</span>
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
                {visibleTrips.map((trip) => (
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
                ))}
            </div>

            {/* Bottom Spacer */}
            <div className="pb-8"></div>
        </div>
    );
}
