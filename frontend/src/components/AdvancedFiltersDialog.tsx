import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Info, RotateCcw } from 'lucide-react';
import type { AdvancedFilterValues } from '../types/api';

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
    const [minDistance, setMinDistance] = useState<number>(0);
    const [maxDistance, setMaxDistance] = useState<number>(Number.POSITIVE_INFINITY);
    const [serviceExclusions, setServiceExclusions] = useState<string[]>([]);
    const [exclusionQuery, setExclusionQuery] = useState('');

    useEffect(() => {
        setMinLoadedRpm(value.minLoadedRpm != null ? value.minLoadedRpm : null);
        setMinDistance(value.minDistance != null ? value.minDistance : 0);
        setMaxDistance(value.maxDistance != null ? value.maxDistance : Number.POSITIVE_INFINITY);
        setServiceExclusions(value.serviceExclusions);
    }, [value, open]);

    const serviceExclusionOptions = [
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
    ];

    const filteredExclusionOptions = useMemo(() => {
        const q = exclusionQuery.trim().toLowerCase();
        if (!q) return serviceExclusionOptions;
        return serviceExclusionOptions.filter(
            (o) => o.label.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
        );
    }, [exclusionQuery]);

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
        setServiceExclusions(serviceExclusions.filter((id) => !ids.has(id)));
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
        // Only react to distance changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Min Loaded RPM */}
                    <div className="space-y-2">
                        <label className="text-lg">Min Loaded RPM</label>
                        <Select
                            value={minLoadedRpm == null ? 'no-min' : minLoadedRpm.toFixed(2)}
                            onValueChange={(v) => setMinLoadedRpm(v === 'no-min' ? null : Number(v))}
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
                    </div>

                    {/* Loaded Distance */}
                    <div className="space-y-4">
                        <label className="text-lg">Loaded Distance</label>
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
                                    value={Number.isFinite(maxDistance) ? String(maxDistance) : '1000+'}
                                    onValueChange={(v) =>
                                        setMaxDistance(v === '1000+' ? Number.POSITIVE_INFINITY : Number(v))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['100', '200', '300', '400', '500', '750', '1000', '1000+'].map(
                                            (opt) => {
                                                const isDisabled = opt !== '1000+' && Number(opt) < minDistance;
                                                return (
                                                    <SelectItem key={opt} value={opt} disabled={isDisabled}>
                                                        {opt}
                                                    </SelectItem>
                                                );
                                            }
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Service Exclusion */}
                    <div className="space-y-4">
                        <label className="text-lg">Service Exclusion</label>
                        <div className="flex items-center gap-2">
                            <Input
                                value={exclusionQuery}
                                onChange={(e) => setExclusionQuery(e.target.value)}
                                placeholder="Search exclusions..."
                                className="flex-1"
                            />
                            <Button variant="outline" size="sm" onClick={handleClearAllFiltered}>
                                Clear All
                            </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                            {filteredExclusionOptions.map((option) => (
                                <div key={option.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={option.id}
                                        checked={serviceExclusions.includes(option.id)}
                                        onCheckedChange={(checked) =>
                                            handleExclusionChange(option.id, checked === true)
                                        }
                                    />
                                    <label
                                        htmlFor={option.id}
                                        className="text-sm text-gray-700 cursor-pointer leading-tight"
                                    >
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

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
