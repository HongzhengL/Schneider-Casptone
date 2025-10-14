export const driverProfile = {
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

export const walletInfo = {
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

export const menuSections = [
    {
        title: 'Account',
        items: [
            { icon: 'user', label: 'Personal Information' },
            { icon: 'edit', label: 'Edit Profile' },
            { icon: 'truck', label: 'Vehicle Information' },
            { icon: 'file-text', label: 'Documents' },
        ],
    },
    {
        title: 'Earnings & Payments',
        items: [
            { icon: 'wallet', label: 'Wallet Details' },
            { icon: 'credit-card', label: 'Payment Methods' },
            { icon: 'trending-up', label: 'Earnings History' },
            { icon: 'file-text', label: 'Tax Documents' },
        ],
    },
    {
        title: 'Support & Settings',
        items: [
            { icon: 'settings', label: 'App Settings', navigationTarget: 'settings' },
            { icon: 'help-circle', label: 'Help & Support' },
            { icon: 'shield', label: 'Privacy & Security' },
            { icon: 'file-text', label: 'Terms & Conditions' },
        ],
    },
];

export const performanceSummary = {
    loadsCompleted: 47,
    onTimeRate: 0.982,
    averageRating: 4.8,
};

export const appVersion = 'FreightDriver v2.1.0';
