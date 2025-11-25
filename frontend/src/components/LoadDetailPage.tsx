import { ChevronLeft, TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import type { LoadRecord } from '../types/api';
import type { ProfitabilitySettings } from './ProfitabilitySettingsPage';
import {
    calculateDriverFixedCosts,
    calculateDriverRollingCpm,
    calculateMarginThreshold,
} from '../utils/profitability';

interface LoadDetailPageProps {
    load: LoadRecord;
    profitabilitySettings: ProfitabilitySettings;
    onBack: () => void;
    onBookLoad?: (load: LoadRecord) => void;
}

export function LoadDetailPage({
    load,
    profitabilitySettings,
    onBack,
    onBookLoad,
}: LoadDetailPageProps) {
    const rcpm = calculateDriverRollingCpm(profitabilitySettings);
    const fixed = calculateDriverFixedCosts(profitabilitySettings);
    const margin = calculateMarginThreshold(profitabilitySettings, rcpm);

    const rpm = Number.isFinite(load.totalRpmNum) ? load.totalRpmNum : 0;
    const distance = Number.isFinite(load.distanceNum) ? load.distanceNum : 0;
    const weeklyFixed = Number.isFinite(fixed.weekly) ? fixed.weekly : 0;
    const dailyFixed = Number.isFinite(fixed.daily) ? fixed.daily : 0;

    const delta = Math.max(0, rpm - rcpm);
    const isProfitable = rpm >= rcpm + margin;
    const isBreakEven = Math.abs(rpm - rcpm) <= margin;
    const isBurning = rpm < rcpm - margin;

    const contribution = delta > 0 ? delta * distance : 0;
    const coveragePercent = weeklyFixed > 0 ? (contribution / weeklyFixed) * 100 : 0;

    const getVerdict = () => {
        if (isProfitable) {
            return {
                text: 'Contributes to your goals',
                color: 'text-green-600',
                bg: 'bg-green-50',
                icon: TrendingUp,
            };
        }
        if (isBreakEven) {
            return { text: 'Breaks even', color: 'text-amber-600', bg: 'bg-amber-50', icon: Target };
        }
        return { text: 'Burns cash', color: 'text-red-600', bg: 'bg-red-50', icon: TrendingDown };
    };

    const verdict = getVerdict();
    const VerdictIcon = verdict.icon;

    const renderDetails = () => {
        if (!load.details) return null;
        return load.details.split('\n').map((line, i) => (
            <p key={i} className="text-gray-900 text-sm">
                {line}
            </p>
        ));
    };

    return (
        <div className="bg-background text-foreground min-h-screen">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-gray-100"
                    aria-label="Back to results"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-xl">Load Details</h2>
                    <p className="text-sm text-gray-600">
                        {load.details?.split('\n')[1] || load.id}
                    </p>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Profitability Verdict */}
                <Card className={`${verdict.bg} border-2 ${verdict.color.replace('text-', 'border-')}`}>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <VerdictIcon className={`w-8 h-8 ${verdict.color}`} />
                                <div>
                                    <p className="text-sm text-gray-600">This load</p>
                                    <p className={`text-xl ${verdict.color}`}>{verdict.text}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Margin</p>
                                <p
                                    className={`text-2xl ${delta > margin ? 'text-green-600' : delta > 0 ? 'text-amber-600' : 'text-red-600'}`}
                                >
                                    ${delta.toFixed(2)}/mi
                                </p>
                            </div>
                        </div>

                        {/* RPM vs RCPM Comparison */}
                        <div className="bg-white rounded-lg p-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Revenue Per Mile (RPM)</span>
                                    <span className="text-lg text-gray-900">${rpm.toFixed(2)}/mi</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Rolling Cost Per Mile (RCPM)</span>
                                    <span className="text-lg text-gray-900">${rcpm.toFixed(2)}/mi</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${isProfitable ? 'bg-green-500' : isBreakEven ? 'bg-amber-500' : 'bg-red-500'}`}
                                        style={{ width: `${Math.min(rcpm > 0 ? (rpm / rcpm) * 100 : 0, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contribution Breakdown */}
                {contribution > 0 && (
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm text-gray-600">Weekly Contribution</p>
                                    <p className="text-3xl text-green-700">${contribution.toFixed(2)}</p>
                                </div>
                                <TrendingUp className="w-10 h-10 text-green-500" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Coverage of weekly fixed</span>
                                    <span className="text-green-700">{coveragePercent.toFixed(1)}%</span>
                                </div>
                                <Progress value={Math.min(coveragePercent, 100)} className="h-2" />

                                <p className="text-sm text-gray-600 mt-2">
                                    This trip covers ${contribution.toFixed(2)} of your ${weeklyFixed.toFixed(2)} weekly
                                    fixed costs
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Downtime Cost Warning */}
                <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium text-amber-900 mb-2">Downtime Cost Reminder</p>
                                <div className="space-y-1 text-sm text-amber-800">
                                    <div className="flex justify-between">
                                        <span>Wait 1 day:</span>
                                        <span className="font-medium">-${dailyFixed.toFixed(2)} from this week</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Wait 2 days:</span>
                                        <span className="font-medium">-${(dailyFixed * 2).toFixed(2)} from this week</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Wait 3 days:</span>
                                        <span className="font-medium">-${(dailyFixed * 3).toFixed(2)} from this week</span>
                                    </div>
                                </div>
                                <p className="text-xs text-amber-700 mt-2">
                                    Every day waiting costs your weekly fixed cost goal
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Miles to Cover Insight */}
                {delta > 0 && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <Target className="w-6 h-6 text-blue-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium text-blue-900 mb-2">Miles to Cover This Week</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-blue-800">
                                                At this trip's rate (${delta.toFixed(2)}/mi):
                                            </span>
                                            <span className="text-lg text-blue-700">
                                                {delta > 0 ? Math.ceil(weeklyFixed / delta).toLocaleString() : 'N/A'} miles
                                            </span>
                                        </div>
                                        <p className="text-xs text-blue-700">
                                            To cover your weekly fixed costs, you would need about{' '}
                                            {delta > 0 ? Math.ceil(weeklyFixed / delta).toLocaleString() : 'N/A'} miles at this
                                            contribution rate
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Trip Details */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Route</p>
                            <div className="flex items-center gap-2">
                                <p className="text-gray-900">{load.fromLocation}</p>
                                <span className="text-gray-400">-&gt;</span>
                                <p className="text-gray-900">{load.toLocation}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Pickup</p>
                                <p className="text-gray-900">{load.fromDate}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Delivery</p>
                                <p className="text-gray-900">{load.toDate}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Distance</p>
                                <p className="text-gray-900">{load.distance}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Weight</p>
                                <p className="text-gray-900">{load.weight}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Pay</p>
                                <p className="text-gray-900">{load.price}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Loaded RPM</p>
                                <p className="text-gray-900">{load.loadedRpm}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Est Total RPM</p>
                                <p className="text-gray-900">{load.totalRpm}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600">Load Type</p>
                            <p className="text-gray-900">{load.loadType}</p>
                        </div>

                        {load.details && (
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Additional Details</p>
                                {renderDetails()}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pb-4">
                    <Button variant="outline" onClick={onBack}>
                        Back to loads
                    </Button>
                    <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => onBookLoad && onBookLoad(load)}>
                        Book Load
                    </Button>
                </div>
            </div>
        </div>
    );
}
