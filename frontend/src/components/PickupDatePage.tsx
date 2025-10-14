import { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { Button } from './ui/button';

interface PickupDatePageProps {
    onNavigate: (page: string) => void;
    onDateConfirm?: (fromDate: Date, toDate: Date) => void;
}

export function PickupDatePage({ onNavigate, onDateConfirm }: PickupDatePageProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date(2025, 8, 1)); // September 2025
    const [selectedRange, setSelectedRange] = useState<{
        from: Date;
        to: Date;
    }>({
        from: new Date(2025, 8, 29), // Sep 29, 2025
        to: new Date(2025, 9, 3), // Oct 3, 2025
    });

    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth((prev) => {
            const newMonth = new Date(prev);
            if (direction === 'prev') {
                newMonth.setMonth(prev.getMonth() - 1);
            } else {
                newMonth.setMonth(prev.getMonth() + 1);
            }
            return newMonth;
        });
    };

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

        // Simple range selection logic - first click sets start, second click sets end
        if (!selectedRange.from || (selectedRange.from && selectedRange.to)) {
            setSelectedRange({ from: clickedDate, to: clickedDate });
        } else if (clickedDate >= selectedRange.from) {
            setSelectedRange((prev) => ({ ...prev, to: clickedDate }));
        } else {
            setSelectedRange({ from: clickedDate, to: selectedRange.from });
        }
    };

    const isDateInRange = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return (
            selectedRange.from &&
            selectedRange.to &&
            date >= selectedRange.from &&
            date <= selectedRange.to
        );
    };

    const isDateSelected = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return (
            (selectedRange.from && date.getTime() === selectedRange.from.getTime()) ||
            (selectedRange.to && date.getTime() === selectedRange.to.getTime())
        );
    };

    const formatDate = (date: Date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[date.getDay()];
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${dayName} ${month}/${day}/${year}`;
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 0);
            const prevDay = prevMonth.getDate() - (firstDay - 1 - i);
            days.push(
                <button
                    key={`prev-${prevDay}`}
                    className="h-10 w-10 text-gray-400 hover:bg-gray-100 rounded"
                    onClick={() => {
                        navigateMonth('prev');
                        setTimeout(() => handleDateClick(prevDay), 100);
                    }}
                >
                    {prevDay}
                </button>
            );
        }

        // Add days of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = isDateSelected(day);
            const isInRange = isDateInRange(day);

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`h-10 w-10 rounded transition-colors ${
                        isSelected
                            ? 'bg-blue-500 text-white'
                            : isInRange
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    {day}
                </button>
            );
        }

        // Add empty cells for days after the last day of the month
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        const remainingCells = totalCells - (firstDay + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            days.push(
                <button
                    key={`next-${day}`}
                    className="h-10 w-10 text-gray-400 hover:bg-gray-100 rounded"
                    onClick={() => {
                        navigateMonth('next');
                        setTimeout(() => handleDateClick(day), 100);
                    }}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    const handleConfirm = () => {
        if (onDateConfirm && selectedRange.from && selectedRange.to) {
            onDateConfirm(selectedRange.from, selectedRange.to);
        }
        onNavigate('quicksearch');
    };

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('quicksearch')} className="text-gray-600">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-orange-500">Pick-up Date</h1>
                </div>
                <button
                    onClick={() => onNavigate('notice')}
                    className="text-gray-600 hover:text-orange-500"
                >
                    <Bell className="w-6 h-6" />
                </button>
            </div>

            {/* Subtitle */}
            <div>
                <h2 className="text-gray-900">Select your custom date range</h2>
            </div>

            {/* Calendar Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h3 className="text-gray-900">
                        {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Calendar */}
                <div className="border-2 border-blue-400 rounded-lg p-4 bg-white">
                    {/* Days of week header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {daysOfWeek.map((day) => (
                            <div
                                key={day}
                                className="h-8 flex items-center justify-center text-gray-600 text-sm"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
                </div>
            </div>

            {/* Pick-up Date Info */}
            <div className="space-y-4">
                <h3 className="text-gray-900">Pick-up Date</h3>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">From Date:</span>
                        <span className="text-gray-900">{formatDate(selectedRange.from)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">To Date:</span>
                        <span className="text-gray-900">{formatDate(selectedRange.to)}</span>
                    </div>
                </div>
            </div>

            {/* Confirm Button */}
            <div className="pt-8">
                <Button
                    onClick={handleConfirm}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-2xl"
                >
                    Confirm Dates
                </Button>
            </div>
        </div>
    );
}
