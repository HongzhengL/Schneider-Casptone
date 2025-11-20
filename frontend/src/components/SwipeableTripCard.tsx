import { useState, useRef } from 'react';
import { motion, PanInfo } from 'motion/react';
import { Eye, RotateCcw, X, TrendingUp, TrendingDown, Check, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import type { ProfitabilitySettings } from './ProfitabilitySettingsPage';
import { calculateDriverRollingCpm, calculateMarginThreshold } from '../utils/profitability';

interface Trip {
    id: string;
    price: string;
    distance: string;
    weight: string;
    loadedRpm: string;
    totalRpm: string;
    rcpm?: string;
    // Optional numeric fields from API (used for verdicts)
    priceNum?: number;
    distanceNum?: number;
    distanceToOrigin?: number;
    loadedRpmNum?: number;
    totalRpmNum?: number;
    rcpmNum?: number;
    loadType: string;
    fromLocation: string;
    fromDate: string;
    toLocation: string;
    toDate: string;
    details: string;
    hasReload: boolean;
}

interface Metric {
    id: string;
    label: string;
    enabled: boolean;
}

interface SwipeableTripCardProps {
    trip: Trip;
    customMetrics: Metric[];
    onDislike: (tripId: string) => void;
    onUndoDislike: (tripId: string) => void;
    onCompare?: (tripId: string) => void;
    profitabilitySettings: ProfitabilitySettings;
    isCompared?: boolean;
}

export function SwipeableTripCard({
    trip,
    customMetrics,
    onDislike,
    onUndoDislike,
    onCompare,
    profitabilitySettings,
    isCompared = false,
}: SwipeableTripCardProps) {
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const formatCurrency = (value: number) => currencyFormatter.format(value);
    const formatPerMile = (value: number) => `${formatCurrency(Math.abs(value))}/mi`;

    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const enabledMetrics = customMetrics.filter(
        (m) => m.enabled && m.id !== 'rcpm' && !m.id.startsWith('right_')
    );

    const isRightMetricEnabled = (id: string) => {
        const metric = customMetrics.find((m) => m.id === id);
        return metric ? metric.enabled : true;
    };
    const driverRcpm = calculateDriverRollingCpm(profitabilitySettings);
    const marginThreshold = calculateMarginThreshold(profitabilitySettings, driverRcpm);

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setDragX(info.offset.x);
    };

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false);
        setDragX(0);

        // If swiped left more than 150px, trigger dislike
        if (info.offset.x < -150) {
            onDislike(trip.id);

            // Show toast with undo option
            toast(`Trip ${trip.fromLocation} → ${trip.toLocation} disliked`, {
                duration: 5000,
                action: {
                    label: 'Undo',
                    onClick: () => onUndoDislike(trip.id),
                },
                icon: <RotateCcw className="w-4 h-4" />,
            });
        }
        // If swiped right more than 150px, trigger compare
        else if (info.offset.x > 150 && onCompare) {
            if (isCompared) {
                toast.info(`Load already in comparison list`);
                return;
            }

            onCompare(trip.id);
            toast.success(`Load added to compare`, {
                duration: 3000,
            });
        }
    };

    const getCardTransform = () => {
        if (!isDragging) return { x: 0 };
        // Allow swiping both directions but limit to 200px
        return { x: Math.max(-200, Math.min(200, dragX)) };
    };

    const renderMetricValue = (metricId: string) => {
        switch (metricId) {
            case 'distance':
                return trip.distance;
            case 'weight':
                return trip.weight;
            case 'loadedRpm':
                return trip.loadedRpm;
            case 'totalRpm':
                return trip.totalRpm;
            case 'loadType':
                return trip.loadType;
            default:
                return '';
        }
    };

    const renderMetricLabel = (metricId: string) => {
        switch (metricId) {
            case 'distance':
                return 'Distance:';
            case 'weight':
                return 'Weight:';
            case 'loadedRpm':
                return 'Loaded RPM:';
            case 'totalRpm':
                return 'Est Total RPM:';
            case 'loadType':
                return 'Load Type:';
            default:
                return '';
        }
    };

    // Day/Night icon helpers (avoid regex with surrogate pairs for lint compatibility)
    const hasDayNightIcon = (text: string) => {
        const t = text ?? '';
        const icons = ['☀', '🌙', '🌞', '🌜'];
        return icons.some((ch) => t.includes(ch));
    };

    const parseHour = (text: string): number[] => {
        const hours: number[] = [];
        const lower = text.toLowerCase();

        // Handle special words
        if (/(midnight)/.test(lower)) hours.push(0);
        if (/(noon)/.test(lower)) hours.push(12);

        // 12-hour format with optional minutes and am/pm
        const ampmRegex = /(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\b/gi;
        let m: RegExpExecArray | null;
        while ((m = ampmRegex.exec(lower)) !== null) {
            let h = parseInt(m[1], 10);
            const isPM = m[3].startsWith('p');
            if (h === 12) h = 0;
            h = isPM ? h + 12 : h;
            hours.push(h);
        }

        // 24-hour format times (avoid matching dates by requiring colon)
        const h24Regex = /\b(\d{1,2}):(\d{2})\b/g;
        while ((m = h24Regex.exec(lower)) !== null) {
            const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
            hours.push(h);
        }

        // Compact ranges like 6p-10p or 6am-10am
        const compactRegex = /\b(\d{1,2})\s*(a|p)m?\s*-\s*(\d{1,2})\s*(a|p)m?\b/gi;
        while ((m = compactRegex.exec(lower)) !== null) {
            const startRaw = parseInt(m[1], 10);
            const endRaw = parseInt(m[3], 10);
            const start = (startRaw % 12) + (m[2] === 'p' ? 12 : 0);
            const end = (endRaw % 12) + (m[4] === 'p' ? 12 : 0);
            hours.push(start, end);
        }

        return hours;
    };

    const isNightHour = (h: number) => h < 6 || h >= 18;

    const renderTimeIcon = (text: string) => {
        if (!text || hasDayNightIcon(text)) return null;
        const hours = parseHour(text);
        if (hours.length === 0) return null;
        const anyNight = hours.some(isNightHour);
        const anyDay = hours.some((h) => !isNightHour(h));
        // If spans both day and night, prefer moon to be conservative
        const showMoon = anyNight && !anyDay ? true : anyNight;
        return (
            <span aria-label={showMoon ? 'Night' : 'Day'} title={showMoon ? 'Night' : 'Day'}>
                {showMoon ? '🌙' : '☀️'}
            </span>
        );
    };

    const computeTotalRpm = (t: Trip): number | undefined => {
        if (typeof t.totalRpmNum === 'number') return t.totalRpmNum;
        if (
            typeof t.priceNum === 'number' &&
            typeof t.distanceNum === 'number' &&
            t.distanceNum > 0
        ) {
            return Number((t.priceNum / t.distanceNum).toFixed(2));
        }
        return undefined;
    };

    const totalRpmValue = computeTotalRpm(trip);
    const netPerMile =
        totalRpmValue != null ? Number((totalRpmValue - driverRcpm).toFixed(2)) : undefined;
    const netTotal =
        netPerMile != null && typeof trip.distanceNum === 'number'
            ? Number((netPerMile * trip.distanceNum).toFixed(2))
            : undefined;
    const netColor = netPerMile != null && netPerMile < 0 ? 'text-red-600' : 'text-green-600';
    const NetTrendIcon = netPerMile != null && netPerMile < 0 ? TrendingDown : TrendingUp;

    return (
        <div className="relative rounded-lg overflow-hidden">
            {/* Background Action Area - Revealed when swiping left (dislike) */}
            {isDragging && dragX < 0 && (
                <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6 rounded-lg z-0">
                    <div className="flex items-center text-white">
                        <div className="flex flex-col items-center gap-1">
                            <X className="w-8 h-8" />
                            <span className="text-sm font-medium">Dislike</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Background Action Area - Revealed when swiping right (compare) */}
            {isDragging && dragX > 0 && (
                <div
                    className={`absolute inset-0 ${isCompared ? 'bg-gray-500' : 'bg-green-500'} flex items-center justify-start px-6 rounded-lg z-0`}
                >
                    <div className="flex items-center text-white">
                        <div className="flex flex-col items-center gap-1">
                            {isCompared ? (
                                <ClipboardList className="w-8 h-8" />
                            ) : (
                                <Check className="w-8 h-8" />
                            )}
                            <span className="text-sm font-medium">
                                {isCompared ? 'Already Added' : 'Compare'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Card - Slides over the background */}
            <motion.div
                ref={cardRef}
                drag="x"
                dragConstraints={{ left: -200, right: 200 }}
                dragElastic={0.1}
                dragMomentum={false}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={getCardTransform()}
                className={`bg-white rounded-lg border shadow-sm relative cursor-grab active:cursor-grabbing z-10 ${isCompared ? 'border-green-500 ring-1 ring-green-500' : ''}`}
                style={{ touchAction: 'pan-x' }}
            >
                {isCompared && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg z-20 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Added
                    </div>
                )}
                <div className="p-4">
                    <div className="flex gap-4">
                        {/* Left Side - Price and Custom Metrics */}
                        <div className="w-24 space-y-2">
                            <div className="text-2xl font-bold">{trip.price}</div>
                            {netPerMile != null && (
                                <div
                                    className={`text-sm font-medium flex items-center gap-1 ${netColor}`}
                                >
                                    <NetTrendIcon
                                        className={`w-4 h-4 ${netColor}`}
                                        aria-hidden="true"
                                    />
                                    <span>{`${netPerMile >= 0 ? '+' : '-'}${formatPerMile(netPerMile)}`}</span>
                                </div>
                            )}
                            {netTotal != null && (
                                <div className={`text-sm font-medium ${netColor}`}>
                                    Net:{' '}
                                    {`${netTotal >= 0 ? '+' : '-'}${formatCurrency(Math.abs(netTotal))}`}
                                </div>
                            )}

                            {enabledMetrics.map((metric) => {
                                const isRpmMetric =
                                    metric.id === 'loadedRpm' || metric.id === 'totalRpm';

                                // Verdict helpers for Est Total RPM vs RCPM
                                const getVerdictForTotalRpm = (t: Trip) => {
                                    const total = computeTotalRpm(t);
                                    if (total == null) {
                                        return {
                                            className: 'text-gray-600',
                                            verdict: 'Unknown',
                                            title: 'Insufficient data to assess',
                                        } as const;
                                    }
                                    const margin = marginThreshold;
                                    let className = 'text-amber-600';
                                    let verdict = 'At cost';
                                    if (total >= driverRcpm + margin) {
                                        className = 'text-green-600';
                                        verdict = 'Contributes';
                                    } else if (total < driverRcpm - margin) {
                                        className = 'text-red-600';
                                        verdict = 'Burns cash';
                                    }
                                    const title = `${verdict}: Total RPM ${total.toFixed(
                                        2
                                    )} vs Driver CPM ${driverRcpm.toFixed(2)} (margin ${margin.toFixed(
                                        2
                                    )})`;
                                    return { className, verdict, title } as const;
                                };

                                const content = renderMetricValue(metric.id);
                                if (isRpmMetric) {
                                    const verdict =
                                        metric.id === 'totalRpm'
                                            ? getVerdictForTotalRpm(trip)
                                            : null;
                                    const valueClass = verdict?.className ?? 'text-orange-500';
                                    const title = verdict?.title ?? undefined;
                                    return (
                                        <div key={metric.id} className="text-sm">
                                            <div className="space-y-1">
                                                <div className="text-gray-600 font-bold">
                                                    {renderMetricLabel(metric.id)}
                                                </div>
                                                <div
                                                    className={`${valueClass} font-bold flex items-center gap-1`}
                                                    title={title}
                                                >
                                                    <span>{content}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                const getMetricColor = (metricId: string) => {
                                    switch (metricId) {
                                        case 'distance':
                                            return 'text-orange-500';
                                        case 'weight':
                                            return 'text-orange-500';
                                        case 'loadType':
                                            return 'text-orange-500';
                                        default:
                                            return 'text-gray-600';
                                    }
                                };
                                return (
                                    <div key={metric.id} className="text-sm">
                                        <div className={`${getMetricColor(metric.id)} font-bold`}>
                                            {content}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Side - Route Details */}
                        <div className="flex-1">
                            <div className="flex justify-end mb-2">
                                <Eye className="w-5 h-5 text-gray-400" />
                            </div>

                            {/* Route */}
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                    <div>
                                        <div className="font-semibold">{trip.fromLocation}</div>
                                        {customMetrics
                                            .filter(
                                                (m) =>
                                                    m.enabled &&
                                                    [
                                                        'right_dates',
                                                        'right_loadType',
                                                        'right_details',
                                                    ].includes(m.id)
                                            )
                                            .map((m) => {
                                                switch (m.id) {
                                                    case 'right_dates':
                                                        return (
                                                            <div
                                                                key="dates"
                                                                className="text-sm text-gray-600 flex items-center gap-1"
                                                            >
                                                                <span>{trip.fromDate}</span>
                                                                {renderTimeIcon(trip.fromDate)}
                                                            </div>
                                                        );
                                                    case 'right_loadType':
                                                        return (
                                                            <div
                                                                key="loadType"
                                                                className="text-sm text-orange-500"
                                                            >
                                                                {trip.loadType}
                                                            </div>
                                                        );
                                                    case 'right_details':
                                                        return (
                                                            <div
                                                                key="details"
                                                                className="text-sm text-gray-600 whitespace-pre-line"
                                                            >
                                                                {trip.details}
                                                            </div>
                                                        );
                                                    default:
                                                        return null;
                                                }
                                            })}
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                    <div>
                                        <div className="font-semibold">{trip.toLocation}</div>
                                        {customMetrics
                                            .filter(
                                                (m) =>
                                                    m.enabled &&
                                                    ['right_dates', 'right_trailer'].includes(m.id)
                                            )
                                            .map((m) => {
                                                switch (m.id) {
                                                    case 'right_dates':
                                                        return (
                                                            <div
                                                                key="dates"
                                                                className="text-sm text-gray-600 flex items-center gap-1"
                                                            >
                                                                <span>{trip.toDate}</span>
                                                                {renderTimeIcon(trip.toDate)}
                                                            </div>
                                                        );
                                                    case 'right_trailer':
                                                        return (
                                                            <div key="trailer">
                                                                <div className="text-sm text-orange-500">
                                                                    Drop Loaded Trailer
                                                                </div>
                                                                <div className="text-sm text-orange-500">
                                                                    Pick Up Empty Trailer
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    Empty 180 mi
                                                                </div>
                                                            </div>
                                                        );
                                                    default:
                                                        return null;
                                                }
                                            })}
                                    </div>
                                </div>
                            </div>

                            {trip.hasReload && isRightMetricEnabled('right_reload') && (
                                <div className="mt-3 flex items-center gap-2 text-orange-500">
                                    <RotateCcw className="w-4 h-4" />
                                    <span className="text-sm">Reload</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
