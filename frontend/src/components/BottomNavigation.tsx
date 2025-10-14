import { Home, Search, Calendar, Settings, MoreHorizontal } from 'lucide-react';

interface BottomNavigationProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}

export function BottomNavigation({ currentPage, onNavigate }: BottomNavigationProps) {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'search', label: 'Find Loads', icon: Search },
        { id: 'results', label: 'My Runs', icon: Calendar },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'more', label: 'Driver Portal', icon: MoreHorizontal },
    ];

    // Map pages to their corresponding nav items for highlighting
    const getActiveNavId = (page: string) => {
        if (
            page === 'findloadsresults' ||
            page === 'quicksearch' ||
            page === 'pickupdate' ||
            page === 'dropdate'
        ) {
            return 'search';
        }
        return page;
    };

    return (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50 shadow-lg">
            <div className="grid grid-cols-5 gap-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = getActiveNavId(currentPage) === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center py-2 px-1 transition-colors duration-200 ${
                                isActive ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
                            }`}
                        >
                            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current' : ''}`} />
                            <span className="text-xs">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
