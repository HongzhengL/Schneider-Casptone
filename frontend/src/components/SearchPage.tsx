import { useEffect, useMemo, useState } from 'react';
import { Bell, Truck, SlidersHorizontal, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { AdvancedFiltersDialog } from './AdvancedFiltersDialog';
import { fetchDestinations, fetchOrigins } from '../services/api';
import type { AdvancedFilterValues, DestinationOption, OriginOption, LoadSearchFilters } from '../types/api';

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
    const [selectOriginStates, setSelectOriginStates] = useState(Boolean(filters.originState));
    const [destinations, setDestinations] = useState<DestinationOption[]>([]);
    const [destinationsLoading, setDestinationsLoading] = useState(true);
    const [destinationsError, setDestinationsError] = useState<string | null>(null);
    const [destinationQuery, setDestinationQuery] = useState<string>(filters.destination ?? '');
    const [destOpen, setDestOpen] = useState(false);
    const [destHighlighted, setDestHighlighted] = useState(0);
    const [origins, setOrigins] = useState<OriginOption[]>([]);
    const [originsLoading, setOriginsLoading] = useState(true);
    const [originsError, setOriginsError] = useState<string | null>(null);
    const [originQuery, setOriginQuery] = useState<string>(filters.origin ?? '');
    const [originOpen, setOriginOpen] = useState(false);
    const [originHighlighted, setOriginHighlighted] = useState(0);

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
        setSelectOriginStates(Boolean(filters.originState));
    }, [filters.originState]);

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

    useEffect(() => {
        let mounted = true;
        const loadOrigins = async () => {
            try {
                const data = await fetchOrigins();
                if (!mounted) return;
                setOrigins(data);
                setOriginsLoading(false);
            } catch (err) {
                if (!mounted) return;
                setOriginsError(err instanceof Error ? err.message : 'Failed to load origins');
                setOriginsLoading(false);
            }
        };
        loadOrigins();
        return () => {
            mounted = false;
        };
    }, []);

    const stateOptions = useMemo(
        () =>
            Array.from(new Set(destinations.map((option) => option.state).filter(Boolean))).sort(),
        [destinations]
    );

    const originStateOptions = useMemo(
        () =>
            Array.from(new Set(origins.map((option) => option.state).filter(Boolean))).sort(),
        [origins]
    );

    const filteredDestinations = useMemo(() => {
        const q = destinationQuery.trim().toLowerCase();
        if (!q) return destinations;
        return destinations.filter((o) =>
            [o.label, o.city, o.state].some((s) => (s ?? '').toLowerCase().includes(q))
        );
    }, [destinations, destinationQuery]);

    const filteredOrigins = useMemo(() => {
        const q = originQuery.trim().toLowerCase();
        if (!q) return origins;
        return origins.filter((o) =>
            [o.label, o.city, o.state].some((s) => (s ?? '').toLowerCase().includes(q))
        );
    }, [origins, originQuery]);

    const pickupRange = {
        from: filters.pickupDateFrom ?? uiDefaultRanges.pickup.from,
        to: filters.pickupDateTo ?? uiDefaultRanges.pickup.to,
    };

    const dropRange = {
        from: filters.dropDateFrom ?? uiDefaultRanges.drop.from,
        to: filters.dropDateTo ?? uiDefaultRanges.drop.to,
    };

    const destinationRadiusValue = filters.destinationRadius ?? 500;
    const originRadiusValue = filters.originRadius ?? 500;

    // Preset date ranges: helpers to quickly set from/to
    const presetDefs = [
        { label: 'Today', fromOffset: 0, toOffset: 0 },
        { label: 'Next 3 days', fromOffset: 0, toOffset: 3 },
        { label: 'Next 7 days', fromOffset: 0, toOffset: 7 },
    ] as const;

    const applyPickupPreset = (fromOffset: number, toOffset: number) => {
        const today = new Date();
        const from = addDays(today, fromOffset);
        const to = addDays(today, toOffset);
        onFiltersChange({
            ...filters,
            pickupDateFrom: dateToInputValue(from),
            pickupDateTo: dateToInputValue(to),
        });
    };

    const applyDropPreset = (fromOffset: number, toOffset: number) => {
        const today = new Date();
        const from = addDays(today, fromOffset);
        const to = addDays(today, toOffset);
        onFiltersChange({
            ...filters,
            dropDateFrom: dateToInputValue(from),
            dropDateTo: dateToInputValue(to),
        });
    };

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
        setSelectOriginStates(Boolean(defaults.originState));
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

    const selectDestination = (opt: DestinationOption | null) => {
        if (!opt) {
            setDestinationQuery('');
            handleDestinationChange('');
            setDestOpen(false);
            return;
        }
        setDestinationQuery(opt.label);
        handleDestinationChange(opt.label);
        setDestOpen(false);
    };

    useEffect(() => {
        setDestinationQuery(filters.destination ?? '');
    }, [filters.destination]);

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

    const handleOriginChange = (value: string) => {
        if (!value) {
            onFiltersChange({
                ...filters,
                origin: null,
                originState: selectOriginStates ? filters.originState : null,
            });
            return;
        }
        const match = origins.find(
            (option) => option.label.toLowerCase() === value.toLowerCase()
        );
        onFiltersChange({
            ...filters,
            origin: value,
            originState: selectOriginStates ? (match?.state ?? null) : null,
        });
    };

    const selectOrigin = (opt: OriginOption | null) => {
        if (!opt) {
            setOriginQuery('');
            handleOriginChange('');
            setOriginOpen(false);
            return;
        }
        setOriginQuery(opt.label);
        handleOriginChange(opt.label);
        setOriginOpen(false);
    };

    useEffect(() => {
        setOriginQuery(filters.origin ?? '');
    }, [filters.origin]);

    const handleOriginStateChange = (state: string) => {
        onFiltersChange({
            ...filters,
            originState: state ? state : null,
        });
    };

    const handleOriginRadiusChange = (value: number) => {
        onFiltersChange({
            ...filters,
            originRadius: value,
        });
    };

    const handleOriginToggle = (checked: boolean | string) => {
        const enabled = checked === true;
        setSelectOriginStates(enabled);
        let nextState: string | null = null;
        if (enabled) {
            const originValue = filters.origin ?? null;
            if (originValue) {
                const match = origins.find(
                    (option) => option.label.toLowerCase() === originValue.toLowerCase()
                );
                nextState = match?.state ?? null;
            } else {
                nextState = filters.originState ?? null;
            }
        }
        onFiltersChange({
            ...filters,
            originState: enabled ? nextState : null,
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
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                            {formatDate(pickupRange.from).dateStr} – {formatDate(pickupRange.to).dateStr}
                        </span>
                        <div className="flex flex-wrap items-center gap-1">
                            {presetDefs.map((p) => (
                                <Button
                                    key={`pickup-${p.label}`}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs px-2 py-1"
                                    onClick={() => applyPickupPreset(p.fromOffset, p.toOffset)}
                                >
                                    {p.label}
                                </Button>
                            ))}
                        </div>
                    </div>
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
                    <h3 className="text-xl">Origin</h3>
                </div>

                <div className="flex items-center justify-between">
                    <span>Origin Location</span>
                    <div className="flex items-center gap-2">
                        <span>Select States</span>
                        <Switch checked={selectOriginStates} onCheckedChange={handleOriginToggle} />
                    </div>
                </div>

                <div className="p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            role="combobox"
                            aria-expanded={originOpen}
                            aria-controls="origins-listbox"
                            aria-activedescendant={
                                originOpen && filteredOrigins[originHighlighted]
                                    ? `origin-option-${originHighlighted}`
                                    : undefined
                            }
                            aria-autocomplete="list"
                            value={originQuery}
                            onChange={(e) => {
                                setOriginQuery(e.target.value);
                                setOriginOpen(true);
                                setOriginHighlighted(0);
                            }}
                            onFocus={() => setOriginOpen(true)}
                            onKeyDown={(e) => {
                                if (!filteredOrigins.length) return;
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setOriginOpen(true);
                                    setOriginHighlighted((i) => (i + 1) % filteredOrigins.length);
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setOriginOpen(true);
                                    setOriginHighlighted((i) =>
                                        (i - 1 + filteredOrigins.length) % filteredOrigins.length
                                    );
                                } else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const opt = filteredOrigins[originHighlighted];
                                    if (opt) selectOrigin(opt);
                                } else if (e.key === 'Escape') {
                                    setOriginOpen(false);
                                }
                            }}
                            placeholder={
                                originsLoading
                                    ? 'Loading origins...'
                                    : originsError
                                    ? 'Unable to load origins'
                                    : 'Search origins'
                            }
                            disabled={originsLoading || Boolean(originsError)}
                            className="flex-1 border-0 bg-transparent text-sm text-gray-700 focus:outline-none"
                        />
                        {originQuery && !originsLoading && !originsError && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-2"
                                onClick={() => selectOrigin(null)}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                    {originOpen && filteredOrigins.length > 0 && (
                        <div
                            id="origins-listbox"
                            role="listbox"
                            className="mt-2 max-h-60 overflow-y-auto border rounded-md bg-white shadow-sm"
                        >
                            {filteredOrigins.map((option, idx) => (
                                <div
                                    key={option.label}
                                    id={`origin-option-${idx}`}
                                    role="option"
                                    aria-selected={idx === originHighlighted}
                                    className={`px-3 py-2 text-sm cursor-pointer ${
                                        idx === originHighlighted
                                            ? 'bg-orange-50 text-orange-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                    onMouseEnter={() => setOriginHighlighted(idx)}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        selectOrigin(option);
                                    }}
                                >
                                    {option.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {originsLoading && (
                    <p className="text-xs text-gray-500">Loading origins…</p>
                )}
                {originsError && <p className="text-xs text-red-600">{originsError}</p>}

                {selectOriginStates && (
                    <div className="grid grid-cols-2 gap-3">
                        <span className="text-sm text-gray-600">Origin state</span>
                        <select
                            value={filters.originState ?? ''}
                            onChange={(event) => handleOriginStateChange(event.target.value)}
                            className="border rounded-md px-2 py-2 text-sm text-gray-700"
                        >
                            <option value="">All states</option>
                            {originStateOptions.map((state) => (
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
                    <span className="text-gray-700">Origin Radius</span>
                    <span className="text-orange-600 font-semibold">
                        {originRadiusValue} mi
                    </span>
                </div>
                <Slider
                    value={[originRadiusValue]}
                    onValueChange={(value) => handleOriginRadiusChange(value[0])}
                    min={25}
                    max={500}
                    step={25}
                    className="w-full"
                />
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

                <div className="p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            role="combobox"
                            aria-expanded={destOpen}
                            aria-controls="destinations-listbox"
                            aria-activedescendant={
                                destOpen && filteredDestinations[destHighlighted]
                                    ? `dest-option-${destHighlighted}`
                                    : undefined
                            }
                            aria-autocomplete="list"
                            value={destinationQuery}
                            onChange={(e) => {
                                setDestinationQuery(e.target.value);
                                setDestOpen(true);
                                setDestHighlighted(0);
                            }}
                            onFocus={() => setDestOpen(true)}
                            onKeyDown={(e) => {
                                if (!filteredDestinations.length) return;
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setDestOpen(true);
                                    setDestHighlighted((i) => (i + 1) % filteredDestinations.length);
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setDestOpen(true);
                                    setDestHighlighted((i) =>
                                        (i - 1 + filteredDestinations.length) % filteredDestinations.length
                                    );
                                } else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const opt = filteredDestinations[destHighlighted];
                                    if (opt) selectDestination(opt);
                                } else if (e.key === 'Escape') {
                                    setDestOpen(false);
                                }
                            }}
                            placeholder={
                                destinationsLoading
                                    ? 'Loading destinations...'
                                    : destinationsError
                                    ? 'Unable to load destinations'
                                    : 'Search destinations'
                            }
                            disabled={destinationsLoading || Boolean(destinationsError)}
                            className="flex-1 border-0 bg-transparent text-sm text-gray-700 focus:outline-none"
                        />
                        {destinationQuery && !destinationsLoading && !destinationsError && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-2"
                                onClick={() => selectDestination(null)}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                    {destOpen && filteredDestinations.length > 0 && (
                        <div
                            id="destinations-listbox"
                            role="listbox"
                            className="mt-2 max-h-60 overflow-y-auto border rounded-md bg-white shadow-sm"
                        >
                            {filteredDestinations.map((option, idx) => (
                                <div
                                    key={option.label}
                                    id={`dest-option-${idx}`}
                                    role="option"
                                    aria-selected={idx === destHighlighted}
                                    className={`px-3 py-2 text-sm cursor-pointer ${
                                        idx === destHighlighted
                                            ? 'bg-orange-50 text-orange-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                    onMouseEnter={() => setDestHighlighted(idx)}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        selectDestination(option);
                                    }}
                                >
                                    {option.label}
                                </div>
                            ))}
                        </div>
                    )}
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
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                            {formatDate(dropRange.from).dateStr} – {formatDate(dropRange.to).dateStr}
                        </span>
                        <div className="flex flex-wrap items-center gap-1">
                            {presetDefs.map((p) => (
                                <Button
                                    key={`drop-${p.label}`}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs px-2 py-1"
                                    onClick={() => applyDropPreset(p.fromOffset, p.toOffset)}
                                >
                                    {p.label}
                                </Button>
                            ))}
                        </div>
                    </div>
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
