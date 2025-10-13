export const notices = {
    unread: [
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
    ],
    read: [
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
    ],
    system: [
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
    ],
};
