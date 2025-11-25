import { ChevronLeft, Calendar, TrendingUp } from 'lucide-react';
import type { LoadRecord } from '../types/api';
import { Button } from './ui/button';

interface BookLoadConfirmationPageProps {
    load: LoadRecord | null;
    rcpm: number;
    margin: number;
    onNavigate: (page: string) => void;
    onBack: () => void;
}

const formatDate = (value?: Date) => {
    if (!value || !value.toLocaleDateString) {
        return 'TBD';
    }
    return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function BookLoadConfirmationPage({
    load,
    rcpm,
    margin,
    onNavigate,
    onBack,
}: BookLoadConfirmationPageProps) {
    if (!load) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center space-y-3">
                    <p className="text-gray-600">No load selected</p>
                    <Button onClick={() => onNavigate('findloadsresults')}>Back to Loads</Button>
                </div>
            </div>
        );
    }

    const loadedRpm = Number.isFinite(load.loadedRpmNum) ? load.loadedRpmNum : 0;
    const distance = Number.isFinite(load.distanceNum) ? load.distanceNum : 0;
    const totalRate = Number.isFinite(load.priceNum) ? load.priceNum : null;
    const profitMargin = loadedRpm - rcpm - margin;
    const isProfitable = profitMargin >= 0;
    const totalProfit = profitMargin * distance;

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="flex items-center gap-3">
                    <ChevronLeft
                        className="w-6 h-6 cursor-pointer text-orange-600"
                        onClick={onBack}
                    />
                    <h1 className="text-xl text-orange-600">Confirm Load</h1>
                </div>
            </div>

            <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between max-w-sm mx-auto">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-semibold">
                            1
                        </div>
                        <span className="text-xs mt-1 text-orange-600">Confirm</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm">
                            2
                        </div>
                        <span className="text-xs mt-1 text-gray-500">Details</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm">
                            3
                        </div>
                        <span className="text-xs mt-1 text-gray-500">Payment</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm">
                            4
                        </div>
                        <span className="text-xs mt-1 text-gray-500">Done</span>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4 flex-1">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm text-gray-500 mb-3">Route</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Pick-up</p>
                                <p className="font-medium">{load.fromLocation}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    {formatDate(load.pickupDate)}
                                </p>
                            </div>
                        </div>
                        <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-6"></div>
                        <div className="flex items-start gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Drop-off</p>
                                <p className="font-medium">{load.toLocation}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    {formatDate(load.dropDate)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm text-gray-500 mb-3">Load Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Distance</p>
                            <p className="font-medium">{load.distance}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Weight</p>
                            <p className="font-medium">{load.weight}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Load Type</p>
                            <p className="font-medium">{load.loadType}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Customer</p>
                            <p className="font-medium">{load.customer ?? 'Not provided'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        Profitability Summary
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Rate</span>
                            <span className="font-semibold text-lg text-gray-900">
                                {totalRate != null ? `$${totalRate.toFixed(2)}` : load.price}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Loaded RPM</span>
                            <span className="font-medium text-gray-900">
                                ${loadedRpm.toFixed(2)}/mi
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Rolling CPM</span>
                            <span className="font-medium text-red-600">${rcpm.toFixed(2)}/mi</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Target Margin</span>
                            <span className="font-medium text-gray-900">
                                ${margin.toFixed(2)}/mi
                            </span>
                        </div>
                        <div className="border-t border-orange-200 pt-2 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">
                                    Net Profit/Mile
                                </span>
                                <span
                                    className={`font-semibold text-lg ${isProfitable ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    ${profitMargin.toFixed(2)}/mi
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-sm font-medium text-gray-700">
                                    Total Net Profit
                                </span>
                                <span
                                    className={`font-semibold text-xl ${isProfitable ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    ${totalProfit.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {!isProfitable && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <svg
                                className="w-5 h-5 text-red-600 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-800">
                                    Below Profitability Threshold
                                </p>
                                <p className="text-xs text-red-700 mt-1">
                                    This load doesn't meet your target margin. Consider negotiating
                                    a higher rate or finding a better opportunity.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm text-gray-500 mb-3">Broker Information</h3>
                    <div className="space-y-2">
                        <div>
                            <p className="text-sm text-gray-500">Company</p>
                            <p className="font-medium">{load.customer ?? 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Network</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                                        load.confirmedAppointment
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {load.confirmedAppointment
                                        ? '✓ Confirmed Appointment'
                                        : 'Standard Network'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto w-full max-w-md mx-auto px-4 pb-6 pt-4 border-t bg-white">
                <div className="space-y-2">
                    <Button
                        onClick={() => onNavigate('bookloaddetails')}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
                    >
                        Continue to Details
                    </Button>
                    <Button
                        onClick={onBack}
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 h-10"
                    >
                        Cancel Booking
                    </Button>
                </div>
            </div>
        </div>
    );
}
