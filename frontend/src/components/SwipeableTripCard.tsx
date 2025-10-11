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
                                    metric.id === 'loadedRpm' || metric.id === 'totalRpm';
                                return (
                                    <div key={metric.id} className="text-sm">
                                        {isRpmMetric ? (
                                            <div className="space-y-1">
                                                <div className="text-gray-600">
                                                    {renderMetricLabel(metric.id)}
                                                </div>
                                                <div className="text-orange-500">
                                                    {renderMetricValue(metric.id)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-600">
                                                {renderMetricValue(metric.id)}
                                            </div>
                                        )}
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
                                        <div className="text-sm text-gray-600">{trip.fromDate}</div>
                                        <div className="text-sm text-gray-600">{trip.toDate}</div>
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
                                        <div className="text-sm text-gray-600">{trip.toDate}</div>
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
