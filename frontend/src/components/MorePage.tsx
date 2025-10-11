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

interface MorePageProps {
    onNavigate: (page: string) => void;
}

export function MorePage({ onNavigate }: MorePageProps) {
    // Schneider driver data
    const driverProfile = {
        name: 'Johnny Rodriguez',
        email: 'johnny.rodriguez@schneider.com',
        phone: '+1 (555) 234-5678',
        driverId: 'SNI-78432',
        cdlNumber: 'WI-CDL-789456123',
        rating: 4.9,
        totalDeliveries: 2156,
        memberSince: 'March 2018',
        fleet: 'Dedicated Fleet',
        homeTerminal: 'Green Bay, WI',
    };

    const walletInfo = {
        balance: 3247.85,
        pendingEarnings: 825.0,
        thisWeekEarnings: 1580.5,
        totalEarnings: 67250.4,
        schneiderPay: {
            mileageRate: 0.58,
            bonusEarnings: 450.0,
            fuelBonus: 125.5,
        },
    };

    const menuSections = [
        {
            title: 'Account',
            items: [
                { icon: User, label: 'Personal Information', action: () => {} },
                { icon: Edit, label: 'Edit Profile', action: () => {} },
                { icon: Truck, label: 'Vehicle Information', action: () => {} },
                { icon: FileText, label: 'Documents', action: () => {} },
            ],
        },
        {
            title: 'Earnings & Payments',
            items: [
                { icon: Wallet, label: 'Wallet Details', action: () => {} },
                { icon: CreditCard, label: 'Payment Methods', action: () => {} },
                { icon: TrendingUp, label: 'Earnings History', action: () => {} },
                { icon: FileText, label: 'Tax Documents', action: () => {} },
            ],
        },
        {
            title: 'Support & Settings',
            items: [
                { icon: Settings, label: 'App Settings', action: () => onNavigate('settings') },
                { icon: HelpCircle, label: 'Help & Support', action: () => {} },
                { icon: Shield, label: 'Privacy & Security', action: () => {} },
                { icon: FileText, label: 'Terms & Conditions', action: () => {} },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl text-gray-900">{driverProfile.name}</h2>
                                <p className="text-gray-600">{driverProfile.email}</p>
                                <div className="flex items-center mt-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="ml-1 text-sm text-gray-600">
                                        {driverProfile.rating} rating
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Edit className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div>
                            <p className="text-sm text-gray-600">Total Miles</p>
                            <p className="text-lg text-gray-900">
                                {(driverProfile.totalDeliveries * 245).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Schneider Since</p>
                            <p className="text-lg text-gray-900">{driverProfile.memberSince}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <p className="text-sm text-gray-600">Fleet Assignment</p>
                            <p className="text-sm text-orange-600">{driverProfile.fleet}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Home Terminal</p>
                            <p className="text-sm text-orange-600">{driverProfile.homeTerminal}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schneider Pay Summary Card */}
            <div className="mx-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg text-gray-900">Schneider Pay Summary</h3>
                        <Wallet className="w-6 h-6 text-orange-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600">Available Balance</p>
                                    <p className="text-2xl text-green-700">
                                        ${walletInfo.balance.toFixed(2)}
                                    </p>
                                </div>
                                <DollarSign className="w-8 h-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-600">Pending Pay</p>
                                    <p className="text-2xl text-orange-700">
                                        ${walletInfo.pendingEarnings.toFixed(2)}
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-orange-500" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Mileage Rate</span>
                                <p className="text-gray-900 font-medium">
                                    ${walletInfo.schneiderPay.mileageRate}/mi
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600">Bonus Earnings</span>
                                <p className="text-gray-900 font-medium">
                                    ${walletInfo.schneiderPay.bonusEarnings}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600">Fuel Bonus</span>
                                <p className="text-gray-900 font-medium">
                                    ${walletInfo.schneiderPay.fuelBonus}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-between text-sm mt-3 pt-3 border-t border-gray-100">
                            <span className="text-gray-600">This Week Total</span>
                            <span className="text-gray-900 font-medium">
                                ${walletInfo.thisWeekEarnings.toFixed(2)}
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
                        className="bg-white rounded-lg shadow-sm border border-gray-200"
                    >
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="text-lg text-gray-900">{section.title}</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {section.items.map((item, itemIndex) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={itemIndex}
                                        onClick={item.action}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-900">{item.label}</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Driver Information Card */}
            <div className="mx-4 mt-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg text-gray-900 mb-4">Driver Information</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Driver ID</span>
                            <span className="text-gray-900">{driverProfile.driverId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">CDL Number</span>
                            <span className="text-gray-900">{driverProfile.cdlNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Phone</span>
                            <span className="text-gray-900">{driverProfile.phone}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <div className="mx-4 mb-8">
                <button className="w-full flex items-center justify-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 hover:bg-red-100 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>

            {/* Quick Stats Card */}
            <div className="mx-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg text-gray-900 mb-4">Performance This Month</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl text-orange-600">47</p>
                            <p className="text-sm text-gray-600">Loads Completed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl text-green-600">98.2%</p>
                            <p className="text-sm text-gray-600">On-Time Rate</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl text-blue-600">4.8</p>
                            <p className="text-sm text-gray-600">Avg Rating</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* App Version */}
            <div className="text-center text-gray-400 text-sm pb-8">FreightDriver v2.1.0</div>
        </div>
    );
}
