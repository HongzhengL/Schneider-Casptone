import { useEffect, useMemo, useState } from 'react';
import { Bell, Truck, SlidersHorizontal, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { AdvancedFiltersDialog } from './AdvancedFiltersDialog';
import { fetchDestinations } from '../services/api';
import type { AdvancedFilterValues, DestinationOption, LoadSearchFilters } from '../types/api';

interface SearchPageProps {
    onNavigate: (page: string) => void;
    filters: LoadSearchFilters;
    onFiltersChange: (filters: LoadSearchFilters) => void;
    createDefaultFilters: () => LoadSearchFilters;
}

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

const enforceRange = (
    from: string,
    to: string,
    changed: 'from' | 'to'
): { from: string; to: string } => {
    if (from > to) {
        return changed === 'from' ? { from, to: from } : { from: to, to };
    }
    return { from, to };
};

const dateToInputValue = (date: Date) => date.toISOString().split('T')[0];

const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

export function SearchPage({
    onNavigate,
    filters,
    onFiltersChange,
    createDefaultFilters,
}: SearchPageProps) {
    const [originRadius, setOriginRadius] = useState(500);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectStates, setSelectStates] = useState(Boolean(filters.destinationState));
    const [destinations, setDestinations] = useState<DestinationOption[]>([]);
    const [destinationsLoading, setDestinationsLoading] = useState(true);
    const [destinationsError, setDestinationsError] = useState<string | null>(null);

    const uiDefaultRanges = useMemo(() => {
        const today = new Date();
        return {
            pickup: {
                from: dateToInputValue(today),
                to: dateToInputValue(addDays(today, 7)),
            },
            drop: {
                from: dateToInputValue(addDays(today, 2)),
                to: dateToInputValue(addDays(today, 9)),
            },
        };
    }, []);

    useEffect(() => {
        setSelectStates(Boolean(filters.destinationState));
    }, [filters.destinationState]);

    useEffect(() => {
        let mounted = true;
        const loadDestinations = async () => {
            try {
                const data = await fetchDestinations();
                if (!mounted) return;
                setDestinations(data);
            } catch (error) {
                if (!mounted) return;
                console.error(error);
                setDestinationsError('Unable to load destinations. Try again later.');
            } finally {
                if (mounted) {
                    setDestinationsLoading(false);
                }
            }
        };
        loadDestinations();
        return () => {
            mounted = false;
        };
    }, []);

    const stateOptions = useMemo(
        () =>
            Array.from(new Set(destinations.map((option) => option.state).filter(Boolean))).sort(),
        [destinations]
    );

    const pickupRange = {
        from: filters.pickupDateFrom ?? uiDefaultRanges.pickup.from,
        to: filters.pickupDateTo ?? uiDefaultRanges.pickup.to,
    };

    const dropRange = {
        from: filters.dropDateFrom ?? uiDefaultRanges.drop.from,
        to: filters.dropDateTo ?? uiDefaultRanges.drop.to,
    };

    const destinationRadiusValue = filters.destinationRadius ?? 500;

    const handlePickupChange = (key: 'from' | 'to', value: string) => {
        const next = enforceRange(
            key === 'from' ? value : pickupRange.from,
            key === 'to' ? value : pickupRange.to,
            key
        );
        onFiltersChange({
            ...filters,
            pickupDateFrom: next.from,
            pickupDateTo: next.to,
        });
    };

    const handleDropChange = (key: 'from' | 'to', value: string) => {
        const next = enforceRange(
            key === 'from' ? value : dropRange.from,
            key === 'to' ? value : dropRange.to,
            key
        );
        onFiltersChange({
            ...filters,
            dropDateFrom: next.from,
            dropDateTo: next.to,
        });
    };

    const resetFilters = () => {
        setOriginRadius(500);
        const defaults = createDefaultFilters();
        setSelectStates(Boolean(defaults.destinationState));
        onFiltersChange(defaults);
    };

    const handleAdvancedApply = (values: AdvancedFilterValues) => {
        onFiltersChange({
            ...filters,
            ...values,
        });
    };

    const activeAdvancedFilters = useMemo(() => {
        let count = 0;
        if (filters.minLoadedRpm != null) count += 1;
        if (filters.minDistance != null && filters.minDistance > 0) count += 1;
        if (filters.maxDistance != null) count += 1;
        if (filters.serviceExclusions.length > 0) count += filters.serviceExclusions.length;
        return count;
    }, [filters]);

    const advancedSummary = useMemo(() => {
        const summary: string[] = [];
        if (filters.minLoadedRpm != null) {
            summary.push(`Min RPM $${filters.minLoadedRpm.toFixed(2)}`);
        }
        if (filters.minDistance != null && filters.minDistance > 0) {
            summary.push(`Min dist ${filters.minDistance} mi`);
        }
        if (filters.maxDistance != null) {
            summary.push(`Max dist ${filters.maxDistance} mi`);
        }
        if (filters.serviceExclusions.length > 0) {
            summary.push(`Exclusions ${filters.serviceExclusions.length}`);
        }
        return summary;
    }, [filters]);

    const handleDestinationChange = (value: string) => {
        if (!value) {
            onFiltersChange({
                ...filters,
                destination: null,
                destinationState: selectStates ? filters.destinationState : null,
            });
            return;
        }
        const match = destinations.find(
            (option) => option.label.toLowerCase() === value.toLowerCase()
        );
        onFiltersChange({
            ...filters,
            destination: value,
            destinationState: selectStates ? (match?.state ?? null) : null,
        });
    };

    const handleStateChange = (state: string) => {
        onFiltersChange({
            ...filters,
            destinationState: state ? state : null,
        });
    };

    const handleDestinationRadiusChange = (value: number) => {
        onFiltersChange({
            ...filters,
            destinationRadius: value,
        });
    };

    const handleDestinationToggle = (checked: boolean | string) => {
        const enabled = checked === true;
        setSelectStates(enabled);
        let nextState: string | null = null;
        if (enabled) {
            const destinationValue = filters.destination ?? null;
            if (destinationValue) {
                const match = destinations.find(
                    (option) => option.label.toLowerCase() === destinationValue.toLowerCase()
                );
                nextState = match?.state ?? null;
            } else {
                nextState = filters.destinationState ?? null;
            }
        }
        onFiltersChange({
            ...filters,
            destinationState: enabled ? nextState : null,
        });
    };

    const advancedButtonLabel = `Advanced Filters${
        activeAdvancedFilters ? ` (${activeAdvancedFilters})` : ''
    }`;

    return (
        <div className="p-4 space-y-6">
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

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-gray-600">Pick-up Date</h3>
                    <span className="text-sm text-gray-500">
                        {formatDate(pickupRange.from).dateStr} –{' '}
                        {formatDate(pickupRange.to).dateStr}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border hover:border-orange-300 transition-colors">
                    <div className="space-y-2">
                        <label className="text-gray-600 text-sm" htmlFor="pickup-from">
                            From
                        </label>
                        <Input
                            id="pickup-from"
                            type="date"
                            value={pickupRange.from}
                            onChange={(event) => handlePickupChange('from', event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-gray-600 text-sm" htmlFor="pickup-to">
                            To
                        </label>
                        <Input
                            id="pickup-to"
                            type="date"
                            value={pickupRange.to}
                            min={pickupRange.from}
                            onChange={(event) => handlePickupChange('to', event.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl">Delivery</h3>
                    <Button
                        variant="ghost"
                        className="text-orange-500 hover:text-orange-600 px-2"
                        onClick={resetFilters}
                    >
                        Reset
                    </Button>
                </div>

                <div className="flex items-center justify-between">
                    <span>Destination</span>
                    <div className="flex items-center gap-2">
                        <span>Select States</span>
                        <Switch checked={selectStates} onCheckedChange={handleDestinationToggle} />
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Search className="w-5 h-5 text-gray-400" />
                    <select
                        value={filters.destination ?? ''}
                        onChange={(event) => handleDestinationChange(event.target.value)}
                        className="flex-1 border-0 bg-transparent text-sm text-gray-700 focus:outline-none"
                        disabled={destinationsLoading || Boolean(destinationsError)}
                    >
                        <option value="">All destinations</option>
                        {destinations.map((option) => (
                            <option key={option.label} value={option.label}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                {destinationsLoading && (
                    <p className="text-xs text-gray-500">Loading destinations…</p>
                )}
                {destinationsError && <p className="text-xs text-red-600">{destinationsError}</p>}

                {selectStates && (
                    <div className="grid grid-cols-2 gap-3">
                        <span className="text-sm text-gray-600">Destination state</span>
                        <select
                            value={filters.destinationState ?? ''}
                            onChange={(event) => handleStateChange(event.target.value)}
                            className="border rounded-md px-2 py-2 text-sm text-gray-700"
                        >
                            <option value="">All states</option>
                            {stateOptions.map((state) => (
                                <option key={state} value={state}>
                                    {state}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-gray-700">Destination Radius</span>
                    <span className="text-orange-600 font-semibold">
                        {destinationRadiusValue} mi
                    </span>
                </div>
                <Slider
                    value={[destinationRadiusValue]}
                    onValueChange={(value) => handleDestinationRadiusChange(value[0])}
                    min={25}
                    max={500}
                    step={25}
                    className="w-full"
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-gray-600">Drop Date</h3>
                    <span className="text-sm text-gray-500">
                        {formatDate(dropRange.from).dateStr} – {formatDate(dropRange.to).dateStr}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border hover:border-orange-300 transition-colors">
                    <div className="space-y-2">
                        <label className="text-gray-600 text-sm" htmlFor="drop-from">
                            From
                        </label>
                        <Input
                            id="drop-from"
                            type="date"
                            value={dropRange.from}
                            onChange={(event) => handleDropChange('from', event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-gray-600 text-sm" htmlFor="drop-to">
                            To
                        </label>
                        <Input
                            id="drop-to"
                            type="date"
                            value={dropRange.to}
                            min={dropRange.from}
                            onChange={(event) => handleDropChange('to', event.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div>
                <Button
                    variant="outline"
                    className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 py-4"
                    onClick={() => setShowAdvancedFilters(true)}
                >
                    <SlidersHorizontal className="w-5 h-5 mr-2" />
                    {advancedButtonLabel}
                </Button>
                {advancedSummary.length > 0 && (
                    <p className="mt-2 text-xs text-gray-500">{advancedSummary.join(' · ')}</p>
                )}
            </div>

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
                        onClick={resetFilters}
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

            <AdvancedFiltersDialog
                open={showAdvancedFilters}
                onOpenChange={setShowAdvancedFilters}
                value={{
                    minLoadedRpm: filters.minLoadedRpm,
                    minDistance: filters.minDistance,
                    maxDistance: filters.maxDistance,
                    serviceExclusions: filters.serviceExclusions,
                }}
                onApply={(values) => {
                    handleAdvancedApply(values);
                    setShowAdvancedFilters(false);
                }}
            />
        </div>
    );
}
