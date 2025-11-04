import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Info, RotateCcw } from 'lucide-react';
import type { AdvancedFilterValues } from '../types/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface AdvancedFiltersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    value: AdvancedFilterValues;
    onApply: (value: AdvancedFilterValues) => void;
}

export function AdvancedFiltersDialog({
    open,
    onOpenChange,
    value,
    onApply,
}: AdvancedFiltersDialogProps) {
    const [minLoadedRpm, setMinLoadedRpm] = useState<number | null>(null);
    const [minRcpm, setMinRcpm] = useState<number | null>(null);
    const [minDistance, setMinDistance] = useState<number>(0);
    const [maxDistance, setMaxDistance] = useState<number>(Number.POSITIVE_INFINITY);
    const [serviceExclusions, setServiceExclusions] = useState<string[]>([]);
    const [exclusionQuery, setExclusionQuery] = useState('');
    const [inclusionMode, setInclusionMode] = useState(false);

    useEffect(() => {
        setMinLoadedRpm(value.minLoadedRpm != null ? value.minLoadedRpm : null);
        setMinRcpm(value.minRcpm != null ? value.minRcpm : null);
        setMinDistance(value.minDistance != null ? value.minDistance : 0);
        setMaxDistance(value.maxDistance != null ? value.maxDistance : Number.POSITIVE_INFINITY);
        setServiceExclusions(value.serviceExclusions);
    }, [value, open]);

    const serviceExclusionOptions = useMemo(
        () => [
            { id: 'twic', label: 'TWIC' },
            { id: 'customer-live-load', label: 'CUSTOMER LIVE LOAD' },
            { id: 'customer-live-unload', label: 'CUSTOMER LIVE UNLOAD' },
            { id: 'hazmat', label: 'HAZMAT' },
            { id: 'live-load', label: 'LIVE LOAD' },
            { id: 'live-unload', label: 'LIVE UNLOAD' },
            { id: 'high-value', label: 'HIGH VALUE' },
            { id: 'lumper-load', label: 'LUMPER LOAD' },
            { id: 'lumper-unload', label: 'LUMPER UNLOAD' },
            { id: 'stop-off', label: 'STOP OFF' },
            { id: 'driver-assist-load', label: 'DRIVER ASSIST LOAD' },
            { id: 'driver-assist-unload', label: 'DRIVER ASSIST UNLOAD' },
            { id: 'trailer-shuttle', label: 'TRAILER SHUTTLE' },
            { id: 'driver-load', label: 'DRIVER LOAD' },
            { id: 'driver-unload', label: 'DRIVER UNLOAD' },
            { id: 'trailer-spot', label: 'TRAILER SPOT' },
            { id: 'pick-up-relay', label: 'PICK UP RELAY' },
            { id: 'drop-relay', label: 'DROP RELAY' },
        ],
        []
    );

    const filteredExclusionOptions = useMemo(() => {
        const q = exclusionQuery.trim().toLowerCase();
        if (!q) return serviceExclusionOptions;
        return serviceExclusionOptions.filter(
            (o) => o.label.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
        );
    }, [exclusionQuery, serviceExclusionOptions]);

    const exclusionLabelById = useMemo(() => {
        const map: Record<string, string> = {};
        for (const o of serviceExclusionOptions) map[o.id] = o.label;
        return map;
    }, [serviceExclusionOptions]);

    const filteredIdSet = useMemo(
        () => new Set(filteredExclusionOptions.map((o) => o.id)),
        [filteredExclusionOptions]
    );

    const serviceGroups = useMemo(
        () => [
            { key: 'compliance', label: 'Compliance', ids: ['twic', 'hazmat', 'high-value'] },
            {
                key: 'customer-live',
                label: 'Customer Live',
                ids: ['customer-live-load', 'customer-live-unload'],
            },
            { key: 'live', label: 'Live', ids: ['live-load', 'live-unload'] },
            { key: 'lumper', label: 'Lumper', ids: ['lumper-load', 'lumper-unload'] },
            {
                key: 'driver-assist',
                label: 'Driver Assist',
                ids: ['driver-assist-load', 'driver-assist-unload'],
            },
            {
                key: 'driver-load',
                label: 'Driver Load/Unload',
                ids: ['driver-load', 'driver-unload'],
            },
            { key: 'trailer', label: 'Trailer', ids: ['trailer-shuttle', 'trailer-spot'] },
            { key: 'relay', label: 'Relay', ids: ['pick-up-relay', 'drop-relay'] },
            { key: 'stops', label: 'Stops', ids: ['stop-off'] },
        ],
        []
    );

    const handleExclusionChange = (id: string, checked: boolean) => {
        if (checked) {
            if (!serviceExclusions.includes(id)) {
                setServiceExclusions([...serviceExclusions, id]);
            }
        } else {
            setServiceExclusions(serviceExclusions.filter((item) => item !== id));
        }
    };

    const handleClearAllFiltered = () => {
        const ids = new Set(filteredExclusionOptions.map((o) => o.id));
        if (inclusionMode) {
            // In inclusion mode, clearing means unchecking all filtered (i.e., exclude them)
            const next = new Set(serviceExclusions);
            ids.forEach((id) => next.add(id));
            setServiceExclusions(Array.from(next));
        } else {
            // In exclusion mode, clearing means remove filtered from exclusions
            setServiceExclusions(serviceExclusions.filter((id) => !ids.has(id)));
        }
    };

    const handleReset = () => {
        setMinLoadedRpm(null);
        setMinDistance(0);
        setMaxDistance(Number.POSITIVE_INFINITY);
        setServiceExclusions([]);
    };

    const handleAccept = () => {
        // Enforce minDistance <= maxDistance at accept time
        const adjustedMaxNumber =
            Number.isFinite(maxDistance) && minDistance > (maxDistance as number)
                ? Number.POSITIVE_INFINITY
                : maxDistance;

        onApply({
            minLoadedRpm: minLoadedRpm,
            minRcpm: minRcpm,
            minDistance: minDistance === 0 ? null : minDistance,
            maxDistance: adjustedMaxNumber === Number.POSITIVE_INFINITY ? null : adjustedMaxNumber,
            serviceExclusions: [...serviceExclusions].sort(),
        });
        onOpenChange(false);
    };

    // Auto-correct invalid state if user raises min above current max
    useEffect(() => {
        if (Number.isFinite(maxDistance) && minDistance > (maxDistance as number)) {
            setMaxDistance(Number.POSITIVE_INFINITY);
        }
    }, [minDistance, maxDistance]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-orange-500" />
                            <span>Advanced Filters</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                        >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reset
                        </Button>
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Configure advanced filtering options for load search including minimum RPM,
                        distance range, and service exclusions.
                    </DialogDescription>
                    {(() => {
                        const chips: string[] = [];
                        if (minLoadedRpm != null) chips.push(`Min RPM $${minLoadedRpm.toFixed(2)}`);
                        if (minRcpm != null) chips.push(`Min RCPM $${minRcpm.toFixed(2)}`);
                        if (minDistance > 0) chips.push(`Min ${minDistance} mi`);
                        if (Number.isFinite(maxDistance)) chips.push(`Max ${maxDistance} mi`);
                        if (serviceExclusions.length > 0)
                            chips.push(`${serviceExclusions.length} exclusions`);
                        if (chips.length === 0) return null;
                        return (
                            <div className="mt-1 space-y-1">
                                <div className="text-xs text-gray-500">Active: {chips.length}</div>
                                <div className="flex flex-wrap gap-1">
                                    {chips.map((c) => (
                                        <Badge key={c} variant="secondary">
                                            {c}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Min Loaded RPM */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Rate</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Select
                                value={minLoadedRpm == null ? 'no-min' : minLoadedRpm.toFixed(2)}
                                onValueChange={(v) =>
                                    setMinLoadedRpm(v === 'no-min' ? null : Number(v))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no-min">No Min</SelectItem>
                                    <SelectItem value="1.00">$1.00</SelectItem>
                                    <SelectItem value="1.25">$1.25</SelectItem>
                                    <SelectItem value="1.50">$1.50</SelectItem>
                                    <SelectItem value="1.75">$1.75</SelectItem>
                                    <SelectItem value="2.00">$2.00</SelectItem>
                                    <SelectItem value="2.25">$2.25</SelectItem>
                                    <SelectItem value="2.50">$2.50</SelectItem>
                                    <SelectItem value="2.75">$2.75</SelectItem>
                                    <SelectItem value="3.00">$3.00</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Loaded Distance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Distance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-600">Minimum</label>
                                    <Select
                                        value={String(minDistance)}
                                        onValueChange={(v) => setMinDistance(Number(v))}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">0</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                            <SelectItem value="200">200</SelectItem>
                                            <SelectItem value="300">300</SelectItem>
                                            <SelectItem value="400">400</SelectItem>
                                            <SelectItem value="500">500</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-600">Maximum</label>
                                    <Select
                                        value={
                                            Number.isFinite(maxDistance)
                                                ? String(maxDistance)
                                                : '1000+'
                                        }
                                        onValueChange={(v) =>
                                            setMaxDistance(
                                                v === '1000+' ? Number.POSITIVE_INFINITY : Number(v)
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[
                                                '100',
                                                '200',
                                                '300',
                                                '400',
                                                '500',
                                                '750',
                                                '1000',
                                                '1000+',
                                            ].map((opt) => {
                                                const isDisabled =
                                                    opt !== '1000+' && Number(opt) < minDistance;
                                                return (
                                                    <SelectItem
                                                        key={opt}
                                                        value={opt}
                                                        disabled={isDisabled}
                                                    >
                                                        {opt}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service Inclusion/Exclusion */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>
                                    {inclusionMode ? 'Service Inclusion' : 'Service Exclusion'}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <span>Inclusion</span>
                                    <Switch
                                        checked={inclusionMode}
                                        onCheckedChange={(v) => setInclusionMode(v === true)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Input
                                    value={exclusionQuery}
                                    onChange={(e) => setExclusionQuery(e.target.value)}
                                    placeholder={
                                        inclusionMode
                                            ? 'Search inclusions...'
                                            : 'Search exclusions...'
                                    }
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearAllFiltered}
                                >
                                    Clear All
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {serviceGroups.map((group) => {
                                    const visibleIds = group.ids.filter((id) =>
                                        filteredIdSet.has(id)
                                    );
                                    if (visibleIds.length === 0) return null;
                                    const selectedCount = visibleIds.filter((id) =>
                                        serviceExclusions.includes(id)
                                    ).length;
                                    const includedCount = inclusionMode
                                        ? visibleIds.length - selectedCount
                                        : selectedCount;
                                    return (
                                        <details key={group.key} className="border rounded-md">
                                            <summary className="px-3 py-2 cursor-pointer select-none flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-800">
                                                    {group.label}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {includedCount} selected
                                                </span>
                                            </summary>
                                            <div className="mt-2 grid grid-cols-3 gap-x-4 gap-y-3 px-3 pb-3">
                                                {visibleIds.map((id) => (
                                                    <div
                                                        key={id}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <Checkbox
                                                            id={id}
                                                            checked={
                                                                inclusionMode
                                                                    ? !serviceExclusions.includes(
                                                                          id
                                                                      )
                                                                    : serviceExclusions.includes(id)
                                                            }
                                                            onCheckedChange={(checked) => {
                                                                const isChecked = checked === true;
                                                                if (inclusionMode) {
                                                                    if (isChecked) {
                                                                        setServiceExclusions(
                                                                            (prev) =>
                                                                                prev.filter(
                                                                                    (x) => x !== id
                                                                                )
                                                                        );
                                                                    } else {
                                                                        setServiceExclusions(
                                                                            (prev) =>
                                                                                prev.includes(id)
                                                                                    ? prev
                                                                                    : [...prev, id]
                                                                        );
                                                                    }
                                                                } else {
                                                                    handleExclusionChange(
                                                                        id,
                                                                        isChecked
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor={id}
                                                            className="text-sm text-gray-700 cursor-pointer leading-tight"
                                                        >
                                                            {exclusionLabelById[id]}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* RCPM Filter */}
                    <Card className="border border-border">
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm">Rate Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 py-3 px-4">
                            <div>
                                <label
                                    htmlFor="min-rcpm"
                                    className="block text-sm font-medium mb-1"
                                >
                                    Minimum RCPM
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">$</span>
                                    <Input
                                        id="min-rcpm"
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        min={0}
                                        value={minRcpm ?? ''}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (v === '') {
                                                setMinRcpm(null);
                                            } else {
                                                const n = Number(v);
                                                setMinRcpm(
                                                    Number.isFinite(n) ? Math.max(0, n) : null
                                                );
                                            }
                                        }}
                                        className="w-28"
                                        placeholder="e.g. 1.75"
                                        aria-label="Minimum RCPM"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Filters by revenue per combined mile.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={handleAccept}
                        >
                            Accept
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
