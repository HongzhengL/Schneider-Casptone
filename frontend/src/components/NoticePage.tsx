import { ChevronLeft, CheckCircle, AlertCircle, Clock, Archive } from 'lucide-react';
import { Button } from './ui/button';

interface NoticePageProps {
    onNavigate: (page: string) => void;
}

export function NoticePage({ onNavigate }: NoticePageProps) {
    const unreadNotices = [
        {
            id: 'unread1',
            title: 'New Load Match 1',
            route: 'Madison → Chicago',
            details: '$ 850 | 180 mi | Reefer | 9/29/2025',
        },
        {
            id: 'unread2',
            title: 'New Load Match 2',
            route: 'Madison → New York',
            details: '$ 5000 | 960 mi | Heavy | 9/29/2025',
        },
    ];

    const readNotices = [
        {
            id: 'read1',
            title: 'Load Assignment Confirmed',
            route: 'Madison → Chicago',
            details: '$ 750 | 150 mi | Dry van | 9/29/2025',
            isSelected: true,
            type: 'success',
            time: '2 hours ago',
        },
        {
            id: 'read2',
            title: 'Rate Update Available',
            route: 'Madison → Columbus',
            details: '$ 2600 | 500 mi | Heavy | 10/9/2025',
            isSelected: false,
            type: 'info',
            time: '1 day ago',
        },
        {
            id: 'read3',
            title: 'Delivery Confirmation Required',
            route: 'Milwaukee → Detroit',
            details: '$ 1200 | 280 mi | Reefer | 9/27/2025',
            isSelected: false,
            type: 'warning',
            time: '2 days ago',
        },
    ];

    const systemNotices = [
        {
            id: 'system1',
            title: 'App Update Available',
            message: 'Version 2.1.1 is now available with improved performance and bug fixes.',
            type: 'info',
            time: '3 days ago',
        },
        {
            id: 'system2',
            title: 'Scheduled Maintenance',
            message: 'System maintenance scheduled for Oct 15, 2025 from 2:00 AM - 4:00 AM EST.',
            type: 'warning',
            time: '1 week ago',
        },
    ];

    const getNoticeIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-orange-500" />;
            case 'info':
                return <Clock className="w-5 h-5 text-blue-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => onNavigate('home')} className="text-gray-600">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-orange-500">Notice</h1>
            </div>

            {/* Welcome Message */}
            <div>
                <h2 className="text-orange-500">Welcome, Johnny</h2>
            </div>

            {/* Unread Section */}
            <div className="space-y-3">
                <h3 className="text-gray-900">Unread</h3>
                <div className="space-y-3">
                    {unreadNotices.map((notice) => (
                        <div
                            key={notice.id}
                            className="bg-gray-100 rounded-lg p-4 border border-gray-200"
                        >
                            <div className="space-y-1">
                                <div className="text-gray-900">{notice.title}</div>
                                <div className="text-gray-700">{notice.route}</div>
                                <div className="text-gray-700">{notice.details}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Read Section */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-gray-900">Read</h3>
                    <Button variant="outline" size="sm" className="text-gray-600 border-gray-300">
                        <Archive className="w-4 h-4 mr-2" />
                        Archive All
                    </Button>
                </div>
                <div className="space-y-3">
                    {readNotices.map((notice) => (
                        <div
                            key={notice.id}
                            className={`rounded-lg p-4 ${
                                notice.isSelected
                                    ? 'bg-white border-2 border-blue-400'
                                    : 'bg-gray-100 border border-gray-200'
                            }`}
                        >
                            <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-2">
                                        {getNoticeIcon(notice.type)}
                                        <div className="text-gray-900">{notice.title}</div>
                                    </div>
                                    <span className="text-xs text-gray-500">{notice.time}</span>
                                </div>
                                <div className="text-gray-700">{notice.route}</div>
                                <div className="text-gray-700">{notice.details}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Notices Section */}
            <div className="space-y-3">
                <h3 className="text-gray-900">System Notices</h3>
                <div className="space-y-3">
                    {systemNotices.map((notice) => (
                        <div
                            key={notice.id}
                            className="bg-blue-50 rounded-lg p-4 border border-blue-200"
                        >
                            <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-2">
                                        {getNoticeIcon(notice.type)}
                                        <div className="text-gray-900">{notice.title}</div>
                                    </div>
                                    <span className="text-xs text-gray-500">{notice.time}</span>
                                </div>
                                <div className="text-gray-700">{notice.message}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
                <h3 className="text-gray-900">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => onNavigate('results')}
                    >
                        View My Loads
                    </Button>
                    <Button
                        variant="outline"
                        className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => onNavigate('search')}
                    >
                        Find New Loads
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                <h3 className="text-gray-900 mb-3">This Week Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">New Matches</p>
                        <p className="text-2xl text-orange-600">12</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Notifications</p>
                        <p className="text-2xl text-orange-600">24</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
