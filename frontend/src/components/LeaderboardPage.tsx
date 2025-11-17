import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { fetchLeaderboard, ApiError } from '../services/api';
import type { LeaderboardEntry } from '../types/api';

interface LeaderboardPageProps {
    onNavigate: (page: string) => void;
}

const getRankIcon = (rank: number) => {
    if (rank === 1) {
        return <Trophy className="w-6 h-6 text-yellow-500" />;
    }
    if (rank === 2) {
        return <Medal className="w-6 h-6 text-gray-400" />;
    }
    if (rank === 3) {
        return <Award className="w-6 h-6 text-amber-600" />;
    }
    return null;
};

const formatMiles = (miles: number): string => {
    return miles.toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });
};

export function LeaderboardPage({ onNavigate }: LeaderboardPageProps) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadLeaderboard = async () => {
            try {
                const data = await fetchLeaderboard();
                if (isMounted) {
                    setLeaderboard(data);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error(err);
                setError(
                    err instanceof ApiError
                        ? 'Unable to load leaderboard.'
                        : 'Something went wrong while loading leaderboard.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadLeaderboard();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onNavigate('home')}
                    className="flex-shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
                    <p className="text-sm text-muted-foreground">Total Delivery Mileage Rankings</p>
                </div>
            </div>

            {/* Leaderboard Content */}
            {isLoading && (
                <div className="text-center py-8">
                    <div className="text-sm text-muted-foreground">Loading leaderboard…</div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3">
                    {error}
                </div>
            )}

            {!isLoading && !error && (
                <div className="space-y-2">
                    {leaderboard.map((entry) => (
                        <div
                            key={entry.rank}
                            className={`bg-card text-card-foreground rounded-lg p-4 border border-border shadow-sm ${
                                entry.rank <= 3 ? 'ring-2 ring-orange-500/20' : ''
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                    {/* Rank */}
                                    <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
                                        {getRankIcon(entry.rank) || (
                                            <span
                                                className={`text-lg font-bold ${
                                                    entry.rank <= 3
                                                        ? 'text-orange-600'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                #{entry.rank}
                                            </span>
                                        )}
                                    </div>

                                    {/* Driver Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-foreground truncate">
                                            {entry.driverName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {entry.driverId}
                                        </div>
                                    </div>
                                </div>

                                {/* Miles */}
                                <div className="text-right flex-shrink-0 ml-4">
                                    <div className="text-lg font-bold text-orange-600">
                                        {formatMiles(entry.totalMiles)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">miles</div>
                                </div>
                            </div>

                            {/* Additional Stats */}
                            <div className="mt-2 pt-2 border-t border-border">
                                <div className="text-xs text-muted-foreground">
                                    {entry.totalDeliveries} deliveries
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Info */}
            {!isLoading && !error && (
                <div className="bg-accent rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground text-center">
                        Rankings are based on total delivery mileage. Updated in real-time.
                    </p>
                </div>
            )}
        </div>
    );
}
