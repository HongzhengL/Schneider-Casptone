import { useState } from 'react';
import { ChevronLeft, SlidersHorizontal, Edit, Eye, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SwipeableTripCard } from './SwipeableTripCard';
import { AdvancedFiltersDialog } from './AdvancedFiltersDialog';

interface Metric {
    id: string;
    label: string;
    enabled: boolean;
}

interface FindLoadsResultsPageProps {
    customMetrics: Metric[];
    onNavigate: (page: string) => void;
}

export function FindLoadsResultsPage({ customMetrics, onNavigate }: FindLoadsResultsPageProps) {
    const [dislikedTrips, setDislikedTrips] = useState<string[]>([]);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [confirmedOnly, setConfirmedOnly] = useState(false);
    const [standardNetworkOnly, setStandardNetworkOnly] = useState(false);
    const [sortBy, setSortBy] = useState('new');

    const tripData = [
        {
            id: '1',
            price: '$1,285',
            priceNum: 1285,
            distance: '186.3 miles',
            distanceNum: 186.3,
            weight: '13,944 lb',
            loadedRpm: '$1.25',
            loadedRpmNum: 1.25,
            totalRpm: '$1.50',
            totalRpmNum: 1.5,
            loadType: 'Schneider Dedicated',
            fromLocation: 'Green Bay, WI (Schneider Hub)',
            fromDate: 'Wed, Oct 16, 7:00 AM',
            pickupDate: new Date('2025-10-16T07:00:00'),
            toLocation: 'Milwaukee, WI (Walmart DC)',
            toDate: 'Wed, Oct 16, 4:59 PM',
            details: 'Customer: Walmart\\nSNI-4721',
            hasReload: true,
            distanceToOrigin: 15.2,
            addedDate: new Date('2025-10-10T10:30:00'),
        },
        {
            id: '2',
            price: '$1,165',
            priceNum: 1165,
            distance: '56.8 miles',
            distanceNum: 56.8,
            weight: '43,000 lb',
            loadedRpm: '$1.95',
            loadedRpmNum: 1.95,
            totalRpm: '$2.20',
            totalRpmNum: 2.2,
            loadType: 'Temperature Control',
            fromLocation: 'Milwaukee, WI (Schneider Terminal)',
            fromDate: 'Thu, Oct 17, 1:34 PM',
            pickupDate: new Date('2025-10-17T13:34:00'),
            toLocation: 'Madison, WI (Food Distribution)',
            toDate: 'Thu, Oct 17, 6:59 PM',
            details: 'Customer: Sysco\\nSNI-4812',
            hasReload: false,
            distanceToOrigin: 8.5,
            addedDate: new Date('2025-10-09T14:20:00'),
        },
        {
            id: '3',
            price: '$2,850',
            priceNum: 2850,
            distance: '425.1 miles',
            distanceNum: 425.1,
            weight: '42,550 lb',
            loadedRpm: '$2.05',
            loadedRpmNum: 2.05,
            totalRpm: '$2.30',
            totalRpmNum: 2.3,
            loadType: 'Dry Van',
            fromLocation: 'Chicago, IL (Distribution Center)',
            fromDate: 'Fri, Oct 18, 8:00 AM',
            pickupDate: new Date('2025-10-18T08:00:00'),
            toLocation: 'Minneapolis, MN (Warehouse)',
            toDate: 'Sat, Oct 19, 2:00 PM',
            details: 'Customer: Target\\nSNI-4923',
            hasReload: true,
            distanceToOrigin: 125.3,
            addedDate: new Date('2025-10-11T09:15:00'),
        },
        {
            id: '4',
            price: '$975',
            priceNum: 975,
            distance: '312.5 miles',
            distanceNum: 312.5,
            weight: '28,000 lb',
            loadedRpm: '$1.42',
            loadedRpmNum: 1.42,
            totalRpm: '$1.68',
            totalRpmNum: 1.68,
            loadType: 'Flatbed',
            fromLocation: 'Indianapolis, IN (Construction Site)',
            fromDate: 'Sat, Oct 19, 6:00 AM',
            pickupDate: new Date('2025-10-19T06:00:00'),
            toLocation: 'Columbus, OH (Builder Supply)',
            toDate: 'Sat, Oct 19, 11:30 AM',
            details: 'Customer: Builders FirstSource\\nSNI-5021',
            hasReload: false,
            distanceToOrigin: 200.7,
            addedDate: new Date('2025-10-10T11:45:00'),
        },
        {
            id: '5',
            price: '$1,625',
            priceNum: 1625,
            distance: '245.8 miles',
            distanceNum: 245.8,
            weight: '38,200 lb',
            loadedRpm: '$1.85',
            loadedRpmNum: 1.85,
            totalRpm: '$2.10',
            totalRpmNum: 2.1,
            loadType: 'Refrigerated',
            fromLocation: 'Des Moines, IA (Cold Storage)',
            fromDate: 'Sun, Oct 20, 10:00 AM',
            pickupDate: new Date('2025-10-20T10:00:00'),
            toLocation: 'Omaha, NE (Distribution)',
            toDate: 'Sun, Oct 20, 3:45 PM',
            details: 'Customer: US Foods\\nSNI-5134',
            hasReload: true,
            distanceToOrigin: 95.4,
            addedDate: new Date('2025-10-11T08:30:00'),
        },
        {
            id: '6',
            price: '$3,450',
            priceNum: 3450,
            distance: '598.2 miles',
            distanceNum: 598.2,
            weight: '44,800 lb',
            loadedRpm: '$2.45',
            loadedRpmNum: 2.45,
            totalRpm: '$2.80',
            totalRpmNum: 2.8,
            loadType: 'Schneider Intermodal',
            fromLocation: 'Detroit, MI (Port Terminal)',
            fromDate: 'Mon, Oct 21, 5:00 AM',
            pickupDate: new Date('2025-10-21T05:00:00'),
            toLocation: 'Nashville, TN (Distribution Hub)',
            toDate: 'Tue, Oct 22, 2:00 PM',
            details: 'Container: SNLU-982341\\nRail-to-Truck\\nSNI-5245',
            hasReload: true,
            distanceToOrigin: 178.5,
            addedDate: new Date('2025-10-11T15:20:00'),
        },
        {
            id: '7',
            price: '$890',
            priceNum: 890,
            distance: '142.7 miles',
            distanceNum: 142.7,
            weight: '31,200 lb',
            loadedRpm: '$1.68',
            loadedRpmNum: 1.68,
            totalRpm: '$1.95',
            totalRpmNum: 1.95,
            loadType: 'Drop Trailer',
            fromLocation: 'Rockford, IL (Warehouse)',
            fromDate: 'Tue, Oct 22, 8:30 AM',
            pickupDate: new Date('2025-10-22T08:30:00'),
            toLocation: 'Peoria, IL (Distribution)',
            toDate: 'Tue, Oct 22, 1:45 PM',
            details: 'Drop & Hook\\nSNI-5356',
            hasReload: false,
            distanceToOrigin: 45.8,
            addedDate: new Date('2025-10-10T09:45:00'),
        },
        {
            id: '8',
            price: '$2,175',
            priceNum: 2175,
            distance: '387.5 miles',
            distanceNum: 387.5,
            weight: '39,600 lb',
            loadedRpm: '$2.15',
            loadedRpmNum: 2.15,
            totalRpm: '$2.45',
            totalRpmNum: 2.45,
            loadType: 'Expedite',
            fromLocation: 'St. Louis, MO (Manufacturing)',
            fromDate: 'Wed, Oct 23, 11:00 PM',
            pickupDate: new Date('2025-10-23T23:00:00'),
            toLocation: 'Memphis, TN (FedEx Hub)',
            toDate: 'Thu, Oct 24, 9:30 AM',
            details: 'ASAP Delivery\\nTime Critical\\nSNI-5467',
            hasReload: true,
            distanceToOrigin: 215.3,
            addedDate: new Date('2025-10-11T16:30:00'),
        },
        {
            id: '9',
            price: '$1,950',
            priceNum: 1950,
            distance: '328.4 miles',
            distanceNum: 328.4,
            weight: '47,300 lb',
            loadedRpm: '$2.10',
            loadedRpmNum: 2.1,
            totalRpm: '$2.35',
            totalRpmNum: 2.35,
            loadType: 'Live Load',
            fromLocation: 'Kansas City, MO (Food Processing)',
            fromDate: 'Fri, Oct 25, 6:00 AM',
            pickupDate: new Date('2025-10-25T06:00:00'),
            toLocation: 'Wichita, KS (Grocery Distribution)',
            toDate: 'Fri, Oct 25, 2:30 PM',
            details: 'Appointment Required\\nSNI-5578',
            hasReload: false,
            distanceToOrigin: 312.7,
            addedDate: new Date('2025-10-09T12:15:00'),
        },
        {
            id: '10',
            price: '$4,125',
            priceNum: 4125,
            distance: '756.8 miles',
            distanceNum: 756.8,
            weight: '52,400 lb',
            loadedRpm: '$2.55',
            loadedRpmNum: 2.55,
            totalRpm: '$2.95',
            totalRpmNum: 2.95,
            loadType: 'Cross Country',
            fromLocation: 'Omaha, NE (Distribution Center)',
            fromDate: 'Sat, Oct 26, 7:00 AM',
            pickupDate: new Date('2025-10-26T07:00:00'),
            toLocation: 'Denver, CO (Warehouse Complex)',
            toDate: 'Sun, Oct 27, 8:00 PM',
            details: 'Long Haul\\nSNI-5689',
            hasReload: true,
            distanceToOrigin: 425.9,
            addedDate: new Date('2025-10-10T14:40:00'),
        },
        {
            id: '11',
            price: '$1,425',
            priceNum: 1425,
            distance: '234.6 miles',
            distanceNum: 234.6,
            weight: '36,800 lb',
            loadedRpm: '$1.88',
            loadedRpmNum: 1.88,
            totalRpm: '$2.12',
            totalRpmNum: 2.12,
            loadType: 'Schneider Bulk',
            fromLocation: 'Appleton, WI (Paper Mill)',
            fromDate: 'Mon, Oct 28, 9:00 AM',
            pickupDate: new Date('2025-10-28T09:00:00'),
            toLocation: 'Chicago, IL (Printing Facility)',
            toDate: 'Mon, Oct 28, 4:00 PM',
            details: 'Paper Products\\nSNI-5790',
            hasReload: false,
            distanceToOrigin: 22.4,
            addedDate: new Date('2025-10-11T11:25:00'),
        },
        {
            id: '12',
            price: '$2,685',
            priceNum: 2685,
            distance: '478.3 miles',
            distanceNum: 478.3,
            weight: '41,250 lb',
            loadedRpm: '$2.25',
            loadedRpmNum: 2.25,
            totalRpm: '$2.58',
            totalRpmNum: 2.58,
            loadType: 'Temperature Control',
            fromLocation: 'Sioux Falls, SD (Cold Storage)',
            fromDate: 'Tue, Oct 29, 4:00 AM',
            pickupDate: new Date('2025-10-29T04:00:00'),
            toLocation: 'Kansas City, MO (Distribution)',
            toDate: 'Tue, Oct 29, 5:30 PM',
            details: 'Temp: 32-36°F\\nSNI-5891',
            hasReload: true,
            distanceToOrigin: 567.2,
            addedDate: new Date('2025-10-09T08:50:00'),
        },
        {
            id: '13',
            price: '$1,150',
            priceNum: 1150,
            distance: '195.4 miles',
            distanceNum: 195.4,
            weight: '29,700 lb',
            loadedRpm: '$1.72',
            loadedRpmNum: 1.72,
            totalRpm: '$2.00',
            totalRpmNum: 2.0,
            loadType: 'Backhaul',
            fromLocation: 'Springfield, IL (Warehouse)',
            fromDate: 'Wed, Oct 30, 2:00 PM',
            pickupDate: new Date('2025-10-30T14:00:00'),
            toLocation: 'Champaign, IL (Distribution)',
            toDate: 'Wed, Oct 30, 6:30 PM',
            details: 'Return Load\\nSNI-5992',
            hasReload: false,
            distanceToOrigin: 156.3,
            addedDate: new Date('2025-10-10T16:10:00'),
        },
        {
            id: '14',
            price: '$3,875',
            priceNum: 3875,
            distance: '687.9 miles',
            distanceNum: 687.9,
            weight: '49,500 lb',
            loadedRpm: '$2.68',
            loadedRpmNum: 2.68,
            totalRpm: '$3.05',
            totalRpmNum: 3.05,
            loadType: 'Flatbed',
            fromLocation: 'Gary, IN (Steel Mill)',
            fromDate: 'Thu, Oct 31, 5:30 AM',
            pickupDate: new Date('2025-10-31T05:30:00'),
            toLocation: 'Houston, TX (Construction Site)',
            toDate: 'Sat, Nov 02, 2:00 PM',
            details: 'Steel Coils\\nTarps Required\\nSNI-6093',
            hasReload: true,
            distanceToOrigin: 245.8,
            addedDate: new Date('2025-10-11T13:35:00'),
        },
        {
            id: '15',
            price: '$1,575',
            priceNum: 1575,
            distance: '267.2 miles',
            distanceNum: 267.2,
            weight: '34,900 lb',
            loadedRpm: '$1.92',
            loadedRpmNum: 1.92,
            totalRpm: '$2.18',
            totalRpmNum: 2.18,
            loadType: 'Power Only',
            fromLocation: 'Cedar Rapids, IA (Manufacturing)',
            fromDate: 'Sun, Nov 03, 10:00 AM',
            pickupDate: new Date('2025-11-03T10:00:00'),
            toLocation: 'Dubuque, IA (Warehouse)',
            toDate: 'Sun, Nov 03, 4:45 PM',
            details: 'Customer Trailer\\nSNI-6194',
            hasReload: false,
            distanceToOrigin: 189.5,
            addedDate: new Date('2025-10-09T15:55:00'),
        },
        {
            id: '16',
            price: '$2,325',
            priceNum: 2325,
            distance: '412.6 miles',
            distanceNum: 412.6,
            weight: '45,200 lb',
            loadedRpm: '$2.18',
            loadedRpmNum: 2.18,
            totalRpm: '$2.48',
            totalRpmNum: 2.48,
            loadType: 'White Glove',
            fromLocation: 'Louisville, KY (Medical Supply)',
            fromDate: 'Mon, Nov 04, 7:00 AM',
            pickupDate: new Date('2025-11-04T07:00:00'),
            toLocation: 'Cleveland, OH (Hospital Network)',
            toDate: 'Mon, Nov 04, 6:00 PM',
            details: 'High Value Cargo\\nSign & Seal Required\\nSNI-6295',
            hasReload: true,
            distanceToOrigin: 398.7,
            addedDate: new Date('2025-10-10T10:20:00'),
        },
        {
            id: '17',
            price: '$1,825',
            priceNum: 1825,
            distance: '318.5 miles',
            distanceNum: 318.5,
            weight: '40,100 lb',
            loadedRpm: '$2.05',
            loadedRpmNum: 2.05,
            totalRpm: '$2.32',
            totalRpmNum: 2.32,
            loadType: 'Step Deck',
            fromLocation: 'Fort Wayne, IN (Equipment Rental)',
            fromDate: 'Tue, Nov 05, 8:00 AM',
            pickupDate: new Date('2025-11-05T08:00:00'),
            toLocation: 'Toledo, OH (Construction)',
            toDate: 'Tue, Nov 05, 3:30 PM',
            details: 'Construction Equipment\\nSNI-6396',
            hasReload: false,
            distanceToOrigin: 267.4,
            addedDate: new Date('2025-10-11T09:40:00'),
        },
        {
            id: '18',
            price: '$2,950',
            priceNum: 2950,
            distance: '523.7 miles',
            distanceNum: 523.7,
            weight: '51,800 lb',
            loadedRpm: '$2.38',
            loadedRpmNum: 2.38,
            totalRpm: '$2.72',
            totalRpmNum: 2.72,
            loadType: 'Tanker',
            fromLocation: 'Tulsa, OK (Refinery)',
            fromDate: 'Wed, Nov 06, 3:00 AM',
            pickupDate: new Date('2025-11-06T03:00:00'),
            toLocation: 'Dallas, TX (Distribution Terminal)',
            toDate: 'Wed, Nov 06, 6:00 PM',
            details: 'HAZMAT Required\\nEndorsement Needed\\nSNI-6497',
            hasReload: true,
            distanceToOrigin: 612.3,
            addedDate: new Date('2025-10-09T14:15:00'),
        },
        {
            id: '19',
            price: '$1,295',
            priceNum: 1295,
            distance: '218.3 miles',
            distanceNum: 218.3,
            weight: '33,400 lb',
            loadedRpm: '$1.78',
            loadedRpmNum: 1.78,
            totalRpm: '$2.05',
            totalRpmNum: 2.05,
            loadType: 'Partial Load',
            fromLocation: 'Madison, WI (Food Service)',
            fromDate: 'Thu, Nov 07, 11:00 AM',
            pickupDate: new Date('2025-11-07T11:00:00'),
            toLocation: 'La Crosse, WI (Restaurant Supply)',
            toDate: 'Thu, Nov 07, 5:00 PM',
            details: 'LTL Shipment\\nMultiple Stops\\nSNI-6598',
            hasReload: false,
            distanceToOrigin: 38.6,
            addedDate: new Date('2025-10-10T12:50:00'),
        },
        {
            id: '20',
            price: '$3,625',
            priceNum: 3625,
            distance: '645.2 miles',
            distanceNum: 645.2,
            weight: '48,700 lb',
            loadedRpm: '$2.52',
            loadedRpmNum: 2.52,
            totalRpm: '$2.88',
            totalRpmNum: 2.88,
            loadType: 'Refrigerated',
            fromLocation: 'Fargo, ND (Agricultural)',
            fromDate: 'Fri, Nov 08, 6:00 AM',
            pickupDate: new Date('2025-11-08T06:00:00'),
            toLocation: 'Minneapolis, MN (Food Processing)',
            toDate: 'Sat, Nov 09, 4:00 PM',
            details: 'Temp: 34-38°F\\nProduce\\nSNI-6699',
            hasReload: true,
            distanceToOrigin: 678.9,
            addedDate: new Date('2025-10-11T08:05:00'),
        },
        {
            id: '21',
            price: '$1,475',
            priceNum: 1475,
            distance: '256.8 miles',
            distanceNum: 256.8,
            weight: '37,300 lb',
            loadedRpm: '$1.85',
            loadedRpmNum: 1.85,
            totalRpm: '$2.12',
            totalRpmNum: 2.12,
            loadType: 'Dry Van',
            fromLocation: 'Eau Claire, WI (Distribution)',
            fromDate: 'Sun, Nov 10, 1:00 PM',
            pickupDate: new Date('2025-11-10T13:00:00'),
            toLocation: 'Duluth, MN (Retail Distribution)',
            toDate: 'Sun, Nov 10, 7:30 PM',
            details: 'General Freight\\nSNI-6700',
            hasReload: false,
            distanceToOrigin: 112.5,
            addedDate: new Date('2025-10-09T11:30:00'),
        },
        {
            id: '22',
            price: '$2,175',
            priceNum: 2175,
            distance: '389.4 miles',
            distanceNum: 389.4,
            weight: '43,600 lb',
            loadedRpm: '$2.12',
            loadedRpmNum: 2.12,
            totalRpm: '$2.42',
            totalRpmNum: 2.42,
            loadType: 'Schneider Dedicated',
            fromLocation: 'Oshkosh, WI (Manufacturing)',
            fromDate: 'Mon, Nov 11, 9:00 AM',
            pickupDate: new Date('2025-11-11T09:00:00'),
            toLocation: 'Indianapolis, IN (Distribution)',
            toDate: 'Mon, Nov 11, 7:00 PM',
            details: 'Customer: Industrial Parts Co\\nSNI-6801',
            hasReload: true,
            distanceToOrigin: 67.3,
            addedDate: new Date('2025-10-10T15:45:00'),
        },
        {
            id: '23',
            price: '$4,250',
            priceNum: 4250,
            distance: '782.6 miles',
            distanceNum: 782.6,
            weight: '54,200 lb',
            loadedRpm: '$2.72',
            loadedRpmNum: 2.72,
            totalRpm: '$3.12',
            totalRpmNum: 3.12,
            loadType: 'Cross Country',
            fromLocation: 'Lincoln, NE (Manufacturing)',
            fromDate: 'Tue, Nov 12, 5:00 AM',
            pickupDate: new Date('2025-11-12T05:00:00'),
            toLocation: 'Salt Lake City, UT (Distribution Hub)',
            toDate: 'Thu, Nov 14, 3:00 PM',
            details: 'Long Haul\\nTeam Drivers Preferred\\nSNI-6902',
            hasReload: true,
            distanceToOrigin: 512.8,
            addedDate: new Date('2025-10-11T07:25:00'),
        },
        {
            id: '24',
            price: '$1,685',
            priceNum: 1685,
            distance: '295.7 miles',
            distanceNum: 295.7,
            weight: '39,800 lb',
            loadedRpm: '$1.98',
            loadedRpmNum: 1.98,
            totalRpm: '$2.25',
            totalRpmNum: 2.25,
            loadType: 'Live Load',
            fromLocation: 'Kenosha, WI (Assembly Plant)',
            fromDate: 'Fri, Nov 15, 7:30 AM',
            pickupDate: new Date('2025-11-15T07:30:00'),
            toLocation: 'Grand Rapids, MI (Parts Supplier)',
            toDate: 'Fri, Nov 15, 4:00 PM',
            details: 'Automotive Parts\\nAppointment Required\\nSNI-7003',
            hasReload: false,
            distanceToOrigin: 52.7,
            addedDate: new Date('2025-10-09T13:10:00'),
        },
        {
            id: '25',
            price: '$2,825',
            priceNum: 2825,
            distance: '498.3 miles',
            distanceNum: 498.3,
            weight: '46,900 lb',
            loadedRpm: '$2.32',
            loadedRpmNum: 2.32,
            totalRpm: '$2.65',
            totalRpmNum: 2.65,
            loadType: 'Temperature Control',
            fromLocation: 'Waterloo, IA (Food Production)',
            fromDate: 'Sat, Nov 16, 8:00 AM',
            pickupDate: new Date('2025-11-16T08:00:00'),
            toLocation: 'St. Paul, MN (Distribution)',
            toDate: 'Sun, Nov 17, 2:00 PM',
            details: 'Frozen Foods\\nTemp: -10°F\\nSNI-7104',
            hasReload: true,
            distanceToOrigin: 234.9,
            addedDate: new Date('2025-10-10T09:35:00'),
        },
    ];

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

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="flex items-center gap-3">
                    <ChevronLeft
                        className="w-6 h-6 cursor-pointer text-orange-600"
                        onClick={() => onNavigate('search')}
                    />
                    <h1 className="text-xl text-orange-600">Available Loads</h1>
                </div>
                <button
                    onClick={() => setShowAdvancedFilters(true)}
                    className="text-orange-600 hover:text-orange-700"
                >
                    <SlidersHorizontal className="w-6 h-6" />
                </button>
            </div>

            {/* Filters */}
            <div className="p-4 space-y-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                        {visibleTrips.length} of {tripData.length} Matches
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">Sort By:</span>
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
                        <Switch checked={confirmedOnly} onCheckedChange={setConfirmedOnly} />
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Standard Network Only</span>
                        <Switch
                            checked={standardNetworkOnly}
                            onCheckedChange={setStandardNetworkOnly}
                        />
                    </div>
                </div>
            </div>

            {/* Trip Cards */}
            <div className="p-4 space-y-4 min-h-[50vh]">
                {visibleTrips.length > 0 ? (
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
                        <div className="text-gray-400 mb-4">
                            <Eye className="w-16 h-16 mx-auto mb-4" />
                        </div>
                        <h3 className="text-lg text-gray-900 mb-2">No more trips to show</h3>
                        <p className="text-gray-500 text-sm mb-6">
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
            {visibleTrips.length > 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                    Swipe left to dislike a trip
                </div>
            )}

            {/* Advanced Filters Dialog */}
            <AdvancedFiltersDialog
                open={showAdvancedFilters}
                onOpenChange={setShowAdvancedFilters}
            />

            {/* Bottom Spacer to ensure navigation is always visible */}
            <div className="pb-8"></div>
        </div>
    );
}
