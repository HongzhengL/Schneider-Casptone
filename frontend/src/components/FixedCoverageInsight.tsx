import React, { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import type { LoadRecord } from '../types/api';

interface FixedCoverageInsightProps {
    /**
     * The trips/loads currently displayed on the search results page.
     * Used to calculate potential contribution if all trips were taken.
     * Optional now as it might be used in contexts without trips.
     */
    trips?: LoadRecord[];
    /**
     * Fixed cost per period (week or month).
     * If not provided, uses a default value.
     */
    fixedCostPerPeriod?: number;
    /**
     * Rolling cost per mile (RCPM).
     * Used to calculate contribution: Δ = max(0, RPM - RCPM).
     * If not provided, uses a default value.
     */
    rollingCostPerMile?: number;
    /**
     * Amount already covered in the current period.
     * If not provided, calculates from completed trips or uses 0.
     */
    coveredAmount?: number;
    /**
     * Period type: 'week' or 'month'.
     */
    periodType?: 'week' | 'month';
    /**
     * Actual earnings if fixed cost is fully covered.
     * Optional: used to show earnings when coverage is complete.
     */
    actualEarnings?: number;
    /**
     * Percentage of drivers in the same region that this driver surpasses.
     * Optional: shown when fixed cost is fully covered.
     */
    percentileRank?: number;
    /**
     * Daily fixed cost for the alert.
     */
    dailyFixedCost?: number;
    /**
     * Callback for the adjust button.
     */
    onAdjust?: () => void;
}

/**
 * Calculates the contribution of a trip based on RPM and RCPM.
 * Contribution per mile (Δ) = max(0, RPM - RCPM)
 * Total contribution = Δ × miles
 */
function calculateTripContribution(trip: LoadRecord, rollingCostPerMile: number): number {
    // Use total RPM for contribution calculation
    const rpm = trip.totalRpmNum;
    const delta = Math.max(0, rpm - rollingCostPerMile);
    return delta * trip.distanceNum;
}

/**
 * Fixed-Coverage Insight component.
 * Displays a status bar showing fixed cost progress for the current period.
 */
export function FixedCoverageInsight({
    trips = [],
    fixedCostPerPeriod = 2771.36, // Default from image
    rollingCostPerMile = 1.2,
    coveredAmount = 1650.00, // Default from image
    periodType = 'week',
    actualEarnings,
    percentileRank,
    dailyFixedCost = 400.00, // Default from image
    onAdjust,
}: FixedCoverageInsightProps) {
    const effectiveRollingCostPerMile = Number.isFinite(rollingCostPerMile)
        ? rollingCostPerMile
        : 0;
    const normalizedFixedCost = Math.max(
        0,
        Number.isFinite(fixedCostPerPeriod) ? fixedCostPerPeriod : 0
    );
    const rawCovered = coveredAmount ?? 0;
    const normalizedCovered = Math.max(0, Number.isFinite(rawCovered) ? rawCovered : 0);

    // Calculate potential contribution from all displayed trips
    const potentialContribution = useMemo(() => {
        return trips.reduce((sum, trip) => {
            return sum + calculateTripContribution(trip, effectiveRollingCostPerMile);
        }, 0);
    }, [trips, effectiveRollingCostPerMile]);

    // Use provided coveredAmount or default to 0
    const currentCovered = normalizedCovered;

    // Calculate remaining amount
    const remaining = Math.max(0, normalizedFixedCost - currentCovered);

    // Check if fixed cost is fully covered
    const isFullyCovered =
        normalizedFixedCost === 0 ? currentCovered > 0 : currentCovered >= normalizedFixedCost;

    // Calculate progress percentage
    const progressPercentage =
        normalizedFixedCost === 0
            ? currentCovered > 0
                ? 100
                : 0
            : Math.min(100, (currentCovered / normalizedFixedCost) * 100);

    // Format currency
    const formatCurrency = (amount: number) => {
        return `$${amount.toFixed(2)}`;
    };

    return (
        <div className="space-y-3">
            {/* Main Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {/* Icon could be added here if needed, image shows a green trend icon */}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-green-600"
                        >
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                            <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        <h3 className="text-gray-700 font-medium text-base">
                            This Week's Fixed Costs
                        </h3>
                    </div>
                    <button
                        onClick={onAdjust}
                        className="text-orange-600 text-sm font-medium hover:text-orange-700"
                    >
                        Adjust
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 w-full rounded-full bg-orange-100 overflow-hidden mb-3">
                    <div
                        className="absolute top-0 left-0 h-full bg-orange-500 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                        Fixed: <span className="font-semibold text-gray-900">{formatCurrency(normalizedFixedCost)}</span>
                    </div>
                    <div className="text-green-600">
                        Covered: <span className="font-semibold">{formatCurrency(currentCovered)}</span>
                    </div>
                    <div className="text-orange-600">
                        Remaining: <span className="font-semibold">{formatCurrency(remaining)}</span>
                    </div>
                </div>
            </div>

            {/* Daily Fixed Alert */}
            <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3 border border-blue-100">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                    <span className="font-semibold">Daily Fixed: {formatCurrency(dailyFixedCost)}/day</span> — Every day waiting costs your weekly goal
                </div>
            </div>
        </div>
    );
}
