import { useEffect, useState } from 'react';
import { HomePage } from './components/HomePage';
import { NoticePage } from './components/NoticePage';
import { SearchPage } from './components/SearchPage';
import { FindLoadsResultsPage } from './components/FindLoadsResultsPage';
import { ResultsPage } from './components/ResultsPage';
import { SettingsPage } from './components/SettingsPage';
import {
    ProfitabilitySettingsPage,
    type ProfitabilitySettings,
} from './components/ProfitabilitySettingsPage';
import { MorePage } from './components/MorePage';
import { BottomNavigation } from './components/BottomNavigation';
import { Toaster } from './components/ui/sonner';
import { useTheme } from './contexts/ThemeContext';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { useAuth } from './contexts/AuthContext';
import {
    fetchCustomMetrics,
    ApiError,
    fetchProfiles,
    createProfile,
    updateProfile,
    deleteProfile as apiDeleteProfile,
    applyProfile as apiApplyProfile,
    fetchProfitabilitySettings,
    saveProfitabilitySettings,
} from './services/api';
import { createEmptyProfitabilitySettings } from './constants/profitabilitySettings';
import type { LoadSearchFilters, Metric, Profile } from './types/api';
import { createDefaultLoadFilters } from './constants/loadFilters';
import {
    fallbackMetrics,
    normalizeFilters,
    normalizeProfile,
} from './utils/profileHelpers';

export default function App() {
    const { isDark } = useTheme();
    const [currentPage, setCurrentPage] = useState('home');
    const [customMetrics, setCustomMetrics] = useState<Metric[]>(fallbackMetrics);
    const [defaultMetrics, setDefaultMetrics] = useState<Metric[]>(fallbackMetrics);
    const [metricsError, setMetricsError] = useState<string | null>(null);
    const [metricsLoading, setMetricsLoading] = useState(true);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [profilesError, setProfilesError] = useState<string | null>(null);
    const [profilesLoading, setProfilesLoading] = useState(true);
    const [loadFilters, setLoadFilters] = useState<LoadSearchFilters>(() =>
        createDefaultLoadFilters()
    );
    const [profitabilitySettings, setProfitabilitySettings] = useState<ProfitabilitySettings>(
        createEmptyProfitabilitySettings()
    );
    const { isAuthenticated, isInitializing } = useAuth();
    const [authView, setAuthView] = useState<'login' | 'signup'>('login');
    const [loginEmailPrefill, setLoginEmailPrefill] = useState('');
    const [loginFlashMessage, setLoginFlashMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setMetricsLoading(false);
            setMetricsError(null);
            setCustomMetrics(fallbackMetrics);
            setDefaultMetrics(fallbackMetrics);
            return;
        }

        let isMounted = true;
        setMetricsLoading(true);

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
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            setAuthView('login');
            setLoginEmailPrefill('');
            setLoginFlashMessage(null);
        }
    }, [isAuthenticated]);

    // Load saved profiles (search + advanced criteria)
    useEffect(() => {
        let isMounted = true;
        const loadProfiles = async () => {
            try {
                const list = await fetchProfiles();
                if (!isMounted) return;
                const normalizedList = list.map((profile) => normalizeProfile(profile));
                setProfiles(normalizedList);
            } catch (error) {
                if (!isMounted) return;
                // If the backend doesn't implement /profiles yet, quietly ignore 404
                if (error instanceof ApiError && error.status === 404) {
                    setProfiles([]);
                    setProfilesError(null);
                } else {
                    console.error(error);
                    setProfilesError('Unable to load profiles.');
                    setProfiles([]);
                }
            } finally {
                if (isMounted) setProfilesLoading(false);
            }
        };
        loadProfiles();
        return () => {
            isMounted = false;
        };
    }, []);

    // Load profitability settings
    useEffect(() => {
        let isMounted = true;

        if (!isAuthenticated) {
            setProfitabilitySettings(createEmptyProfitabilitySettings());
            return () => {
                isMounted = false;
            };
        }

        const loadSettings = async () => {
            try {
                const settings = await fetchProfitabilitySettings();
                if (!isMounted) {
                    return;
                }
                setProfitabilitySettings(settings);
            } catch (error) {
                if (!isMounted) {
                    return;
                }
                console.error('Failed to load profitability settings:', error);
                setProfitabilitySettings(createEmptyProfitabilitySettings());
            }
        };

        loadSettings();

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated]);

    // Profile management helpers (can be passed to pages later)
    const handleCreateProfile = async (name: string) => {
        const newProfile = normalizeProfile(await createProfile({ name, filters: loadFilters }));
        setProfiles((prev) => [newProfile, ...prev]);
        return newProfile;
    };

    const handleUpdateProfile = async (id: string, name: string, filters?: LoadSearchFilters) => {
        const next = normalizeProfile(
            await updateProfile(id, { name, filters: filters ?? loadFilters })
        );
        setProfiles((prev) => prev.map((p) => (p.id === id ? next : p)));
        return next;
    };

    const handleDeleteProfile = async (id: string) => {
        await apiDeleteProfile(id);
        setProfiles((prev) => prev.filter((p) => p.id !== id));
    };

    const handleApplyProfile = async (id: string) => {
        const filters = await apiApplyProfile(id);
        const normalizedFilters = normalizeFilters(filters);
        setLoadFilters(normalizedFilters);
        return normalizedFilters;
    };

    const handleSaveProfitabilitySettings = async (settings: ProfitabilitySettings) => {
        try {
            const savedSettings = await saveProfitabilitySettings(settings);
            setProfitabilitySettings(savedSettings);
        } catch (error) {
            console.error('Failed to save profitability settings:', error);
            throw error;
        }
    };

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
                        profiles={profiles}
                        profilesLoading={profilesLoading}
                        profilesError={profilesError}
                        onCreateProfile={handleCreateProfile}
                        onUpdateProfile={handleUpdateProfile}
                        onDeleteProfile={handleDeleteProfile}
                        onApplyProfile={handleApplyProfile}
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
            case 'profitability-settings':
                return (
                    <ProfitabilitySettingsPage
                        onNavigate={setCurrentPage}
                        settings={profitabilitySettings}
                        onSave={handleSaveProfitabilitySettings}
                    />
                );
            case 'more':
                return <MorePage onNavigate={setCurrentPage} />;
            default:
                return <HomePage onNavigate={setCurrentPage} />;
        }
    };

    if (isInitializing) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <p className="text-gray-500 text-sm">Loading your session…</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        if (authView === 'signup') {
            return (
                <SignUpPage
                    onNavigateToLogin={(options) => {
                        setAuthView('login');
                        if (options?.email) {
                            setLoginEmailPrefill(options.email);
                        }
                        if (options?.message) {
                            setLoginFlashMessage(options.message);
                        }
                    }}
                />
            );
        }

        return (
            <LoginPage
                initialEmail={loginEmailPrefill}
                onSwitchToSignUp={() => {
                    setAuthView('signup');
                    setLoginFlashMessage(null);
                }}
                flashMessage={loginFlashMessage}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col max-w-md mx-auto">
            <main className="flex-1 pb-20">
                {metricsError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-2 mx-4 my-3">
                        {metricsError}
                    </div>
                )}
                {renderCurrentPage()}
            </main>
            <BottomNavigation currentPage={currentPage} onNavigate={setCurrentPage} />
            <Toaster theme={isDark ? 'dark' : 'light'} />
        </div>
    );
}
