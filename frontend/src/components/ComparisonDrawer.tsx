import { AnimatePresence, motion } from 'motion/react';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LoadRecord } from '../types/api';
import type { ProfitabilitySettings } from './ProfitabilitySettingsPage';
import { calculateDriverRollingCpm } from '../utils/profitability';

interface ComparisonDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trips: LoadRecord[];
    onRemoveTrip: (tripId: string) => void;
    profitabilitySettings: ProfitabilitySettings;
}

export function ComparisonDrawer({
    open,
    onOpenChange,
    trips: loads,
    onRemoveTrip,
    profitabilitySettings,
}: ComparisonDrawerProps) {
    if (loads.length === 0) {
        return null;
    }

    const rcpm = calculateDriverRollingCpm(profitabilitySettings);
    const metricColumnWidth = 120;
    const loadColumnWidth = 150;
    const tableMinWidth = metricColumnWidth + loadColumnWidth * loads.length;
    const stickyShadow = '2px 0 6px -4px rgba(0, 0, 0, 0.15)';
    const bottomNavOffset = 72;

    const getProfitabilityIndicator = (trip: LoadRecord) => {
        if (!rcpm || !trip.totalRpmNum) {
            return null;
        }

        const profitMargin = trip.totalRpmNum - rcpm;
        const marginText =
            profitMargin >= 0
                ? `+$${profitMargin.toFixed(2)}`
                : `-$${Math.abs(profitMargin).toFixed(2)}`;

        if (profitMargin > 0.01) {
            return { icon: TrendingUp, text: marginText, color: 'text-green-600' };
        } else if (profitMargin < -0.01) {
            return { icon: TrendingDown, text: marginText, color: 'text-red-600' };
        } else {
            return { icon: Minus, text: '$0.00', color: 'text-orange-500' };
        }
    };

    const getNetProfit = (trip: LoadRecord) => {
        if (!rcpm || !trip.priceNum || !trip.distanceNum) {
            return null;
        }

        const totalCost = trip.distanceNum * rcpm;
        const netProfit = trip.priceNum - totalCost;

        return {
            netProfit,
            formatted:
                netProfit >= 0
                    ? `+$${netProfit.toFixed(2)}`
                    : `-$${Math.abs(netProfit).toFixed(2)}`,
            color:
                netProfit > 0
                    ? 'text-green-600'
                    : netProfit < 0
                      ? 'text-red-600'
                      : 'text-orange-500',
        };
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="compare-overlay"
                    className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
                    style={{
                        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${bottomNavOffset}px)`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onOpenChange(false)}
                >
                    <motion.div
                        key="compare-drawer"
                        className="bg-white w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col shadow-lg"
                        style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}
                        initial={{ translateY: '100%' }}
                        animate={{ translateY: 0 }}
                        exit={{ translateY: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b bg-orange-50 flex-shrink-0">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Compare Loads ({loads.length})
                            </h2>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Comparison Table */}
                        <div className="flex-1" style={{ overflowY: 'auto' }}>
                            <div
                                className="w-full"
                                style={{
                                    overflowX: 'auto',
                                    WebkitOverflowScrolling: 'touch',
                                }}
                            >
                                <table
                                    className="w-full text-sm border-collapse"
                                    style={{ minWidth: `${tableMinWidth}px` }}
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                className="text-left p-3 border-b font-semibold text-gray-700 bg-gray-50 whitespace-nowrap"
                                                style={{
                                                    position: 'sticky',
                                                    top: 0,
                                                    left: 0,
                                                    zIndex: 6,
                                                    minWidth: `${metricColumnWidth}px`,
                                                    boxShadow: stickyShadow,
                                                }}
                                            >
                                                Metric
                                            </th>
                                            {loads.map((load) => (
                                                <th
                                                    key={load.id}
                                                    className="p-3 border-b border-l bg-gray-50"
                                                    style={{
                                                        position: 'sticky',
                                                        top: 0,
                                                        zIndex: 5,
                                                        minWidth: `${loadColumnWidth}px`,
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="text-left">
                                                            <div className="font-semibold text-gray-900 text-xs overflow-hidden whitespace-nowrap">
                                                                {load.fromLocation.split(',')[0]}
                                                            </div>
                                                            <div className="text-xs text-gray-500 overflow-hidden whitespace-nowrap">
                                                                → {load.toLocation.split(',')[0]}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => onRemoveTrip(load.id)}
                                                            className="text-gray-400 hover:text-red-500 flex-shrink-0"
                                                            title="Remove from comparison"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Gross Revenue */}
                                        <tr className="hover:bg-gray-50">
                                            <td
                                                className="p-3 border-b font-medium text-gray-700 bg-white whitespace-nowrap"
                                                style={{
                                                    position: 'sticky',
                                                    left: 0,
                                                    zIndex: 5,
                                                    minWidth: `${metricColumnWidth}px`,
                                                    boxShadow: stickyShadow,
                                                }}
                                            >
                                                Gross Revenue
                                            </td>
                                            {loads.map((load) => (
                                                <td
                                                    key={load.id}
                                                    className="p-3 border-b border-l text-center font-semibold text-lg"
                                                >
                                                    {load.price}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Net Profit */}
                                        {rcpm && (
                                            <tr className="hover:bg-gray-50">
                                                <td
                                                    className="p-3 border-b font-medium text-gray-700 bg-white whitespace-nowrap"
                                                    style={{
                                                        position: 'sticky',
                                                        left: 0,
                                                        zIndex: 5,
                                                        minWidth: `${metricColumnWidth}px`,
                                                        boxShadow: stickyShadow,
                                                    }}
                                                >
                                                    Net Profit
                                                </td>
                                                {loads.map((load) => {
                                                    const netProfit = getNetProfit(load);
                                                    return (
                                                        <td
                                                            key={load.id}
                                                            className="p-3 border-b border-l text-center"
                                                        >
                                                            {netProfit ? (
                                                                <span
                                                                    className={`font-semibold ${netProfit.color}`}
                                                                >
                                                                    {netProfit.formatted}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">
                                                                    N/A
                                                                </span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        )}

                                        {/* Profit Margin per Mile */}
                                        {rcpm && (
                                            <tr className="hover:bg-gray-50">
                                                <td
                                                    className="p-3 border-b font-medium text-gray-700 bg-white whitespace-nowrap"
                                                    style={{
                                                        position: 'sticky',
                                                        left: 0,
                                                        zIndex: 5,
                                                        minWidth: `${metricColumnWidth}px`,
                                                        boxShadow: stickyShadow,
                                                    }}
                                                >
                                                    Margin per Mile
                                                </td>
                                                {loads.map((load) => {
                                                    const indicator =
                                                        getProfitabilityIndicator(load);
                                                    return (
                                                        <td
                                                            key={load.id}
                                                            className="p-3 border-b border-l text-center"
                                                        >
                                                            {indicator ? (
                                                                <span
                                                                    className={`inline-flex items-center justify-center gap-1 ${indicator.color}`}
                                                                >
                                                                    <indicator.icon className="w-4 h-4" />
                                                                    <span className="font-medium">
                                                                        {indicator.text}/mi
                                                                    </span>
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">
                                                                    N/A
                                                                </span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        )}

                                        {/* Distance */}
                                        <tr className="hover:bg-gray-50">
                                            <td
                                                className="p-3 border-b font-medium text-gray-700 bg-white whitespace-nowrap"
                                                style={{
                                                    position: 'sticky',
                                                    left: 0,
                                                    zIndex: 5,
                                                    minWidth: `${metricColumnWidth}px`,
                                                    boxShadow: stickyShadow,
                                                }}
                                            >
                                                Distance
                                            </td>
                                            {loads.map((load) => (
                                                <td
                                                    key={load.id}
                                                    className="p-3 border-b border-l text-center"
                                                >
                                                    {load.distance}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Loaded RPM */}
                                        <tr className="hover:bg-gray-50">
                                            <td
                                                className="p-3 border-b font-medium text-gray-700 bg-white whitespace-nowrap"
                                                style={{
                                                    position: 'sticky',
                                                    left: 0,
                                                    zIndex: 5,
                                                    minWidth: `${metricColumnWidth}px`,
                                                    boxShadow: stickyShadow,
                                                }}
                                            >
                                                Loaded RPM
                                            </td>
                                            {loads.map((load) => (
                                                <td
                                                    key={load.id}
                                                    className="p-3 border-b border-l text-center text-orange-600 font-medium"
                                                >
                                                    {load.loadedRpm}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Total RPM */}
                                        <tr className="hover:bg-gray-50">
                                            <td
                                                className="p-3 border-b font-medium text-gray-700 bg-white whitespace-nowrap"
                                                style={{
                                                    position: 'sticky',
                                                    left: 0,
                                                    zIndex: 5,
                                                    minWidth: `${metricColumnWidth}px`,
                                                    boxShadow: stickyShadow,
                                                }}
                                            >
                                                Est Total RPM
                                            </td>
                                            {loads.map((load) => (
                                                <td
                                                    key={load.id}
                                                    className="p-3 border-b border-l text-center text-orange-600 font-medium"
                                                >
                                                    {load.totalRpm}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* RCPM */}
                                        {rcpm && (
                                            <tr className="hover:bg-gray-50">
                                                <td
                                                    className="p-3 border-b font-medium text-gray-700 bg-white whitespace-nowrap"
                                                    style={{
                                                        position: 'sticky',
                                                        left: 0,
                                                        zIndex: 5,
                                                        minWidth: `${metricColumnWidth}px`,
                                                        boxShadow: stickyShadow,
                                                    }}
                                                >
                                                    Your RCPM
                                                </td>
                                                {loads.map((load) => (
                                                    <td
                                                        key={load.id}
                                                        className="p-3 border-b border-l text-center text-gray-600 font-medium"
                                                    >
                                                        ${rcpm.toFixed(2)}
                                                    </td>
                                                ))}
                                            </tr>
                                        )}

                                        {/* Weight */}
                                        <tr className="hover:bg-gray-50">
                                            <td
                                                className="p-3 border-b font-medium text-gray-700 bg-white whitespace-nowrap"
                                                style={{
                                                    position: 'sticky',
                                                    left: 0,
                                                    zIndex: 5,
                                                    minWidth: `${metricColumnWidth}px`,
                                                    boxShadow: stickyShadow,
                                                }}
                                            >
                                                Weight
                                            </td>
                                            {loads.map((load) => (
                                                <td
                                                    key={load.id}
                                                    className="p-3 border-b border-l text-center"
                                                >
                                                    {load.weight}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Load Type */}
                                        <tr className="hover:bg-gray-50">
                                            <td
                                                className="p-3 border-b font-medium text-gray-700 bg-white whitespace-nowrap"
                                                style={{
                                                    position: 'sticky',
                                                    left: 0,
                                                    zIndex: 5,
                                                    minWidth: `${metricColumnWidth}px`,
                                                    boxShadow: stickyShadow,
                                                }}
                                            >
                                                Load Type
                                            </td>
                                            {loads.map((load) => (
                                                <td
                                                    key={load.id}
                                                    className="p-3 border-b border-l text-center text-sm"
                                                >
                                                    {load.loadType}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Pickup Date */}
                                        <tr className="hover:bg-gray-50">
                                            <td
                                                className="p-3 border-b font-medium text-gray-700 bg-white whitespace-nowrap"
                                                style={{
                                                    position: 'sticky',
                                                    left: 0,
                                                    zIndex: 5,
                                                    minWidth: `${metricColumnWidth}px`,
                                                    boxShadow: stickyShadow,
                                                }}
                                            >
                                                Pickup Date
                                            </td>
                                            {loads.map((load) => (
                                                <td
                                                    key={load.id}
                                                    className="p-3 border-b border-l text-center text-sm"
                                                >
                                                    {new Date(load.fromDate).toLocaleString(
                                                        'en-US',
                                                        {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                        }
                                                    )}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Delivery Date */}
                                        <tr className="hover:bg-gray-50">
                                            <td
                                                className="p-3 border-b font-medium text-gray-700 bg-white whitespace-nowrap"
                                                style={{
                                                    position: 'sticky',
                                                    left: 0,
                                                    zIndex: 5,
                                                    minWidth: `${metricColumnWidth}px`,
                                                    boxShadow: stickyShadow,
                                                }}
                                            >
                                                Delivery Date
                                            </td>
                                            {loads.map((load) => (
                                                <td
                                                    key={load.id}
                                                    className="p-3 border-b border-l text-center text-sm"
                                                >
                                                    {new Date(load.toDate).toLocaleString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Reload */}
                                        <tr className="hover:bg-gray-50">
                                            <td
                                                className="p-3 border-b font-medium text-gray-700 bg-white whitespace-nowrap"
                                                style={{
                                                    position: 'sticky',
                                                    left: 0,
                                                    zIndex: 5,
                                                    minWidth: `${metricColumnWidth}px`,
                                                    boxShadow: stickyShadow,
                                                }}
                                            >
                                                Has Reload
                                            </td>
                                            {loads.map((load) => (
                                                <td
                                                    key={load.id}
                                                    className="p-3 border-b border-l text-center"
                                                >
                                                    {load.hasReload ? (
                                                        <span className="text-green-600 font-medium">
                                                            Yes
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">No</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
