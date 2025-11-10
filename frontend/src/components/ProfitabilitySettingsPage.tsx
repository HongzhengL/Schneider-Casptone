import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { ChevronLeft, TrendingUp, DollarSign, Info, Plus, X, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { fetchProfitabilityAverages } from '../services/api';
import { calculateFixedCostsByMode, calculateRollingCpmByMode } from '../utils/profitability';

type PeriodUnit = 'week' | 'month' | 'year';
type ActiveTab = 'simple' | 'pro';

interface OtherFixedCost {
    name: string;
    amount: number;
    period: number;
    unit: PeriodUnit;
}

export interface ProfitabilitySettings {
    mpg: number;
    fuelPrice: number;
    maintenanceDollars: number;
    maintenanceMiles: number;
    monthlyFixedBundle: number;
    tiresDollars: number;
    tiresMiles: number;
    maintenanceDollarsDetailed: number;
    maintenanceMilesDetailed: number;
    oilChangeDollars: number;
    oilChangeMiles: number;
    defFluidDollars: number;
    defFluidMiles: number;
    tollsDollars: number;
    tollsMiles: number;
    truckPayment: number;
    truckPaymentPeriod: number;
    truckPaymentUnit: PeriodUnit;
    trailerPayment: number;
    trailerPaymentPeriod: number;
    trailerPaymentUnit: PeriodUnit;
    insurance: number;
    insurancePeriod: number;
    insuranceUnit: PeriodUnit;
    permits: number;
    permitsPeriod: number;
    permitsUnit: PeriodUnit;
    eldSubscription: number;
    eldSubscriptionPeriod: number;
    eldSubscriptionUnit: PeriodUnit;
    phoneInternet: number;
    phoneInternetPeriod: number;
    phoneInternetUnit: PeriodUnit;
    parking: number;
    parkingPeriod: number;
    parkingUnit: PeriodUnit;
    softwareTools: number;
    softwareToolsPeriod: number;
    softwareToolsUnit: PeriodUnit;
    otherFixed: OtherFixedCost[];
    marginCents: number;
    marginPercent: number;
    useWhicheverGreater: boolean;
    useRealTimeFuel: boolean;
    useProMode: boolean;
}

type NumericField = {
    [K in keyof ProfitabilitySettings]: ProfitabilitySettings[K] extends number ? K : never;
}[keyof ProfitabilitySettings];

interface ProfitabilitySettingsPageProps {
    onNavigate: (page: string) => void;
    settings: ProfitabilitySettings;
    onSave: (settings: ProfitabilitySettings) => void;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});

const centsFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

const formatCurrency = (value: number) =>
    currencyFormatter.format(Number.isFinite(value) ? value : 0);

const formatCentsPerMile = (value: number) =>
    `${centsFormatter.format(Number.isFinite(value) ? value * 100 : 0)}¢/mile`;

