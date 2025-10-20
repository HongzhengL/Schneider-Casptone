import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Truck, SlidersHorizontal, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { AdvancedFiltersDialog } from './AdvancedFiltersDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { fetchDestinations } from '../services/api';
import type {
    AdvancedFilterValues,
    DestinationOption,
    LoadSearchFilters,
    Profile,
} from '../types/api';

interface SearchPageProps {
    onNavigate: (page: string) => void;
    filters: LoadSearchFilters;
    onFiltersChange: (filters: LoadSearchFilters) => void;
    createDefaultFilters: () => LoadSearchFilters;
    // Profiles management (optional)
    profiles?: Profile[];
    profilesLoading?: boolean;
    profilesError?: string | null;
    onCreateProfile?: (name: string) => Promise<Profile>;
    onUpdateProfile?: (id: string, name: string, filters?: LoadSearchFilters) => Promise<Profile>;
    onDeleteProfile?: (id: string) => Promise<void>;
    onApplyProfile?: (id: string) => Promise<LoadSearchFilters>;
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
    profiles = [],
    profilesLoading = false,
    profilesError = null,
    onCreateProfile,
    onUpdateProfile,
    onDeleteProfile,
    onApplyProfile,
}: SearchPageProps) {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectStates, setSelectStates] = useState(Boolean(filters.destinationState));
    const [destinations, setDestinations] = useState<DestinationOption[]>([]);
    const [destinationsLoading, setDestinationsLoading] = useState(true);
    const [destinationsError, setDestinationsError] = useState<string | null>(null);
    const [destinationQuery, setDestinationQuery] = useState<string>(filters.destination ?? '');
    // Origin search UI state (mirrors destination)
    const [originQuery, setOriginQuery] = useState<string>('');
    const [originOpen, setOriginOpen] = useState(false);
    const [originHighlighted, setOriginHighlighted] = useState(0);
    const ORIG_PAGE_SIZE = 10;
    const [origPage, setOrigPage] = useState(0);
    const [selectOriginStates, setSelectOriginStates] = useState(false);
    const [originState, setOriginState] = useState<string | null>(null);
    const [destOpen, setDestOpen] = useState(false);
    const [destHighlighted, setDestHighlighted] = useState(0);
    const DEST_PAGE_SIZE = 10;
    const [destPage, setDestPage] = useState(0);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const [showProfilesPanel, setShowProfilesPanel] = useState(false);
    // Profiles UI state
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [newProfileName, setNewProfileName] = useState('');
    const [renameValue, setRenameValue] = useState('');

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

    // When profiles load, if none selected, keep null. If an applied profile changed externally,
    // attempt to keep rename input in sync.
    useEffect(() => {
        if (!activeProfileId) return;
        const p = profiles.find((x) => x.id === activeProfileId);
        if (p) setRenameValue(p.name);
    }, [profiles, activeProfileId]);

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

    const filteredDestinations = useMemo(() => {
        const q = destinationQuery.trim().toLowerCase();
        if (!q) return destinations;
        return destinations.filter((o) =>
            [o.label, o.city, o.state].some((s) => (s ?? '').toLowerCase().includes(q))
        );
    }, [destinations, destinationQuery]);

    const visibleDestinations = useMemo(() => {
        const start = destPage * DEST_PAGE_SIZE;
        const end = start + DEST_PAGE_SIZE;
        return filteredDestinations.slice(start, end);
    }, [filteredDestinations, destPage]);

    useEffect(() => {
        // Clamp highlighted index to visible items
        if (destHighlighted >= visibleDestinations.length) {
            setDestHighlighted(visibleDestinations.length > 0 ? visibleDestinations.length - 1 : 0);
        }
    }, [visibleDestinations.length]);

    const totalDestPages = useMemo(
        () => Math.max(1, Math.ceil(filteredDestinations.length / DEST_PAGE_SIZE)),
        [filteredDestinations.length]
    );

    // Origin filtered/visible lists mirror destination logic
    const filteredOrigins = useMemo(() => {
        const q = originQuery.trim().toLowerCase();
        if (!q) return destinations;
        return destinations.filter((o) =>
            [o.label, o.city, o.state].some((s) => (s ?? '').toLowerCase().includes(q))
        );
    }, [destinations, originQuery]);

    const visibleOrigins = useMemo(() => {
        const start = origPage * ORIG_PAGE_SIZE;
        const end = start + ORIG_PAGE_SIZE;
        return filteredOrigins.slice(start, end);
    }, [filteredOrigins, origPage]);

    useEffect(() => {
        if (originHighlighted >= visibleOrigins.length) {
            setOriginHighlighted(visibleOrigins.length > 0 ? visibleOrigins.length - 1 : 0);
        }
    }, [visibleOrigins.length]);

    const totalOrigPages = useMemo(
        () => Math.max(1, Math.ceil(filteredOrigins.length / ORIG_PAGE_SIZE)),
        [filteredOrigins.length]
    );

    const goToNextOrigPage = () => {
        setOrigPage((p) => (p + 1 < totalOrigPages ? p + 1 : p));
        setOriginHighlighted(0);
    };

    const goToPrevOrigPage = () => {
        setOrigPage((p) => (p - 1 >= 0 ? p - 1 : p));
        setOriginHighlighted(0);
    };

    const goToNextPage = () => {
        setDestPage((p) => (p + 1 < totalDestPages ? p + 1 : p));
        setDestHighlighted(0);
    };

    const pickupRange = {
        from: filters.pickupDateFrom ?? uiDefaultRanges.pickup.from,
        to: filters.pickupDateTo ?? uiDefaultRanges.pickup.to,
    };

    const dropRange = {
        from: filters.dropDateFrom ?? uiDefaultRanges.drop.from,
        to: filters.dropDateTo ?? uiDefaultRanges.drop.to,
    };

    const originRadiusValue = filters.originRadius ?? 500;
    const destinationRadiusValue = filters.destinationRadius ?? 500;

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
        const defaults = createDefaultFilters();
        setSelectStates(Boolean(defaults.destinationState));
        onFiltersChange(defaults);
        // Reset origin UI-only state
        setOriginQuery('');
        setOriginOpen(false);
        setOriginHighlighted(0);
        setOrigPage(0);
        setSelectOriginStates(false);
        setOriginState(null);
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

    // Origin selection handler (UI-only)
    const selectOrigin = (opt: DestinationOption | null) => {
        if (!opt) {
            setOriginQuery('');
            setOriginOpen(false);
            return;
        }
        setOriginQuery(opt.label);
        setOriginOpen(false);
        if (selectOriginStates) {
            setOriginState(opt.state ?? null);
        }
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

    const handleOriginRadiusChange = (value: number) => {
        onFiltersChange({
            ...filters,
            originRadius: value,
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

    // Origin toggle for state auto-selection (UI-only)
    const handleOriginToggle = (checked: boolean | string) => {
        const enabled = checked === true;
        setSelectOriginStates(enabled);
        if (!enabled) {
            setOriginState(null);
        } else if (originQuery) {
            const match = destinations.find(
                (option) => option.label.toLowerCase() === originQuery.toLowerCase()
            );
            setOriginState(match?.state ?? null);
        }
    };

    const advancedButtonLabel = `Advanced Filters${
        activeAdvancedFilters ? ` (${activeAdvancedFilters})` : ''
    }`;

    // Compare current filters to a given profile's filters
    const areFiltersEqual = (a: LoadSearchFilters, b: LoadSearchFilters) => {
        const arrEq = (x: string[], y: string[]) =>
            x.length === y.length && x.every((v, i) => v === y[i]);
        return (
            a.minLoadedRpm === b.minLoadedRpm &&
            a.minDistance === b.minDistance &&
            a.maxDistance === b.maxDistance &&
            arrEq(a.serviceExclusions, b.serviceExclusions) &&
            a.confirmedOnly === b.confirmedOnly &&
            a.standardNetworkOnly === b.standardNetworkOnly &&
            a.destination === b.destination &&
            a.destinationState === b.destinationState &&
            a.destinationRadius === b.destinationRadius &&
            a.pickupDateFrom === b.pickupDateFrom &&
            a.pickupDateTo === b.pickupDateTo &&
            a.dropDateFrom === b.dropDateFrom &&
            a.dropDateTo === b.dropDateTo
        );
    };

    const activeProfile = activeProfileId
        ? (profiles.find((p) => p.id === activeProfileId) ?? null)
        : null;
    const isProfileModified = activeProfile
        ? !areFiltersEqual(filters, activeProfile.filters)
        : false;

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

            {/* Profile Selector */}
            <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 w-24">Profile</label>
                    <select
                        className="flex-1 border rounded px-2 py-2 text-sm"
                        value={activeProfileId || ''}
                        disabled={profilesLoading || profiles.length === 0}
                        onChange={async (e) => {
                            const selectedValue = e.target.value;

                            if (selectedValue === '') {
                                // User selected "None" - reset everything to defaults
                                setActiveProfileId(null);
                                setRenameValue('');
                                resetFilters();
                            } else {
                                // User selected a profile
                                setActiveProfileId(selectedValue);
                                if (onApplyProfile) {
                                    await onApplyProfile(selectedValue);
                                }
                                const p = profiles.find((x) => x.id === selectedValue);
                                setRenameValue(p?.name ?? '');
                            }
                        }}
                    >
                        <option value="">None</option>
                        {profiles.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Origin Search (mirrors Destination) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl">Pickup</h3>
                    <Button
                        variant="ghost"
                        className="text-orange-500 hover:text-orange-600 px-2"
                        onClick={() => {
                            setOriginQuery('');
                            setOriginOpen(false);
                            setOriginHighlighted(0);
                            setOrigPage(0);
                            setSelectOriginStates(false);
                            setOriginState(null);
                        }}
                    >
                        Reset
                    </Button>
                </div>

                <div className="flex items-center justify-between">
                    <span>Origin</span>
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
                                originOpen && visibleOrigins[originHighlighted]
                                    ? `origin-option-${originHighlighted}`
                                    : undefined
                            }
                            aria-autocomplete="list"
                            value={originQuery}
                            onChange={(e) => {
                                setOriginQuery(e.target.value);
                                setOriginOpen(true);
                                setOriginHighlighted(0);
                                setOrigPage(0);
                            }}
                            onFocus={() => setOriginOpen(true)}
                            onKeyDown={(e) => {
                                if (!visibleOrigins.length) return;
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setOriginOpen(true);
                                    setOriginHighlighted((i) => (i + 1) % visibleOrigins.length);
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setOriginOpen(true);
                                    setOriginHighlighted(
                                        (i) =>
                                            (i - 1 + visibleOrigins.length) % visibleOrigins.length
                                    );
                                } else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const opt = visibleOrigins[originHighlighted];
                                    if (opt) selectOrigin(opt);
                                } else if (e.key === 'Escape') {
                                    setOriginOpen(false);
                                }
                            }}
                            placeholder={
                                destinationsLoading
                                    ? 'Loading origins...'
                                    : destinationsError
                                      ? 'Unable to load origins'
                                      : 'Search origins'
                            }
                            disabled={destinationsLoading || Boolean(destinationsError)}
                            className="flex-1 border-0 bg-transparent text-sm text-gray-700 focus:outline-none"
                        />
                        {originQuery && !destinationsLoading && !destinationsError && (
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

                    {originOpen && !destinationsLoading && !destinationsError && (
                        <div
                            id="origins-listbox"
                            role="listbox"
                            aria-label="Origin options"
                            className="mt-2 border rounded-md overflow-hidden bg-white shadow-sm"
                            onTouchStart={(e) => {
                                const touch = e.changedTouches?.[0];
                                if (touch) {
                                    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
                                }
                            }}
                            onTouchEnd={(e) => {
                                const start = touchStartRef.current;
                                const touch = e.changedTouches?.[0];
                                if (start && touch) {
                                    const dx = touch.clientX - start.x;
                                    const dy = touch.clientY - start.y;
                                    const isHorizontal =
                                        Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30;
                                    if (isHorizontal) {
                                        if (dx < 0) {
                                            goToNextOrigPage();
                                        } else {
                                            goToPrevOrigPage();
                                        }
                                    }
                                }
                                touchStartRef.current = null;
                            }}
                        >
                            {visibleOrigins.map((option, idx) => (
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
                            {filteredOrigins.length > ORIG_PAGE_SIZE && (
                                <div className="px-3 py-2 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-600 select-none">
                                    <span>
                                        Page {origPage + 1} of {totalOrigPages}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            disabled={origPage === 0}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                goToPrevOrigPage();
                                            }}
                                        >
                                            Prev
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            disabled={origPage + 1 >= totalOrigPages}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                goToNextOrigPage();
                                            }}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {destinationsLoading && <p className="text-xs text-gray-500">Loading origins...</p>}
                {destinationsError && <p className="text-xs text-red-600">{destinationsError}</p>}

                {selectOriginStates && (
                    <div className="grid grid-cols-2 gap-3">
                        <span className="text-sm text-gray-600">Origin state</span>
                        <select
                            value={originState ?? ''}
                            onChange={(event) => setOriginState(event.target.value || null)}
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
                    <span className="text-gray-700">Origin Radius</span>
                    <span className="text-orange-600 font-semibold">{originRadiusValue} mi</span>
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
                    <h3 className="text-gray-600">Pick-up Date</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                            {formatDate(pickupRange.from).dateStr} –{' '}
                            {formatDate(pickupRange.to).dateStr}
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
                                destOpen && visibleDestinations[destHighlighted]
                                    ? `dest-option-${destHighlighted}`
                                    : undefined
                            }
                            aria-autocomplete="list"
                            value={destinationQuery}
                            onChange={(e) => {
                                setDestinationQuery(e.target.value);
                                setDestOpen(true);
                                setDestHighlighted(0);
                                setDestPage(0);
                            }}
                            onFocus={() => setDestOpen(true)}
                            onKeyDown={(e) => {
                                if (!visibleDestinations.length) return;
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setDestOpen(true);
                                    setDestHighlighted((i) => (i + 1) % visibleDestinations.length);
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setDestOpen(true);
                                    setDestHighlighted(
                                        (i) =>
                                            (i - 1 + visibleDestinations.length) %
                                            visibleDestinations.length
                                    );
                                } else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const opt = visibleDestinations[destHighlighted];
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
                            onTouchStart={(e) => {
                                const t = e.changedTouches[0];
                                touchStartRef.current = { x: t.clientX, y: t.clientY };
                            }}
                            onTouchEnd={(e) => {
                                const start = touchStartRef.current;
                                touchStartRef.current = null;
                                if (!start) return;
                                const t = e.changedTouches[0];
                                const dy = t.clientY - start.y;
                                const dx = t.clientX - start.x;
                                const absX = Math.abs(dx);
                                const absY = Math.abs(dy);
                                const V_THRESH = 30;
                                // Vertical swipe: move selection (and select)
                                if (absY > V_THRESH && absY > absX * 1.2) {
                                    if (dy < 0) {
                                        // swipe up → next item
                                        if (visibleDestinations.length === 0) return;
                                        if (destHighlighted < visibleDestinations.length - 1) {
                                            const idx = destHighlighted + 1;
                                            setDestHighlighted(idx);
                                            selectDestination(visibleDestinations[idx]);
                                        } else if (destPage + 1 < totalDestPages) {
                                            goToNextPage();
                                            // after page change, select first of next page
                                            setTimeout(() => {
                                                selectDestination(visibleDestinations[0] ?? null);
                                            }, 0);
                                        }
                                    } else {
                                        // swipe down → prev item
                                        if (visibleDestinations.length === 0) return;
                                        if (destHighlighted > 0) {
                                            const idx = destHighlighted - 1;
                                            setDestHighlighted(idx);
                                            selectDestination(visibleDestinations[idx]);
                                        } else if (destPage > 0) {
                                            goToPrevPage();
                                            // after page change, select last of prev page
                                            setTimeout(() => {
                                                const lastIdx = Math.min(
                                                    DEST_PAGE_SIZE - 1,
                                                    visibleDestinations.length - 1
                                                );
                                                selectDestination(
                                                    visibleDestinations[lastIdx] ?? null
                                                );
                                            }, 0);
                                        }
                                    }
                                    return;
                                }
                            }}
                        >
                            {visibleDestinations.map((option, idx) => (
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
                            {filteredDestinations.length > DEST_PAGE_SIZE && (
                                <div className="px-3 py-2 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-600 select-none">
                                    <span>
                                        Page {destPage + 1} of {totalDestPages}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            disabled={destPage === 0}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                goToPrevPage();
                                            }}
                                        >
                                            Prev
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            disabled={destPage + 1 >= totalDestPages}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                goToNextPage();
                                            }}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
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
                            {formatDate(dropRange.from).dateStr} –{' '}
                            {formatDate(dropRange.to).dateStr}
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
                        onClick={() => setShowProfilesPanel(true)}
                        aria-label="Open search profiles panel to save or manage profiles"
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

            {/* Profiles Panel */}
            <Dialog open={showProfilesPanel} onOpenChange={setShowProfilesPanel}>
                <DialogContent
                    className="w-full max-w-md sm:max-w-md p-6"
                    aria-describedby="profiles-panel-description"
                >
                    <DialogHeader>
                        <DialogTitle id="profiles-panel-title" className="text-lg">
                            Search Profiles
                        </DialogTitle>
                        <DialogDescription id="profiles-panel-description" className="sr-only">
                            Manage your saved search profiles. Load existing profiles, update or
                            delete them, or save your current search filters as a new profile.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {profilesError && (
                            <div
                                role="alert"
                                aria-live="assertive"
                                className="bg-red-50 border border-red-200 text-red-700 text-xs rounded p-2"
                            >
                                {profilesError}
                            </div>
                        )}

                        {/* Load Profile Section */}
                        <div>
                            <label
                                htmlFor="load-profile-select"
                                className="block text-sm font-semibold text-gray-800 mb-2"
                            >
                                Load Profile
                            </label>
                            <select
                                id="load-profile-select"
                                className="w-full border rounded px-3 py-2 text-sm bg-white"
                                value={activeProfileId || ''}
                                disabled={profilesLoading || profiles.length === 0}
                                aria-label="Select a saved search profile to load"
                                aria-describedby="load-profile-status"
                                onChange={async (e) => {
                                    const selectedValue = e.target.value;

                                    if (selectedValue === '') {
                                        // User selected "None" - reset everything to defaults
                                        setActiveProfileId(null);
                                        setRenameValue('');
                                        resetFilters();
                                    } else {
                                        // User selected a profile
                                        setActiveProfileId(selectedValue);
                                        if (onApplyProfile) {
                                            await onApplyProfile(selectedValue);
                                        }
                                        const p = profiles.find((x) => x.id === selectedValue);
                                        setRenameValue(p?.name ?? '');
                                    }
                                }}
                            >
                                <option value="">
                                    {profiles.length === 0
                                        ? 'No saved profiles'
                                        : 'Select a profile...'}
                                </option>
                                {profiles.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                            {profilesLoading && (
                                <p
                                    id="load-profile-status"
                                    className="text-xs text-gray-500 mt-1"
                                    role="status"
                                    aria-live="polite"
                                >
                                    Loading profiles...
                                </p>
                            )}
                        </div>

                        {/* Active Profile Status */}
                        {activeProfile && (
                            <div
                                className="bg-blue-50 border border-blue-200 rounded p-3"
                                role="region"
                                aria-labelledby="active-profile-heading"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p
                                            id="active-profile-heading"
                                            className="text-xs text-gray-600"
                                        >
                                            Active Profile
                                        </p>
                                        <p
                                            className="text-sm font-semibold text-gray-800"
                                            aria-label={`Current active profile: ${activeProfile.name}`}
                                        >
                                            {activeProfile.name}
                                        </p>
                                    </div>
                                    {isProfileModified && (
                                        <span
                                            className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded"
                                            role="status"
                                            aria-label="Profile has been modified since last save"
                                        >
                                            Modified
                                        </span>
                                    )}
                                </div>

                                {/* Update/Delete Actions for Active Profile */}
                                <div className="space-y-2">
                                    {isProfileModified && (
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                                            onClick={async () => {
                                                if (!activeProfileId || !onUpdateProfile) return;
                                                await onUpdateProfile(
                                                    activeProfileId,
                                                    renameValue.trim(),
                                                    filters
                                                );
                                            }}
                                            aria-label={`Update ${activeProfile.name} with current filter settings`}
                                        >
                                            Update Profile with Current Filters
                                        </Button>
                                    )}

                                    <div className="flex gap-2">
                                        <label htmlFor="rename-profile-input" className="sr-only">
                                            Rename profile
                                        </label>
                                        <Input
                                            id="rename-profile-input"
                                            placeholder="New profile name"
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            className="flex-1 text-sm"
                                            aria-label={`Rename ${activeProfile.name}`}
                                            aria-describedby="rename-profile-button"
                                        />
                                        <Button
                                            id="rename-profile-button"
                                            variant="outline"
                                            disabled={
                                                !renameValue.trim() ||
                                                renameValue === activeProfile.name
                                            }
                                            onClick={async () => {
                                                if (!activeProfileId || !onUpdateProfile) return;
                                                await onUpdateProfile(
                                                    activeProfileId,
                                                    renameValue.trim(),
                                                    filters
                                                );
                                            }}
                                            className="text-sm"
                                            aria-label={`Confirm rename to ${renameValue || 'new name'}`}
                                        >
                                            Rename
                                        </Button>
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full text-red-600 hover:bg-red-50 hover:border-red-300 text-sm"
                                        disabled={!onDeleteProfile}
                                        onClick={async () => {
                                            if (!activeProfileId || !onDeleteProfile) return;
                                            await onDeleteProfile(activeProfileId);
                                            setActiveProfileId(null);
                                            setRenameValue('');
                                        }}
                                        aria-label={`Delete profile ${activeProfile.name} permanently`}
                                    >
                                        Delete Profile
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Save New Profile Section */}
                        <div className="border-t pt-4">
                            <label
                                htmlFor="new-profile-name"
                                className="block text-sm font-semibold text-gray-800 mb-2"
                            >
                                Save as New Profile
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    id="new-profile-name"
                                    placeholder="Profile name..."
                                    value={newProfileName}
                                    onChange={(e) => setNewProfileName(e.target.value)}
                                    className="flex-1 text-sm"
                                    aria-label="Enter name for new profile"
                                    aria-describedby="new-profile-description"
                                    aria-required="true"
                                />
                                <Button
                                    disabled={!newProfileName.trim() || !onCreateProfile}
                                    onClick={async () => {
                                        if (!onCreateProfile || !newProfileName.trim()) return;
                                        const created = await onCreateProfile(
                                            newProfileName.trim()
                                        );
                                        setActiveProfileId(created.id);
                                        setRenameValue(created.name);
                                        setNewProfileName('');
                                    }}
                                    aria-label={`Save current filters as new profile named ${newProfileName || 'untitled'}`}
                                >
                                    Save
                                </Button>
                            </div>
                            <p id="new-profile-description" className="text-xs text-gray-500 mt-1">
                                Creates a new profile with your current filters
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
