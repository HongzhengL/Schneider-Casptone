import { AlertCircle, Trophy, Settings } from 'lucide-react';

interface FixedCoverageInsightProps {
    fixedCostPerPeriod?: number;
    coveredAmount?: number;
    dailyFixedCost?: number;
    periodStart?: string | Date;
    periodEnd?: string | Date;
    runCount?: number;
    coverageError?: string | null;
    onAdjust?: () => void;
    onLeaderboard?: () => void;
}

const toDate = (value?: string | Date) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

const formatWeekRange = (periodStart?: string | Date, periodEnd?: string | Date) => {
    const startDate = toDate(periodStart);
    const endDate = toDate(periodEnd);
    if (!startDate || !endDate) {
        return null;
    }

    const formatter = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    });

    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
};

export function FixedCoverageInsight({
    fixedCostPerPeriod = 2771.36,
    coveredAmount = 0,
    dailyFixedCost = 400,
    periodStart,
    periodEnd,
    runCount,
    coverageError,
    onAdjust,
    onLeaderboard,
}: FixedCoverageInsightProps) {
    const normalizedFixedCost = Math.max(
        0,
        Number.isFinite(fixedCostPerPeriod) ? fixedCostPerPeriod : 0
    );
    const normalizedCovered = Math.max(0, Number.isFinite(coveredAmount) ? coveredAmount : 0);
    const remaining = Math.max(0, normalizedFixedCost - normalizedCovered);
    const progressPercentage =
        normalizedFixedCost === 0
            ? normalizedCovered > 0
                ? 100
                : 0
            : Math.min(100, (normalizedCovered / normalizedFixedCost) * 100);

    const periodLabel = formatWeekRange(periodStart, periodEnd);
    const runLabel =
        typeof runCount === 'number'
            ? `${runCount} completed ${runCount === 1 ? 'load' : 'loads'}`
            : null;

    const isProfitMode = normalizedCovered >= normalizedFixedCost;

    return (
        <div className="space-y-3">
            {/* Main Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
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
                                This Week&apos;s Fixed Costs
                            </h3>
                        </div>
                        {(periodLabel || runLabel) && (
                            <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                                {periodLabel && <span>Week of {periodLabel}</span>}
                                {runLabel && <span>• {runLabel}</span>}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {onLeaderboard && (
                            <button
                                onClick={onLeaderboard}
                                className="text-orange-600 hover:text-orange-700 p-2 rounded-full hover:bg-orange-50 transition-colors"
                                title="View Leaderboard"
                            >
                                <Trophy className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={onAdjust}
                            className="text-orange-600 hover:text-orange-700 p-2 rounded-full hover:bg-orange-50 transition-colors"
                            title="Adjust Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 w-full rounded-full bg-orange-100 overflow-hidden mb-3">
                    <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                            isProfitMode ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                        Fixed:{' '}
                        <span className="font-semibold text-gray-900">
                            {formatCurrency(normalizedFixedCost)}
                        </span>
                    </div>
                    <div className="text-green-600">
                        Covered:{' '}
                        <span className="font-semibold">{formatCurrency(normalizedCovered)}</span>
                    </div>
                    <div className={isProfitMode ? 'text-green-600 font-bold' : 'text-orange-600'}>
                        {isProfitMode ? (
                            <>
                                Profit:{' '}
                                <span className="font-semibold">
                                    {formatCurrency(normalizedCovered - normalizedFixedCost)}
                                </span>
                            </>
                        ) : (
                            <>
                                Remaining:{' '}
                                <span className="font-semibold">{formatCurrency(remaining)}</span>
                            </>
                        )}
                    </div>
                </div>

                {coverageError && (
                    <p className="mt-2 text-xs text-red-600" role="status">
                        {coverageError}
                    </p>
                )}
            </div>

            {/* Daily Fixed Alert */}
            <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3 border border-blue-100">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                    <span className="font-semibold">
                        Daily Fixed: {formatCurrency(dailyFixedCost)}/day
                    </span>{' '}
                    — Every day waiting costs your weekly goal
                </div>
            </div>
        </div>
    );
}