const parseNumericInput = (value: string) => {
    if (value.trim() === '') {
        return 0;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export function ProfitabilitySettingsPage({
    onNavigate,
    settings: initialSettings,
    onSave,
}: ProfitabilitySettingsPageProps) {
    const [settings, setSettings] = useState<ProfitabilitySettings>(initialSettings);
    const [activeTab, setActiveTab] = useState<ActiveTab>(
        initialSettings.useProMode ? 'pro' : 'simple'
    );
    const [isPrefilling, setIsPrefilling] = useState(false);

    useEffect(() => {
        setSettings(initialSettings);
        setActiveTab(initialSettings.useProMode ? 'pro' : 'simple');
    }, [initialSettings]);

    const rcpm = useMemo(
        () => calculateRollingCpmByMode(settings, activeTab),
        [settings, activeTab]
    );
    const fixedCosts = useMemo(
        () => calculateFixedCostsByMode(settings, activeTab),
        [settings, activeTab]
    );

    const handleTabChange = (value: string) => {
        const tab: ActiveTab = value === 'pro' ? 'pro' : 'simple';
        setActiveTab(tab);
        setSettings((prev) => ({
            ...prev,
            useProMode: tab === 'pro',
        }));
    };

    const handleNumericChange = (field: NumericField) => (event: ChangeEvent<HTMLInputElement>) => {
        const nextValue = parseNumericInput(event.target.value);
        setSettings((prev) => ({
            ...prev,
            [field]: nextValue,
        }));
    };

    const handleOtherFixedChange = (index: number, updates: Partial<OtherFixedCost>) => {
        setSettings((prev) => ({
            ...prev,
            otherFixed: prev.otherFixed.map((item, itemIndex) =>
                itemIndex === index ? { ...item, ...updates } : item
            ),
        }));
    };

    const handleSave = async () => {
        const updated = {
            ...settings,
            useProMode: activeTab === 'pro',
        };

        try {
            await onSave(updated);
            toast.success('Profitability settings saved!');
            onNavigate('more');
        } catch (error) {
            console.error('Failed to save profitability settings', error);
            toast.error('Unable to save your settings. Please try again.');
        }
    };

    const addOtherFixedCost = () => {
        setSettings((prev) => ({
            ...prev,
            otherFixed: [
                ...prev.otherFixed,
                { name: '', amount: 0, period: 1, unit: 'month' as PeriodUnit },
            ],
        }));
    };

    const removeOtherFixedCost = (index: number) => {
        setSettings((prev) => ({
            ...prev,
            otherFixed: prev.otherFixed.filter((_, i) => i !== index),
        }));
    };

    const handleApplyAverageData = async () => {
        try {
            setIsPrefilling(true);
            const averages = await fetchProfitabilityAverages();
            setSettings((prev) => ({
                ...prev,
                ...averages,
                otherFixed: Array.isArray(averages.otherFixed) ? averages.otherFixed : [],
            }));
            toast.success('Average driver data applied to your settings.');
        } catch (error) {
            console.error(error);
            toast.error('Unable to load average driver data right now.');
        } finally {
            setIsPrefilling(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                <div className="flex items-center gap-3">
                    <ChevronLeft
                        className="w-6 h-6 cursor-pointer"
                        onClick={() => onNavigate('more')}
                    />
                    <div>
                        <h1 className="text-2xl">Profitability Tools</h1>
                        <p className="text-orange-100 text-sm">Configure your costs and margins</p>
                    </div>
                </div>
            </div>

            <div className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">Quick Setup in 2-3 Minutes</p>
                        <p className="text-blue-700">
                            Configure your rolling costs and fixed expenses to see instant
                            profitability insights on every load.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mx-4 mt-3 flex flex-col items-stretch gap-2">
                <Button
                    onClick={handleApplyAverageData}
                    disabled={isPrefilling}
                    className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white shadow-md hover:from-fuchsia-600 hover:to-violet-700 focus-visible:ring-violet-500"
                >
                    <Sparkles className="w-4 h-4" />
                    {isPrefilling ? 'Loading averages...' : 'Auto-Fill with Industry Averages'}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                    Uses data from your available loads to calculate recommended starting values.
                </p>
            </div>

            <div className="p-4">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="simple">Simple</TabsTrigger>
                        <TabsTrigger value="pro">Pro</TabsTrigger>
                    </TabsList>

                    <TabsContent value="simple" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Rolling Costs Per Mile</CardTitle>
                                <CardDescription>
                                    Costs that vary with distance driven
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Miles Per Gallon (MPG)</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={settings.mpg === 0 ? '' : settings.mpg}
                                        onChange={handleNumericChange('mpg')}
                                        placeholder="6.5"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Your truck's fuel efficiency
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Current Fuel Price ($/gallon)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={settings.fuelPrice === 0 ? '' : settings.fuelPrice}
                                        onChange={handleNumericChange('fuelPrice')}
                                        placeholder="3.89"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={settings.useRealTimeFuel}
                                            onCheckedChange={(checked) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    useRealTimeFuel: checked,
                                                }))
                                            }
                                        />
                                        <span className="text-sm text-gray-600">
                                            Use real-time prices
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Maintenance &amp; Wear</Label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Tires, repairs, preventive maintenance
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-600">
                                                Total Spent ($)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={
                                                    settings.maintenanceDollars === 0
                                                        ? ''
                                                        : settings.maintenanceDollars
                                                }
                                                onChange={handleNumericChange('maintenanceDollars')}
                                                placeholder="1200"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-600">
                                                Over Miles
                                            </Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={
                                                    settings.maintenanceMiles === 0
                                                        ? ''
                                                        : settings.maintenanceMiles
                                                }
                                                onChange={handleNumericChange('maintenanceMiles')}
                                                placeholder="10000"
                                            />
                                        </div>
                                    </div>
                                    {settings.maintenanceMiles > 0 && (
                                        <p className="text-xs text-orange-600 font-medium">
                                            ={' '}
                                            {formatCentsPerMile(
                                                settings.maintenanceDollars /
                                                    settings.maintenanceMiles
                                            )}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Your Rolling CPM</p>
                                        <p className="text-3xl text-orange-700">
                                            {formatCurrency(rcpm)}/mi
                                        </p>
                                    </div>
                                    <TrendingUp className="w-10 h-10 text-orange-500" />
                                </div>
                                <button className="text-sm text-orange-700 underline mt-2">
                                    See calculation breakdown
                                </button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Fixed Costs</CardTitle>
                                <CardDescription>
                                    Monthly expenses that don't change with miles
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Total Monthly Fixed Costs</Label>
                                    <Input
                                        type="number"
                                        step="100"
                                        value={
                                            settings.monthlyFixedBundle === 0
                                                ? ''
                                                : settings.monthlyFixedBundle
                                        }
                                        onChange={handleNumericChange('monthlyFixedBundle')}
                                        placeholder="12000"
                                    />
                                    <div className="bg-gray-50 rounded p-3 text-xs text-gray-600">
                                        <p className="font-medium mb-1">Includes:</p>
                                        <ul className="list-disc list-inside space-y-0.5">
                                            <li>Truck &amp; trailer payments</li>
                                            <li>Insurance, permits, licenses</li>
                                            <li>ELD, phone, internet subscriptions</li>
                                            <li>Parking, storage fees</li>
                                        </ul>
                                        <button
                                            className="text-orange-600 underline mt-2"
                                            onClick={() => handleTabChange('pro')}
                                        >
                                            Switch to Pro for detailed breakdown
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                            <CardContent className="pt-6 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Weekly Fixed:</span>
                                    <span className="text-xl text-blue-700">
                                        {formatCurrency(fixedCosts.weekly)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Daily Fixed:</span>
                                    <span className="text-xl text-blue-700">
                                        {formatCurrency(fixedCosts.daily)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pro" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Rolling Costs (Detailed)</CardTitle>
                                <CardDescription>
                                    Per-mile costs broken down by category
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>MPG</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={settings.mpg === 0 ? '' : settings.mpg}
                                            onChange={handleNumericChange('mpg')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Fuel ($/gal)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={
                                                settings.fuelPrice === 0 ? '' : settings.fuelPrice
                                            }
                                            onChange={handleNumericChange('fuelPrice')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tires</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-600">
                                                Cost ($)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={
                                                    settings.tiresDollars === 0
                                                        ? ''
                                                        : settings.tiresDollars
                                                }
                                                onChange={handleNumericChange('tiresDollars')}
                                                placeholder="800"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-600">Miles</Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={
                                                    settings.tiresMiles === 0
                                                        ? ''
                                                        : settings.tiresMiles
                                                }
                                                onChange={handleNumericChange('tiresMiles')}
                                                placeholder="40000"
                                            />
                                        </div>
                                    </div>
                                    {settings.tiresMiles > 0 && (
                                        <p className="text-xs text-orange-600 font-medium">
                                            ={' '}
                                            {formatCentsPerMile(
                                                settings.tiresDollars / settings.tiresMiles
                                            )}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Maintenance</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-600">
                                                Cost ($)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={
                                                    settings.maintenanceDollarsDetailed === 0
                                                        ? ''
                                                        : settings.maintenanceDollarsDetailed
                                                }
                                                onChange={handleNumericChange(
                                                    'maintenanceDollarsDetailed'
                                                )}
                                                placeholder="600"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-600">Miles</Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={
                                                    settings.maintenanceMilesDetailed === 0
                                                        ? ''
                                                        : settings.maintenanceMilesDetailed
                                                }
                                                onChange={handleNumericChange(
                                                    'maintenanceMilesDetailed'
                                                )}
                                                placeholder="15000"
                                            />
                                        </div>
                                    </div>
                                    {settings.maintenanceMilesDetailed > 0 && (
                                        <p className="text-xs text-orange-600 font-medium">
                                            ={' '}
                                            {formatCentsPerMile(
                                                settings.maintenanceDollarsDetailed /
                                                    settings.maintenanceMilesDetailed
                                            )}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Oil Changes</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-600">
                                                Cost ($)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={
                                                    settings.oilChangeDollars === 0
                                                        ? ''
                                                        : settings.oilChangeDollars
                                                }
                                                onChange={handleNumericChange('oilChangeDollars')}
                                                placeholder="300"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-600">Miles</Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={
                                                    settings.oilChangeMiles === 0
                                                        ? ''
                                                        : settings.oilChangeMiles
                                                }
                                                onChange={handleNumericChange('oilChangeMiles')}
                                                placeholder="15000"
                                            />
                                        </div>
                                    </div>
                                    {settings.oilChangeMiles > 0 && (
                                        <p className="text-xs text-orange-600 font-medium">
                                            ={' '}
                                            {formatCentsPerMile(
                                                settings.oilChangeDollars / settings.oilChangeMiles
                                            )}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>DEF Fluid</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-600">
                                                Cost ($)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={
                                                    settings.defFluidDollars === 0
                                                        ? ''
                                                        : settings.defFluidDollars
                                                }
                                                onChange={handleNumericChange('defFluidDollars')}
                                                placeholder="150"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-600">Miles</Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={
                                                    settings.defFluidMiles === 0
                                                        ? ''
                                                        : settings.defFluidMiles
                                                }
                                                onChange={handleNumericChange('defFluidMiles')}
                                                placeholder="10000"
                                            />
                                        </div>
                                    </div>
                                    {settings.defFluidMiles > 0 && (
                                        <p className="text-xs text-orange-600 font-medium">
                                            ={' '}
                                            {formatCentsPerMile(
                                                settings.defFluidDollars / settings.defFluidMiles
                                            )}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Tolls / Fees</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-600">
                                                Cost ($)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={
                                                    settings.tollsDollars === 0
                                                        ? ''
                                                        : settings.tollsDollars
                                                }
                                                onChange={handleNumericChange('tollsDollars')}
                                                placeholder="250"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-600">Miles</Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={
                                                    settings.tollsMiles === 0
                                                        ? ''
                                                        : settings.tollsMiles
                                                }
                                                onChange={handleNumericChange('tollsMiles')}
                                                placeholder="10000"
                                            />
                                        </div>
                                    </div>
                                    {settings.tollsMiles > 0 && (
                                        <p className="text-xs text-orange-600 font-medium">
                                            ={' '}
                                            {formatCentsPerMile(
                                                settings.tollsDollars / settings.tollsMiles
                                            )}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                            <CardContent className="pt-6 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-orange-700">Your Rolling CPM</p>
                                        <p className="text-2xl text-orange-700">
                                            {formatCurrency(rcpm)}/mi
                                        </p>
                                    </div>
                                    <TrendingUp className="w-10 h-10 text-orange-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Fixed Costs (Itemized)</CardTitle>
                                <CardDescription>
                                    Monthly expenses breakdown with normalized totals
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(
                                    [
                                        {
                                            label: 'Truck Payment',
                                            amountField: 'truckPayment',
                                            periodField: 'truckPaymentPeriod',
                                            unitField: 'truckPaymentUnit',
                                            placeholderAmount: '1800',
                                        },
                                        {
                                            label: 'Trailer Payment',
                                            amountField: 'trailerPayment',
                                            periodField: 'trailerPaymentPeriod',
                                            unitField: 'trailerPaymentUnit',
                                            placeholderAmount: '400',
                                        },
                                        {
                                            label: 'Insurance',
                                            amountField: 'insurance',
                                            periodField: 'insurancePeriod',
                                            unitField: 'insuranceUnit',
                                            placeholderAmount: '1200',
                                        },
                                        {
                                            label: 'Permits & Licenses',
                                            amountField: 'permits',
                                            periodField: 'permitsPeriod',
                                            unitField: 'permitsUnit',
                                            placeholderAmount: '1200',
                                        },
                                        {
                                            label: 'ELD Subscription',
                                            amountField: 'eldSubscription',
                                            periodField: 'eldSubscriptionPeriod',
                                            unitField: 'eldSubscriptionUnit',
                                            placeholderAmount: '45',
                                        },
                                        {
                                            label: 'Phone & Internet',
                                            amountField: 'phoneInternet',
                                            periodField: 'phoneInternetPeriod',
                                            unitField: 'phoneInternetUnit',
                                            placeholderAmount: '100',
                                        },
                                        {
                                            label: 'Parking',
                                            amountField: 'parking',
                                            periodField: 'parkingPeriod',
                                            unitField: 'parkingUnit',
                                            placeholderAmount: '200',
                                        },
                                        {
                                            label: 'Software & Tools',
                                            amountField: 'softwareTools',
                                            periodField: 'softwareToolsPeriod',
                                            unitField: 'softwareToolsUnit',
                                            placeholderAmount: '50',
                                        },
                                    ] as const
                                ).map((item) => (
                                    <div key={item.label} className="space-y-2">
                                        <Label>{item.label}</Label>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                type="number"
                                                value={
                                                    settings[item.amountField] === 0
                                                        ? ''
                                                        : (settings[item.amountField] as number)
                                                }
                                                onChange={handleNumericChange(item.amountField)}
                                                placeholder={item.placeholderAmount}
                                                className="flex-1"
                                            />
                                            <span className="text-gray-600">$ /</span>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={
                                                    settings[item.periodField] === 0
                                                        ? ''
                                                        : (settings[item.periodField] as number)
                                                }
                                                onChange={handleNumericChange(item.periodField)}
                                                placeholder="1"
                                                className="w-16"
                                            />
                                            <select
                                                value={settings[item.unitField]}
                                                onChange={(event) =>
                                                    setSettings((prev) => ({
                                                        ...prev,
                                                        [item.unitField]: event.target
                                                            .value as PeriodUnit,
                                                    }))
                                                }
                                                className="border rounded px-3 py-2 bg-white"
                                            >
                                                <option value="week">wk</option>
                                                <option value="month">mo</option>
                                                <option value="year">yr</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Other Expenses</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addOtherFixedCost}
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add
                                        </Button>
                                    </div>
                                    {settings.otherFixed.map((item, index) => (
                                        <div key={index} className="space-y-2 p-3 border rounded">
                                            <div className="flex justify-between items-start">
                                                <Input
                                                    placeholder="Expense name"
                                                    value={item.name}
                                                    onChange={(event) =>
                                                        handleOtherFixedChange(index, {
                                                            name: event.target.value,
                                                        })
                                                    }
                                                    className="flex-1 mr-2"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeOtherFixedCost(index)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <Input
                                                    type="number"
                                                    value={item.amount === 0 ? '' : item.amount}
                                                    onChange={(event) =>
                                                        handleOtherFixedChange(index, {
                                                            amount: parseNumericInput(
                                                                event.target.value
                                                            ),
                                                        })
                                                    }
                                                    placeholder="Amount"
                                                    className="flex-1"
                                                />
                                                <span className="text-gray-600">$ /</span>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.period === 0 ? '' : item.period}
                                                    onChange={(event) =>
                                                        handleOtherFixedChange(index, {
                                                            period: parseNumericInput(
                                                                event.target.value
                                                            ),
                                                        })
                                                    }
                                                    placeholder="1"
                                                    className="w-16"
                                                />
                                                <select
                                                    value={item.unit}
                                                    onChange={(event) =>
                                                        handleOtherFixedChange(index, {
                                                            unit: event.target.value as PeriodUnit,
                                                        })
                                                    }
                                                    className="border rounded px-3 py-2 bg-white"
                                                >
                                                    <option value="week">wk</option>
                                                    <option value="month">mo</option>
                                                    <option value="year">yr</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                            <CardContent className="pt-6 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Monthly:</span>
                                    <span className="text-xl text-blue-700">
                                        {formatCurrency(fixedCosts.monthly)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Weekly:</span>
                                    <span className="text-xl text-blue-700">
                                        {formatCurrency(fixedCosts.weekly)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Daily:</span>
                                    <span className="text-xl text-blue-700">
                                        {formatCurrency(fixedCosts.daily)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Profitability Threshold</CardTitle>
                        <CardDescription>
                            Minimum cushion above RCPM to show as &ldquo;profitable&rdquo;
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Margin (¢/mile)</Label>
                                <Input
                                    type="number"
                                    step="1"
                                    value={settings.marginCents === 0 ? '' : settings.marginCents}
                                    onChange={handleNumericChange('marginCents')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Or Percent of RCPM</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={
                                        settings.marginPercent === 0 ? '' : settings.marginPercent
                                    }
                                    onChange={handleNumericChange('marginPercent')}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={settings.useWhicheverGreater}
                                onCheckedChange={(checked) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        useWhicheverGreater: checked,
                                    }))
                                }
                            />
                            <span className="text-sm text-gray-600">Use whichever is greater</span>
                        </div>

                        <p className="text-xs text-gray-500">
                            Default: {settings.marginCents}¢/mi or {settings.marginPercent}% of RCPM
                        </p>
                    </CardContent>
                </Card>

                <Button onClick={handleSave} className="w-full mt-6 h-12">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Save &amp; Start Tracking
                </Button>

                <Button
                    onClick={() => onNavigate('more')}
                    variant="outline"
                    className="w-full mt-3"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}
