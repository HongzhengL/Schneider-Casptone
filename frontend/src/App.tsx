import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { NoticePage } from './components/NoticePage';
import { PickupDatePage } from './components/PickupDatePage';
import { DropDatePage } from './components/DropDatePage';
import { SearchPage } from './components/SearchPage';
import { FindLoadsResultsPage } from './components/FindLoadsResultsPage';
import { ResultsPage } from './components/ResultsPage';
import { SettingsPage } from './components/SettingsPage';
import { MorePage } from './components/MorePage';
import { BottomNavigation } from './components/BottomNavigation';
import { Toaster } from './components/ui/sonner';

export default function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [customMetrics, setCustomMetrics] = useState([
        { id: 'distance', label: 'Distance', enabled: true },
        { id: 'weight', label: 'Weight', enabled: true },
        { id: 'loadedRpm', label: 'Loaded RPM', enabled: true },
        { id: 'totalRpm', label: 'Est Total RPM', enabled: false },
        { id: 'loadType', label: 'Load Type', enabled: false },
    ]);

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage onNavigate={setCurrentPage} />;
            case 'notice':
                return <NoticePage onNavigate={setCurrentPage} />;
            case 'pickupdate':
                return <PickupDatePage onNavigate={setCurrentPage} />;
            case 'dropdate':
                return <DropDatePage onNavigate={setCurrentPage} />;
            case 'search':
                return <SearchPage onNavigate={setCurrentPage} />;
            case 'findloadsresults':
                return (
                    <FindLoadsResultsPage
                        customMetrics={customMetrics}
                        onNavigate={setCurrentPage}
                    />
                );
            case 'results':
                return <ResultsPage onNavigate={setCurrentPage} />;
            case 'settings':
                return (
                    <SettingsPage
                        customMetrics={customMetrics}
                        setCustomMetrics={setCustomMetrics}
                        onNavigate={setCurrentPage}
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
            <main className="flex-1 pb-20">{renderCurrentPage()}</main>
            <BottomNavigation currentPage={currentPage} onNavigate={setCurrentPage} />
            <Toaster />
        </div>
    );
}
