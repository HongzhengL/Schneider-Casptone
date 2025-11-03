import { useEffect, useMemo, useState } from 'react';
import { fetchFixedCoverage } from '../services/api';
import type { FixedCoverageMetrics, FixedCoveragePeriod } from '../types/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface FixedCoverageBarProps {
    defaultPeriod?: FixedCoveragePeriod;
}

export function FixedCoverageBar({ defaultPeriod = 'week' }: FixedCoverageBarProps) {
    const [period, setPeriod] = useState<FixedCoveragePeriod>(defaultPeriod);
    const [metrics, setMetrics] = useState<FixedCoverageMetrics | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchFixedCoverage(period);
                if (!mounted) return;
                setMetrics(data);
            } catch (e) {
                if (!mounted) return;
                console.error(e);
                setError('Unable to load fixed coverage.');
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [period]);

    const percent = metrics?.percent ?? 0;
    const barCoveredWidth = `${Math.min(100, percent)}%`;

    const statusText = useMemo(() => {
        if (!metrics) return '';
        const fmt = (n: number) =>
            n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        return `Fixed Cost: $${fmt(metrics.fixedBudget)} • Covered: $${fmt(metrics.covered)} • Remaining: $${fmt(metrics.remaining)}`;
    }, [metrics]);

    return (
        <div className="p-4 pb-2">
            <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                    Fixed Coverage ({period === 'week' ? 'This Week' : 'This Month'})
                </div>
                <Select value={period} onValueChange={(v) => setPeriod(v as FixedCoveragePeriod)}>
                    <SelectTrigger className="w-[120px] h-8">
                        <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">Weekly</SelectItem>
                        <SelectItem value="month">Monthly</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-muted rounded-md h-3 overflow-hidden border border-border">
                <div className="bg-green-500 h-full" style={{ width: barCoveredWidth }} />
            </div>

            <div className="text-xs text-muted-foreground mt-2">
                {isLoading ? 'Loading coverage…' : error ? error : statusText}
            </div>

            {metrics && metrics.remaining === 0 && metrics.profitAfterCoverage > 0 && (
                <div className="text-xs mt-1 text-green-700 dark:text-green-300">
                    Actual earnings this {period}: ${metrics.profitAfterCoverage.toLocaleString()}
                </div>
            )}

            {metrics && typeof metrics.percentile === 'number' && (
                <div className="text-[11px] mt-1 text-muted-foreground">
                    Your earnings surpass {metrics.percentile}% of drivers in your region
                </div>
            )}
        </div>
    );
}
