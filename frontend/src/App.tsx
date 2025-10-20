import { useEffect, useState } from 'react';
import { HomePage } from './components/HomePage';
import { NoticePage } from './components/NoticePage';
import { SearchPage } from './components/SearchPage';
import { FindLoadsResultsPage } from './components/FindLoadsResultsPage';
import { ResultsPage } from './components/ResultsPage';
import { SettingsPage } from './components/SettingsPage';
import { MorePage } from './components/MorePage';
import { BottomNavigation } from './components/BottomNavigation';
import { Toaster } from './components/ui/sonner';
import { fetchCustomMetrics, ApiError } from './services/api';
import type { LoadSearchFilters, Metric } from './types/api';

const fallbackMetrics: Metric[] = [
    { id: 'distance', label: 'Distance', enabled: true },
    { id: 'weight', label: 'Weight', enabled: true },
    { id: 'loadedRpm', label: 'Loaded RPM', enabled: true },
    { id: 'totalRpm', label: 'Est Total RPM', enabled: false },
    { id: 'loadType', label: 'Load Type', enabled: false },
];

const createDefaultLoadFilters = (): LoadSearchFilters => {
    return {
        minLoadedRpm: null,
        minDistance: null,
        maxDistance: null,
        serviceExclusions: [],
        confirmedOnly: false,
        standardNetworkOnly: false,
        destination: null,
        destinationState: null,
        destinationRadius: null,
        origin: null,
        originState: null,
        originRadius: null,
        pickupDateFrom: null,
        pickupDateTo: null,
        dropDateFrom: null,
        dropDateTo: null,
    };
};

export default function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [customMetrics, setCustomMetrics] = useState<Metric[]>(fallbackMetrics);
    const [defaultMetrics, setDefaultMetrics] = useState<Metric[]>(fallbackMetrics);
    const [metricsError, setMetricsError] = useState<string | null>(null);
    const [metricsLoading, setMetricsLoading] = useState(true);
    const [loadFilters, setLoadFilters] = useState<LoadSearchFilters>(() =>
        createDefaultLoadFilters()
    );

    useEffect(() => {
        let isMounted = true;

        const loadMetrics = async () => {
            try {
                const metrics = await fetchCustomMetrics();
                if (!isMounted) return;
                setCustomMetrics(metrics);
                setDefaultMetrics(metrics);
            } catch (error) {
                if (!isMounted) return;
                console.error(error);
                setMetricsError(
                    error instanceof ApiError
                        ? 'Unable to load default metrics from the server.'
                        : 'Something went wrong while loading default metrics.'
                );
                setCustomMetrics(fallbackMetrics);
                setDefaultMetrics(fallbackMetrics);
            } finally {
                if (isMounted) {
                    setMetricsLoading(false);
                }
            }
        };

        loadMetrics();

        return () => {
            isMounted = false;
        };
    }, []);

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage onNavigate={setCurrentPage} />;
            case 'notice':
                return <NoticePage onNavigate={setCurrentPage} />;
            case 'search':
                return (
                    <SearchPage
                        onNavigate={setCurrentPage}
                        filters={loadFilters}
                        onFiltersChange={setLoadFilters}
                        createDefaultFilters={createDefaultLoadFilters}
                    />
                );
            case 'findloadsresults':
                return (
                    <FindLoadsResultsPage
                        customMetrics={customMetrics}
                        onNavigate={setCurrentPage}
                        filters={loadFilters}
                        onFiltersChange={setLoadFilters}
                    />
                );
            case 'results':
                return <ResultsPage onNavigate={setCurrentPage} />;
            case 'settings':
                return (
                    <SettingsPage
                        customMetrics={customMetrics}
                        defaultMetrics={defaultMetrics}
                        setCustomMetrics={setCustomMetrics}
                        onNavigate={setCurrentPage}
                        isLoadingDefaults={metricsLoading}
                        loadError={metricsError}
                    />
                );
            case 'more':
                return <MorePage onNavigate={setCurrentPage} />;
            default:
                return <HomePage onNavigate={setCurrentPage} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
            <main className="flex-1 pb-20">
                {metricsError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-2 mx-4 my-3">
                        {metricsError}
                    </div>
                )}
                {renderCurrentPage()}
            </main>
            <BottomNavigation currentPage={currentPage} onNavigate={setCurrentPage} />
            <Toaster />
        </div>
    );
}
