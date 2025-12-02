import { CheckCircle, Calendar, MapPin, Phone, Mail, FileText } from 'lucide-react';
import type { LoadRecord } from '../types/api';
import { Button } from './ui/button';

interface BookLoadConfirmedPageProps {
    load: LoadRecord | null;
    onNavigate: (page: string) => void;
}

export function BookLoadConfirmedPage({ load, onNavigate }: BookLoadConfirmedPageProps) {
    const bookingNumber = `BK-${Date.now().toString().slice(-8)}`;
    const confirmationDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

    if (!load) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">No load information available</p>
                    <Button onClick={() => onNavigate('findloadsresults')}>Back to Loads</Button>
                </div>
            </div>
        );
    }

    const pickupDateText = load.pickupDate
        ? load.pickupDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          })
        : 'TBD';

    const dropDateText = load.dropDate
        ? load.dropDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          })
        : 'TBD';

    return (
        <div className="bg-white min-h-screen">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-green-100">
                <h1 className="text-xl text-green-700">Booking Confirmed!</h1>
            </div>

            <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between max-w-xs mx-auto">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                            ✓
                        </div>
                        <span className="text-xs mt-1 text-green-600">Confirm</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-green-500 mx-3"></div>
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                            ✓
                        </div>
                        <span className="text-xs mt-1 text-green-600">Done</span>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                <div className="text-center py-8">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl text-gray-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-600">Your load has been successfully booked</p>
                    <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                        <FileText className="w-4 h-4 text-green-700" />
                        <span className="text-sm text-green-900">Booking #{bookingNumber}</span>
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm text-gray-500 mb-3">Booking Information</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Booking Number</span>
                            <span className="text-sm font-medium text-gray-900">
                                {bookingNumber}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Confirmed On</span>
                            <span className="text-sm font-medium text-gray-900">
                                {confirmationDate}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Status</span>
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                Confirmed
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm text-gray-500 mb-3">Load Summary</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500">Pick-up</p>
                                <p className="text-sm font-medium">{load.fromLocation}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    <Calendar className="inline w-3 h-3 mr-1" />
                                    {pickupDateText}
                                </p>
                            </div>
                        </div>
                        <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-6"></div>
                        <div className="flex items-start gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500">Drop-off</p>
                                <p className="text-sm font-medium">{load.toLocation}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    <Calendar className="inline w-3 h-3 mr-1" />
                                    {dropDateText}
                                </p>
                            </div>
                        </div>
                        <div className="pt-3 border-t">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Rate</span>
                                <span className="font-semibold text-lg text-gray-900">
                                    {load.price}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="flex items-center gap-2 text-blue-900 mb-3">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Next Steps
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-900">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">1.</span>
                            <span>You will receive a confirmation email with booking details</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">2.</span>
                            <span>
                                The broker will contact you within 24 hours to confirm pickup
                                details
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">3.</span>
                            <span>Arrive at pickup location on scheduled date and time</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">4.</span>
                            <span>Upload delivery documentation after completion</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm text-gray-500 mb-3">Broker Contact</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-500">Company</p>
                            <p className="text-sm font-medium text-gray-900">
                                {load.customer || 'Not provided'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href="tel:+15551234567" className="text-orange-600 hover:underline">
                                (555) 123-4567
                            </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <a
                                href="mailto:dispatch@example.com"
                                className="text-orange-600 hover:underline"
                            >
                                dispatch@example.com
                            </a>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                    <Button
                        onClick={() => onNavigate('findloadsresults')}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
                    >
                        Find More Loads
                    </Button>
                    <Button
                        onClick={() => onNavigate('home')}
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 h-10"
                    >
                        Go to Home
                    </Button>
                </div>
            </div>

            <div className="h-8"></div>
        </div>
    );
}
