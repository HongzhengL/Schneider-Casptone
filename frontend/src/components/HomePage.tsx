import { Bell, Truck } from 'lucide-react';
import { Button } from './ui/button';

interface HomePageProps {
    onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
    const suggestedLoads = [
        {
            id: 'load1',
            title: 'SNI-4721: Green Bay → Milwaukee',
            price: '$485',
            distance: '120 mi',
            loadType: 'Schneider Dedicated',
            date: '10/2/2025',
            customer: 'Walmart DC',
        },
        {
            id: 'load2',
            title: 'SNI-4722: Atlanta → Charlotte',
            price: '$890',
            distance: '245 mi',
            loadType: 'Temperature Control',
            date: '10/3/2025',
            customer: 'Food Lion',
        },
        {
            id: 'load3',
            title: 'SNI-4723: Dallas → Phoenix',
            price: '$1,850',
            distance: '887 mi',
            loadType: 'Over-the-Road',
            date: '10/4/2025',
            customer: 'Home Depot',
        },
    ];

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
                <h3 className="text-gray-900">Schneider Services</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                        onClick={() => onNavigate('search')}
                    >
                        Find Loads
                    </Button>
                    <Button
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                        onClick={() => onNavigate('results')}
                    >
                        My Assignments
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                    >
                        Trip Planning
                    </Button>
                    <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                    >
                        Fuel Network
                    </Button>
                </div>
            </div>

            {/* Available Assignments Section */}
            <div className="space-y-4">
                <h3 className="text-gray-900">Available Assignments</h3>
                <div className="space-y-3">
                    {suggestedLoads.map((load) => (
                        <div
                            key={load.id}
                            className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm"
                        >
                            <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="text-gray-900 font-medium">{load.title}</div>
                                    <div className="text-orange-600 font-semibold">
                                        {load.price}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {load.distance} | {load.loadType} | {load.date}
                                </div>
                                <div className="text-sm text-orange-600">
                                    Customer: {load.customer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Schneider Network Info */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="text-gray-900 mb-2">Schneider Network</h4>
                <div className="text-sm text-gray-600 space-y-1">
                    <p>• 2,400+ fuel locations nationwide</p>
                    <p>• 24/7 driver support and dispatch</p>
                    <p>• Dedicated customer relationships</p>
                </div>
            </div>
        </div>
    );
}
