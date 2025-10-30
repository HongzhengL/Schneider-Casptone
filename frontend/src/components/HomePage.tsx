import { useEffect, useState } from 'react';
import { Bell, Truck } from 'lucide-react';
import { Button } from './ui/button';
import { fetchSuggestedLoads, ApiError } from '../services/api';
import type { SuggestedLoad } from '../types/api';

interface HomePageProps {
    onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
    const [suggestedLoads, setSuggestedLoads] = useState<SuggestedLoad[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadSuggested = async () => {
            try {
                const loads = await fetchSuggestedLoads();
                if (isMounted) {
                    setSuggestedLoads(loads);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error(err);
                setError(
                    err instanceof ApiError
                        ? 'Unable to load suggested assignments.'
                        : 'Something went wrong while loading assignments.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadSuggested();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="p-4 space-y-6">
            {/* Schneider Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg -mx-4 -mt-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-2">
                        <Truck className="w-6 h-6" />
                        <span className="text-lg font-semibold">Schneider Driver</span>
                    </div>
                    <button
                        onClick={() => onNavigate('notice')}
                        className="text-white hover:text-orange-200"
                    >
                        <Bell className="w-6 h-6" />
                    </button>
                </div>
                <h2 className="text-xl">Welcome, Johnny Rodriguez</h2>
                <p className="text-orange-100 text-sm">Driver ID: SNI-78432 | Dedicated Fleet</p>
            </div>

            {/* Quick Action Section */}
            <div className="space-y-4">
                <h3 className="text-foreground">Schneider Services</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="border-primary/50 text-primary hover:bg-accent"
                        onClick={() => onNavigate('search')}
                    >
                        Find Loads
                    </Button>
                    <Button
                        variant="outline"
                        className="border-primary/50 text-primary hover:bg-accent"
                        onClick={() => onNavigate('results')}
                    >
                        My Assignments
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="border-border text-foreground hover:bg-accent text-sm"
                    >
                        Trip Planning
                    </Button>
                    <Button
                        variant="outline"
                        className="border-border text-foreground hover:bg-accent text-sm"
                    >
                        Fuel Network
                    </Button>
                </div>
            </div>

            {/* Available Assignments Section */}
            <div className="space-y-4">
                <h3 className="text-foreground">Available Assignments</h3>
                {isLoading && (
                    <div className="text-sm text-muted-foreground">
                        Loading upcoming assignments…
                    </div>
                )}
                {error && <div className="text-sm text-red-600">{error}</div>}
                {!isLoading && !error && (
                    <div className="space-y-3">
                        {suggestedLoads.length === 0 ? (
                            <div className="text-sm text-muted-foreground">
                                No suggested loads available right now. Check back soon.
                            </div>
                        ) : (
                            suggestedLoads.map((load) => (
                                <div
                                    key={load.id}
                                    className="bg-card text-card-foreground rounded-lg p-4 border border-border shadow-sm"
                                >
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="text-foreground font-medium">
                                                {load.title}
                                            </div>
                                            <div className="text-orange-600 font-semibold">
                                                {load.price}
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {load.distance} | {load.loadType} | {load.date}
                                        </div>
                                        <div className="text-sm text-orange-600">
                                            Customer: {load.customer}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Schneider Network Info */}
            <div className="bg-accent rounded-lg p-4 border border-border">
                <h4 className="text-foreground mb-2">Schneider Network</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                    <p>• 2,400+ fuel locations nationwide</p>
                    <p>• 24/7 driver support and dispatch</p>
                    <p>• Dedicated customer relationships</p>
                </div>
            </div>
        </div>
    );
}
