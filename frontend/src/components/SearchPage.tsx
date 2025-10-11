import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Bell, Truck, SlidersHorizontal, Search } from 'lucide-react';
import { AdvancedFiltersDialog } from './AdvancedFiltersDialog';

interface SearchPageProps {
    onNavigate: (page: string) => void;
}

export function SearchPage({ onNavigate }: SearchPageProps) {
    const [originRadius, setOriginRadius] = useState(250);
    const [destinationRadius, setDestinationRadius] = useState(250);
    const [selectStates, setSelectStates] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Static dates representing the currently selected ranges
    const pickupFromDate = new Date(2025, 7, 13); // Aug 13, 2025
    const pickupToDate = new Date(2025, 7, 20); // Aug 20, 2025
    const dropFromDate = new Date(2025, 7, 15); // Aug 15, 2025
    const dropToDate = new Date(2025, 7, 22); // Aug 22, 2025

    const formatDate = (date: Date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        return {
            dayName: days[date.getDay()],
            dateStr: `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
        };
    };

    return (
        <div className="p-4 space-y-6">
            {/* Schneider Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg -mx-4 -mt-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Truck className="w-6 h-6" />
                        <h1 className="text-2xl">Schneider Load Search</h1>
                    </div>
                    <button
                        onClick={() => onNavigate('notice')}
                        className="text-white hover:text-orange-200"
                    >
                        <Bell className="w-6 h-6" />
                    </button>
                </div>
                <p className="text-orange-100 text-sm mt-1">Find your next assignment</p>
            </div>

            {/* Origin Radius */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-gray-700">Origin Radius</span>
                    <span className="text-orange-600 font-semibold">{originRadius} mi</span>
                </div>
                <Slider
                    value={[originRadius]}
                    onValueChange={(value) => setOriginRadius(value[0])}
                    min={25}
                    max={500}
                    step={25}
                    className="w-full"
                />
            </div>

            {/* Pick-up Date */}
            <div className="space-y-4">
                <h3 className="text-gray-600">Pick-up Date</h3>

                <div
                    className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border hover:border-orange-300 cursor-pointer transition-colors"
                    onClick={() => onNavigate('pickupdate')}
                >
                    <div>
                        <label className="text-gray-600 text-sm">From Date:</label>
                        <div>
                            <div className="font-semibold">
                                {formatDate(pickupFromDate).dayName}
                            </div>
                            <div className="font-semibold">
                                {formatDate(pickupFromDate).dateStr}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-600 text-sm">To Date:</label>
                        <div>
                            <div className="font-semibold">{formatDate(pickupToDate).dayName}</div>
                            <div className="font-semibold">{formatDate(pickupToDate).dateStr}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl">Delivery</h3>
                    <div className="flex items-center gap-2 text-orange-500">
                        <span>Reset</span>
                        <span>−</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span>Destination</span>
                    <div className="flex items-center gap-2">
                        <span>Select States</span>
                        <Switch checked={selectStates} onCheckedChange={setSelectStates} />
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Search className="w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Chicago, IL"
                        className="border-0 p-0 h-auto focus-visible:ring-0"
                        defaultValue="Chicago, IL"
                    />
                </div>
            </div>

            {/* Destination Radius */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-gray-700">Destination Radius</span>
                    <span className="text-orange-600 font-semibold">{destinationRadius} mi</span>
                </div>
                <Slider
                    value={[destinationRadius]}
                    onValueChange={(value) => setDestinationRadius(value[0])}
                    min={25}
                    max={500}
                    step={25}
                    className="w-full"
                />
            </div>

            {/* Drop Date */}
            <div className="space-y-4">
                <h3 className="text-gray-600">Drop Date</h3>

                <div
                    className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border hover:border-orange-300 cursor-pointer transition-colors"
                    onClick={() => onNavigate('dropdate')}
                >
                    <div>
                        <label className="text-gray-600 text-sm">From Date:</label>
                        <div>
                            <div className="font-semibold">{formatDate(dropFromDate).dayName}</div>
                            <div className="font-semibold">{formatDate(dropFromDate).dateStr}</div>
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-600 text-sm">To Date:</label>
                        <div>
                            <div className="font-semibold">{formatDate(dropToDate).dayName}</div>
                            <div className="font-semibold">{formatDate(dropToDate).dateStr}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Filters Button */}
            <div>
                <Button
                    variant="outline"
                    className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 py-4"
                    onClick={() => setShowAdvancedFilters(true)}
                >
                    <SlidersHorizontal className="w-5 h-5 mr-2" />
                    Advanced Filters
                </Button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg"
                    onClick={() => onNavigate('findloadsresults')}
                >
                    See Results
                </Button>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                            setOriginRadius(250);
                            setDestinationRadius(250);
                        }}
                    >
                        Reset Filters
                    </Button>
                    <Button
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                        Save Search
                    </Button>
                </div>
            </div>

            {/* Advanced Filters Dialog */}
            <AdvancedFiltersDialog
                open={showAdvancedFilters}
                onOpenChange={setShowAdvancedFilters}
            />
        </div>
    );
}
