import { useEffect, useState } from 'react';
import { ChevronLeft, CheckCircle, AlertCircle, Clock, Archive } from 'lucide-react';
import { Button } from './ui/button';
import { fetchNotices, ApiError } from '../services/api';
import type { NoticesResponse, NoticeType } from '../types/api';

interface NoticePageProps {
    onNavigate: (page: string) => void;
}

export function NoticePage({ onNavigate }: NoticePageProps) {
    const [noticesData, setNoticesData] = useState<NoticesResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadNotices = async () => {
            try {
                const data = await fetchNotices();
                if (isMounted) {
                    setNoticesData(data);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error(err);
                setError(
                    err instanceof ApiError
                        ? 'Unable to load your notices.'
                        : 'Something went wrong while loading notices.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadNotices();

        return () => {
            isMounted = false;
        };
    }, []);

    const getNoticeIcon = (type: NoticeType) => {
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
                {isLoading && (
                    <div className="text-sm text-gray-500">Checking for new notices…</div>
                )}
                {error && <div className="text-sm text-red-600">{error}</div>}
                {!isLoading && !error && (
                    <div className="space-y-3">
                        {(noticesData?.unread ?? []).map((notice) => (
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
                        {(noticesData?.unread?.length ?? 0) === 0 && (
                            <div className="text-sm text-gray-500">
                                You're all caught up. No unread notices.
                            </div>
                        )}
                    </div>
                )}
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
                    {(noticesData?.read ?? []).map((notice) => (
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
                    {!isLoading && !error && (noticesData?.read?.length ?? 0) === 0 && (
                        <div className="text-sm text-gray-500">No previous notices to display.</div>
                    )}
                </div>
            </div>

            {/* System Notices Section */}
            <div className="space-y-3">
                <h3 className="text-gray-900">System Notices</h3>
                <div className="space-y-3">
                    {(noticesData?.system ?? []).map((notice) => (
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
                    {!isLoading && !error && (noticesData?.system?.length ?? 0) === 0 && (
                        <div className="text-sm text-gray-500">
                            No system updates at the moment.
                        </div>
                    )}
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
