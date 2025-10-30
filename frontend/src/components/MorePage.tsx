import { useCallback, useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    User,
    Wallet,
    Settings,
    HelpCircle,
    FileText,
    Shield,
    Truck,
    Star,
    LogOut,
    ChevronRight,
    Edit,
    CreditCard,
    DollarSign,
    TrendingUp,
} from 'lucide-react';
import { fetchDriverPortal, ApiError } from '../services/api';
import type { DriverPortalResponse, MenuItem } from '../types/api';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

const ICON_MAP: Record<string, LucideIcon> = {
    user: User,
    edit: Edit,
    truck: Truck,
    'file-text': FileText,
    wallet: Wallet,
    'credit-card': CreditCard,
    'trending-up': TrendingUp,
    settings: Settings,
    'help-circle': HelpCircle,
    shield: Shield,
};

interface MorePageProps {
    onNavigate: (page: string) => void;
}

export function MorePage({ onNavigate }: MorePageProps) {
    const [driverData, setDriverData] = useState<DriverPortalResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { logout, isAuthenticating } = useAuth();

    const loadPortalData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchDriverPortal();
            setDriverData(data);
        } catch (err) {
            console.error(err);
            setError(
                err instanceof ApiError
                    ? 'Unable to load driver portal data.'
                    : 'Something went wrong while loading driver data.'
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPortalData();
    }, [loadPortalData]);

    const handleMenuItemClick = (item: MenuItem) => {
        if (item.navigationTarget) {
            onNavigate(item.navigationTarget);
        }
    };

    const profile = driverData?.profile;
    const wallet = driverData?.wallet;
    const menuSections = driverData?.menuSections ?? [];
    const performance = driverData?.performance;
    const appVersion = driverData?.appVersion ?? '{appVersion}';

    const loadsCompleted = performance?.loadsCompleted ?? 47;
    const onTimeRate = performance ? `${(performance.onTimeRate * 100).toFixed(1)}%` : '98.2%';
    const averageRating = performance?.averageRating ?? 4.8;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Loading driver portal…</p>
            </div>
        );
    }

    if (error || !profile || !wallet) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center space-y-4 text-center px-6">
                <p className="text-red-600 text-sm">
                    {error ?? 'Driver information is unavailable.'}
                </p>
                <Button
                    onClick={loadPortalData}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                    Retry
                </Button>
            </div>
        );
    }

    const handleSignOut = async () => {
        await logout();
        onNavigate('home');
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Schneider Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 pb-8">
                <div className="flex items-center space-x-2 mb-2">
                    <Truck className="w-6 h-6" />
                    <h1 className="text-2xl">Schneider Driver Portal</h1>
                </div>
                <p className="text-orange-100">Your Account & Benefits</p>
            </div>

            {/* Driver Profile Card */}
            <div className="mx-4 -mt-4 mb-6">
                <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl text-foreground">{profile.name}</h2>
                                <p className="text-muted-foreground">{profile.email}</p>
                                <div className="flex items-center mt-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="ml-1 text-sm text-muted-foreground">
                                        {profile.rating} rating
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button className="p-2 text-muted-foreground hover:text-foreground">
                            <Edit className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Miles</p>
                            <p className="text-lg text-foreground">
                                {(profile.totalDeliveries * 245).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Schneider Since</p>
                            <p className="text-lg text-foreground">{profile.memberSince}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Fleet Assignment</p>
                            <p className="text-sm text-orange-600">{profile.fleet}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Home Terminal</p>
                            <p className="text-sm text-orange-600">{profile.homeTerminal}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schneider Pay Summary Card */}
            <div className="mx-4 mb-6">
                <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg text-foreground">Schneider Pay Summary</h3>
                        <Wallet className="w-6 h-6 text-orange-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-accent rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600">Available Balance</p>
                                    <p className="text-2xl text-green-600">
                                        ${wallet.balance.toFixed(2)}
                                    </p>
                                </div>
                                <DollarSign className="w-8 h-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-accent rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-600">Pending Pay</p>
                                    <p className="text-2xl text-orange-600">
                                        ${wallet.pendingEarnings.toFixed(2)}
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-orange-500" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Mileage Rate</span>
                                <p className="text-foreground font-medium">
                                    ${wallet.schneiderPay.mileageRate}/mi
                                </p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Bonus Earnings</span>
                                <p className="text-foreground font-medium">
                                    ${wallet.schneiderPay.bonusEarnings}
                                </p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Fuel Bonus</span>
                                <p className="text-foreground font-medium">
                                    ${wallet.schneiderPay.fuelBonus}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-between text-sm mt-3 pt-3 border-t border-border">
                            <span className="text-muted-foreground">This Week Total</span>
                            <span className="text-foreground font-medium">
                                ${wallet.thisWeekEarnings.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="mx-4 space-y-6">
                {menuSections.map((section, sectionIndex) => (
                    <div
                        key={sectionIndex}
                        className="bg-card text-card-foreground rounded-lg shadow-sm border border-border"
                    >
                        <div className="p-4 border-b border-border">
                            <h3 className="text-lg text-foreground">{section.title}</h3>
                        </div>
                        <div className="divide-y divide-border">
                            {section.items.map((item, itemIndex) => {
                                const IconComponent = ICON_MAP[item.icon] ?? FileText;
                                const handleClick = () => handleMenuItemClick(item);
                                return (
                                    <button
                                        key={itemIndex}
                                        type="button"
                                        onClick={handleClick}
                                        className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <IconComponent className="w-5 h-5 text-muted-foreground" />
                                            <span className="text-foreground">{item.label}</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Driver Information Card */}
            <div className="mx-4 mt-6 mb-6">
                <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6">
                    <h3 className="text-lg text-foreground mb-4">Driver Information</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Driver ID</span>
                            <span className="text-foreground">{profile.driverId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">CDL Number</span>
                            <span className="text-foreground">{profile.cdlNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Phone</span>
                            <span className="text-foreground">{profile.phone}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <div className="mx-4 mb-8">
                <button
                    onClick={handleSignOut}
                    disabled={isAuthenticating}
                    className="w-full flex items-center justify-center space-x-2 bg-accent border border-border rounded-lg p-4 text-red-600 hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <LogOut className="w-5 h-5" />
                    <span>{isAuthenticating ? 'Signing Out…' : 'Sign Out'}</span>
                </button>
            </div>

            {/* Quick Stats Card */}
            <div className="mx-4 mb-6">
                <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6">
                    <h3 className="text-lg text-foreground mb-4">Performance This Month</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl text-orange-600">{loadsCompleted}</p>
                            <p className="text-sm text-muted-foreground">Loads Completed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl text-green-600">{onTimeRate}</p>
                            <p className="text-sm text-muted-foreground">On-Time Rate</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl text-blue-600">{averageRating}</p>
                            <p className="text-sm text-muted-foreground">Avg Rating</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* App Version */}
            <div className="text-center text-muted-foreground text-sm pb-8">{appVersion}</div>
        </div>
    );
}
