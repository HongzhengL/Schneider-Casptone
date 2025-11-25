import { useState } from 'react';
import { ChevronLeft, Truck, FileText, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface BookLoadDetailsPageProps {
    onNavigate: (page: string) => void;
    onBack: () => void;
}

export function BookLoadDetailsPage({ onNavigate, onBack }: BookLoadDetailsPageProps) {
    const [formData, setFormData] = useState({
        driverName: '',
        phoneNumber: '',
        mcNumber: '',
        dotNumber: '',
        truckNumber: '',
        trailerNumber: '',
        insuranceProvider: '',
        policyNumber: '',
        equipmentType: 'dry-van',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.driverName.trim()) newErrors.driverName = 'Driver name is required';
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.mcNumber.trim()) newErrors.mcNumber = 'MC number is required';
        if (!formData.dotNumber.trim()) newErrors.dotNumber = 'DOT number is required';
        if (!formData.truckNumber.trim()) newErrors.truckNumber = 'Truck number is required';
        if (!formData.trailerNumber.trim()) newErrors.trailerNumber = 'Trailer number is required';
        if (!formData.insuranceProvider.trim()) newErrors.insuranceProvider = 'Insurance provider is required';
        if (!formData.policyNumber.trim()) newErrors.policyNumber = 'Policy number is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = () => {
        if (validateForm()) {
            onNavigate('bookloadpayment');
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
                    <h1 className="text-xl text-orange-600">Driver & Equipment</h1>
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
                    <div className="flex-1 h-0.5 bg-orange-500 mx-2"></div>
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-semibold">
                            2
                        </div>
                        <span className="text-xs mt-1 text-orange-600">Details</span>
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

            <div className="p-4 space-y-6 flex-1">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="flex items-center gap-2 text-gray-900 mb-4">
                        <FileText className="w-5 h-5 text-orange-600" />
                        Driver Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="driverName">Driver Name *</Label>
                            <Input
                                id="driverName"
                                placeholder="John Doe"
                                value={formData.driverName}
                                onChange={(e) => handleChange('driverName', e.target.value)}
                                className={errors.driverName ? 'border-red-500' : ''}
                            />
                            {errors.driverName && (
                                <p className="text-xs text-red-600 mt-1">{errors.driverName}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="phoneNumber">Phone Number *</Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                placeholder="(555) 123-4567"
                                value={formData.phoneNumber}
                                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                className={errors.phoneNumber ? 'border-red-500' : ''}
                            />
                            {errors.phoneNumber && (
                                <p className="text-xs text-red-600 mt-1">{errors.phoneNumber}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="flex items-center gap-2 text-gray-900 mb-4">
                        <Shield className="w-5 h-5 text-orange-600" />
                        Authority Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="mcNumber">MC Number *</Label>
                            <Input
                                id="mcNumber"
                                placeholder="MC-123456"
                                value={formData.mcNumber}
                                onChange={(e) => handleChange('mcNumber', e.target.value)}
                                className={errors.mcNumber ? 'border-red-500' : ''}
                            />
                            {errors.mcNumber && (
                                <p className="text-xs text-red-600 mt-1">{errors.mcNumber}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="dotNumber">DOT Number *</Label>
                            <Input
                                id="dotNumber"
                                placeholder="DOT-123456"
                                value={formData.dotNumber}
                                onChange={(e) => handleChange('dotNumber', e.target.value)}
                                className={errors.dotNumber ? 'border-red-500' : ''}
                            />
                            {errors.dotNumber && (
                                <p className="text-xs text-red-600 mt-1">{errors.dotNumber}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="flex items-center gap-2 text-gray-900 mb-4">
                        <Truck className="w-5 h-5 text-orange-600" />
                        Equipment Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="equipmentType">Equipment Type *</Label>
                            <Select
                                value={formData.equipmentType}
                                onValueChange={(value) => handleChange('equipmentType', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dry-van">Dry Van</SelectItem>
                                    <SelectItem value="reefer">Reefer</SelectItem>
                                    <SelectItem value="flatbed">Flatbed</SelectItem>
                                    <SelectItem value="step-deck">Step Deck</SelectItem>
                                    <SelectItem value="lowboy">Lowboy</SelectItem>
                                    <SelectItem value="tanker">Tanker</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="truckNumber">Truck Number/ID *</Label>
                            <Input
                                id="truckNumber"
                                placeholder="TRK-001"
                                value={formData.truckNumber}
                                onChange={(e) => handleChange('truckNumber', e.target.value)}
                                className={errors.truckNumber ? 'border-red-500' : ''}
                            />
                            {errors.truckNumber && (
                                <p className="text-xs text-red-600 mt-1">{errors.truckNumber}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="trailerNumber">Trailer Number/ID *</Label>
                            <Input
                                id="trailerNumber"
                                placeholder="TRL-001"
                                value={formData.trailerNumber}
                                onChange={(e) => handleChange('trailerNumber', e.target.value)}
                                className={errors.trailerNumber ? 'border-red-500' : ''}
                            />
                            {errors.trailerNumber && (
                                <p className="text-xs text-red-600 mt-1">{errors.trailerNumber}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="flex items-center gap-2 text-gray-900 mb-4">
                        <Shield className="w-5 h-5 text-orange-600" />
                        Insurance Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="insuranceProvider">Insurance Provider *</Label>
                            <Input
                                id="insuranceProvider"
                                placeholder="ABC Insurance Company"
                                value={formData.insuranceProvider}
                                onChange={(e) => handleChange('insuranceProvider', e.target.value)}
                                className={errors.insuranceProvider ? 'border-red-500' : ''}
                            />
                            {errors.insuranceProvider && (
                                <p className="text-xs text-red-600 mt-1">{errors.insuranceProvider}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="policyNumber">Policy Number *</Label>
                            <Input
                                id="policyNumber"
                                placeholder="POL-123456789"
                                value={formData.policyNumber}
                                onChange={(e) => handleChange('policyNumber', e.target.value)}
                                className={errors.policyNumber ? 'border-red-500' : ''}
                            />
                            {errors.policyNumber && (
                                <p className="text-xs text-red-600 mt-1">{errors.policyNumber}</p>
                            )}
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
                        Continue to Payment
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
