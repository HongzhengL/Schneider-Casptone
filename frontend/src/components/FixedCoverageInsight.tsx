// Component to display fixed cost coverage insight on search result screen.
// Shows how much of the current period's fixed pot is covered and how much remains.
// Displays a progress bar with Fixed (goal), Covered, and Remaining amounts.
import React, { useMemo } from 'react';
import type { LoadRecord } from '../types/api';

interface FixedCoverageInsightProps {
    /**
     * The trips/loads currently displayed on the search results page.
     * Used to calculate potential contribution if all trips were taken.
     */
    trips: LoadRecord[];
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
    trips,
    fixedCostPerPeriod = 1050, // Default: $1050/week (approximately $4500/month)
    rollingCostPerMile = 1.2, // Default: $1.20/mile RCPM
    coveredAmount,
    periodType = 'week',
    actualEarnings,
    percentileRank,
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
        return `$${amount.toFixed(0)}`;
    };

    return (
        <div className="bg-accent border-b border-border p-4 space-y-3">
            {/* Status Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-foreground">
                            Fixed:{' '}
                            <span className="font-medium">
                                {formatCurrency(normalizedFixedCost)}
                            </span>
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-foreground">
                            Covered:{' '}
                            <span className="font-medium">{formatCurrency(currentCovered)}</span>
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-foreground">
                            Remaining:{' '}
                            <span className="font-medium">{formatCurrency(remaining)}</span>
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{periodType}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${
                            isFullyCovered
                                ? 'bg-green-500'
                                : progressPercentage >= 75
                                  ? 'bg-yellow-500'
                                  : 'bg-orange-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Additional Information */}
            {isFullyCovered ? (
                <div className="space-y-2 pt-2 border-t border-border">
                    {actualEarnings !== undefined && actualEarnings > 0 && (
                        <div className="text-sm">
                            <span className="text-muted-foreground">Actual Earnings: </span>
                            <span className="font-semibold text-green-600">
                                {formatCurrency(actualEarnings)}
                            </span>
                        </div>
                    )}
                    {percentileRank !== undefined && (
                        <div className="text-xs text-muted-foreground">
                            Your earnings surpass {percentileRank}% of drivers in the same region
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-xs text-muted-foreground pt-1">
                    {trips.length > 0 && (
                        <span>
                            Potential contribution from these trips:{' '}
                            {formatCurrency(potentialContribution)}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
