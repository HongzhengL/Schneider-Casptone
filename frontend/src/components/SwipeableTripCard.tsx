import { useState, useRef } from 'react';
import { motion, PanInfo } from 'motion/react';
import { Eye, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';

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
}

export function SwipeableTripCard({
    trip,
    customMetrics,
    onDislike,
    onUndoDislike,
}: SwipeableTripCardProps) {
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const enabledMetrics = customMetrics.filter((m) => m.enabled);

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
            case 'rcpm':
                return trip.rcpm ?? '';
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
            case 'rcpm':
                return 'RCPM:';
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

    return (
        <div className="relative rounded-lg overflow-hidden">
            {/* Background Action Area - Only revealed when swiping left */}
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
                className="bg-white rounded-lg border shadow-sm relative cursor-grab active:cursor-grabbing z-10"
                style={{ touchAction: 'pan-x' }}
            >
                <div className="p-4">
                    <div className="flex gap-4">
                        {/* Left Side - Price and Custom Metrics */}
                        <div className="w-24 space-y-2">
                            <div className="text-2xl font-bold">{trip.price}</div>

                            {enabledMetrics.map((metric) => {
                                const isRpmMetric =
                                    metric.id === 'loadedRpm' ||
                                    metric.id === 'totalRpm' ||
                                    metric.id === 'rcpm';

                                // Verdict helpers for Est Total RPM vs RCPM
                                const computeRcpm = (t: Trip): number | undefined => {
                                    if (typeof t.rcpmNum === 'number') return t.rcpmNum;
                                    if (
                                        typeof t.priceNum === 'number' &&
                                        typeof t.distanceNum === 'number'
                                    ) {
                                        const combined = t.distanceNum + (t.distanceToOrigin ?? 0);
                                        if (combined > 0)
                                            return Number((t.priceNum / combined).toFixed(2));
                                    }
                                    return undefined;
                                };
                                const getVerdictForTotalRpm = (t: Trip) => {
                                    const total =
                                        typeof t.totalRpmNum === 'number'
                                            ? t.totalRpmNum
                                            : undefined;
                                    const rcpm = computeRcpm(t);
                                    if (total == null || rcpm == null) {
                                        return {
                                            className: 'text-gray-600',
                                            symbol: '•',
                                            verdict: 'Unknown',
                                            title: 'Insufficient data to assess',
                                        } as const;
                                    }
                                    const min = Number(
                                        import.meta.env.VITE_VERDICT_MARGIN_MIN ?? 0.05
                                    );
                                    const pct = Number(
                                        import.meta.env.VITE_VERDICT_MARGIN_PCT ?? 0.03
                                    );
                                    const margin = Math.max(min, rcpm * pct);
                                    let className = 'text-amber-600';
                                    let symbol = '≈';
                                    let verdict = 'At cost';
                                    if (total >= rcpm + margin) {
                                        className = 'text-green-600';
                                        symbol = '▲';
                                        verdict = 'Contributes';
                                    } else if (total < rcpm - margin) {
                                        className = 'text-red-600';
                                        symbol = '▼';
                                        verdict = 'Burns cash';
                                    }
                                    const title = `${verdict}: Total RPM ${total.toFixed(2)} vs RCPM ${rcpm.toFixed(
                                        2
                                    )} (margin ${margin.toFixed(2)})`;
                                    return { className, symbol, verdict, title } as const;
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
                                                <div className="text-gray-600">
                                                    {renderMetricLabel(metric.id)}
                                                </div>
                                                <div
                                                    className={`${valueClass} flex items-center gap-1`}
                                                    title={title}
                                                >
                                                    {verdict ? (
                                                        <span aria-label={verdict.verdict}>
                                                            {verdict.symbol}
                                                        </span>
                                                    ) : null}
                                                    <span>{content}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={metric.id} className="text-sm">
                                        <div className="text-gray-600">{content}</div>
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
                                        <div className="text-sm text-gray-600 flex items-center gap-1">
                                            <span>{trip.fromDate}</span>
                                            {renderTimeIcon(trip.fromDate)}
                                        </div>
                                        <div className="text-sm text-gray-600 flex items-center gap-1">
                                            <span>{trip.toDate}</span>
                                            {renderTimeIcon(trip.toDate)}
                                        </div>
                                        <div className="text-sm text-orange-500">
                                            {trip.loadType}
                                        </div>
                                        <div className="text-sm text-gray-600 whitespace-pre-line">
                                            {trip.details}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                    <div>
                                        <div className="font-semibold">{trip.toLocation}</div>
                                        <div className="text-sm text-gray-600 flex items-center gap-1">
                                            <span>{trip.toDate}</span>
                                            {renderTimeIcon(trip.toDate)}
                                        </div>
                                        <div className="text-sm text-orange-500">
                                            Drop Loaded Trailer
                                        </div>
                                        <div className="text-sm text-orange-500">
                                            Pick Up Empty Trailer
                                        </div>
                                        <div className="text-sm text-gray-600">Empty 180 mi</div>
                                    </div>
                                </div>
                            </div>

                            {trip.hasReload && (
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
