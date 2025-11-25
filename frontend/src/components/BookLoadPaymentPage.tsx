import { useState } from 'react';
import { ChevronLeft, Building, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface BookLoadPaymentPageProps {
    onNavigate: (page: string) => void;
    onBack: () => void;
}

export function BookLoadPaymentPage({ onNavigate, onBack }: BookLoadPaymentPageProps) {
    const [formData, setFormData] = useState({
        bankName: '',
        accountType: 'checking',
        routingNumber: '',
        accountNumber: '',
        accountHolderName: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
        if (!formData.routingNumber.trim()) newErrors.routingNumber = 'Routing number is required';
        if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
        if (!formData.accountHolderName.trim())
            newErrors.accountHolderName = 'Account holder name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = () => {
        if (validateForm()) {
            onNavigate('bookloadconfirmed');
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="flex items-center gap-3">
                    <ChevronLeft
                        className="w-6 h-6 cursor-pointer text-orange-600"
                        onClick={onBack}
                    />
                    <h1 className="text-xl text-orange-600">Payment Method</h1>
                </div>
            </div>

            <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between max-w-sm mx-auto">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                            ✓
                        </div>
                        <span className="text-xs mt-1 text-green-600">Confirm</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-green-500 mx-2"></div>
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                            ✓
                        </div>
                        <span className="text-xs mt-1 text-green-600">Details</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-orange-500 mx-2"></div>
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-semibold">
                            3
                        </div>
                        <span className="text-xs mt-1 text-orange-600">Payment</span>
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

            <div className="p-4 space-y-6 flex-1">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="flex items-center gap-2 text-gray-900 mb-4">
                        <Building className="w-5 h-5 text-orange-600" />
                        Bank Account Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="bankName">Bank Name *</Label>
                            <Input
                                id="bankName"
                                placeholder="Chase Bank"
                                value={formData.bankName}
                                onChange={(e) => handleChange('bankName', e.target.value)}
                                className={errors.bankName ? 'border-red-500' : ''}
                            />
                            {errors.bankName && (
                                <p className="text-xs text-red-600 mt-1">{errors.bankName}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="accountType">Account Type *</Label>
                            <Select
                                value={formData.accountType}
                                onValueChange={(value) => handleChange('accountType', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="checking">Checking</SelectItem>
                                    <SelectItem value="savings">Savings</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="routingNumber">Routing Number *</Label>
                            <Input
                                id="routingNumber"
                                placeholder="123456789"
                                maxLength={9}
                                value={formData.routingNumber}
                                onChange={(e) =>
                                    handleChange('routingNumber', e.target.value.replace(/\D/g, ''))
                                }
                                className={errors.routingNumber ? 'border-red-500' : ''}
                            />
                            {errors.routingNumber && (
                                <p className="text-xs text-red-600 mt-1">{errors.routingNumber}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="accountNumber">Account Number *</Label>
                            <Input
                                id="accountNumber"
                                type="password"
                                placeholder="••••••••••"
                                value={formData.accountNumber}
                                onChange={(e) => handleChange('accountNumber', e.target.value)}
                                className={errors.accountNumber ? 'border-red-500' : ''}
                            />
                            {errors.accountNumber && (
                                <p className="text-xs text-red-600 mt-1">{errors.accountNumber}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                            <Input
                                id="accountHolderName"
                                placeholder="John Doe or Company Name"
                                value={formData.accountHolderName}
                                onChange={(e) => handleChange('accountHolderName', e.target.value)}
                                className={errors.accountHolderName ? 'border-red-500' : ''}
                            />
                            {errors.accountHolderName && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.accountHolderName}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">Secure Payment</p>
                            <p className="text-xs text-blue-800 mt-1">
                                Your banking information is encrypted and stored securely. We never
                                share your information with third parties.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto w-full max-w-md mx-auto px-4 pb-6 pt-4 border-t bg-white">
                <div className="space-y-2">
                    <Button
                        onClick={handleContinue}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
                    >
                        Complete Booking
                    </Button>
                    <Button
                        onClick={onBack}
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 h-10"
                    >
                        Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
