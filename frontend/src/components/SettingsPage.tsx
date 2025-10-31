import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
    ChevronLeft,
    GripVertical,
    Save,
    Bell,
    Moon,
    MapPin,
    Truck,
    Settings,
    Volume2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Reorder } from 'motion/react';

interface Metric {
    id: string;
    label: string;
    enabled: boolean;
}

interface SettingsPageProps {
    customMetrics: Metric[];
    defaultMetrics: Metric[];
    setCustomMetrics: (metrics: Metric[]) => void;
    onNavigate: (page: string) => void;
    isLoadingDefaults: boolean;
    loadError: string | null;
}

export function SettingsPage({
    customMetrics,
    defaultMetrics,
    setCustomMetrics,
    onNavigate,
    isLoadingDefaults,
    loadError,
}: SettingsPageProps) {
    const [localMetrics, setLocalMetrics] = useState(customMetrics);

    useEffect(() => {
        setLocalMetrics(customMetrics);
    }, [customMetrics]);

    const cloneMetrics = (metrics: Metric[]) => metrics.map((metric) => ({ ...metric }));

    // App Settings State
    const [notifications, setNotifications] = useState({
        newLoads: true,
        rateUpdates: true,
        systemAlerts: true,
        promotions: false,
    });
    const { isDark, setDark } = useTheme();

    // theme state managed globally
    const [autoLocation, setAutoLocation] = useState(true);
    const [distanceUnit, setDistanceUnit] = useState('miles');
    const [defaultRadius, setDefaultRadius] = useState([250]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);

    const handleToggleMetric = (metricId: string) => {
        setLocalMetrics((prev) =>
            prev.map((metric) =>
                metric.id === metricId ? { ...metric, enabled: !metric.enabled } : metric
            )
        );
    };

    const handleReorder = (newOrder: Metric[]) => {
        setLocalMetrics(newOrder);
    };

    const handleSave = () => {
        setCustomMetrics(localMetrics);
        onNavigate('results');
    };

    const handleReset = () => {
        setLocalMetrics(cloneMetrics(defaultMetrics));
    };

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ChevronLeft
                        className="w-6 h-6 cursor-pointer"
                        onClick={() => onNavigate('results')}
                    />
                    <h1 className="text-xl">Trip Card Settings</h1>
                </div>
            </div>

            {/* Description */}
            <Card>
                <CardHeader>
                    <CardTitle>Customize Trip Card Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                        Choose which metrics appear at the top of your trip cards. You can drag to
                        reorder and toggle to enable/disable.
                    </p>
                </CardContent>
            </Card>

            {/* Metrics List */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Metrics</CardTitle>
                    {isLoadingDefaults && (
                        <p className="text-sm text-gray-500">Loading defaults…</p>
                    )}
                    {loadError && <p className="text-sm text-red-600">{loadError}</p>}
                </CardHeader>
                <CardContent>
                    <Reorder.Group
                        axis="y"
                        values={localMetrics}
                        onReorder={handleReorder}
                        className="space-y-3"
                    >
                        {localMetrics.map((metric) => (
                            <Reorder.Item
                                key={metric.id}
                                value={metric}
                                className="bg-accent text-accent-foreground rounded-lg p-4 border border-border cursor-grab active:cursor-grabbing"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <div className="font-medium">{metric.label}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {metric.enabled
                                                    ? 'Currently shown'
                                                    : 'Currently hidden'}
                                            </div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={metric.enabled}
                                        onCheckedChange={() => handleToggleMetric(metric.id)}
                                    />
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </CardContent>
            </Card>

            {/* Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground mb-3">
                        Enabled metrics will appear in this order:
                    </div>
                    <div className="space-y-2">
                        {localMetrics
                            .filter((metric) => metric.enabled)
                            .map((metric, index) => (
                                <div key={metric.id} className="flex items-center gap-2">
                                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs">
                                        {index + 1}
                                    </span>
                                    <span className="text-sm">{metric.label}</span>
                                </div>
                            ))}
                    </div>
                    {localMetrics.filter((m) => m.enabled).length === 0 && (
                        <div className="text-muted-foreground text-sm italic">
                            No metrics enabled. Trip cards will show default layout.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-orange-500" />
                        Notification Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">New Load Matches</div>
                            <div className="text-sm text-gray-500">
                                Get notified when new loads match your criteria
                            </div>
                        </div>
                        <Switch
                            checked={notifications.newLoads}
                            onCheckedChange={(checked) =>
                                setNotifications((prev) => ({ ...prev, newLoads: checked }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Rate Updates</div>
                            <div className="text-sm text-gray-500">
                                Alerts when rates change for your loads
                            </div>
                        </div>
                        <Switch
                            checked={notifications.rateUpdates}
                            onCheckedChange={(checked) =>
                                setNotifications((prev) => ({ ...prev, rateUpdates: checked }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">System Alerts</div>
                            <div className="text-sm text-gray-500">
                                Important app updates and maintenance notices
                            </div>
                        </div>
                        <Switch
                            checked={notifications.systemAlerts}
                            onCheckedChange={(checked) =>
                                setNotifications((prev) => ({ ...prev, systemAlerts: checked }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Promotions</div>
                            <div className="text-sm text-gray-500">
                                Special offers and promotional content
                            </div>
                        </div>
                        <Switch
                            checked={notifications.promotions}
                            onCheckedChange={(checked) =>
                                setNotifications((prev) => ({ ...prev, promotions: checked }))
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* App Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-500" />
                        App Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Dark Mode</div>
                            <div className="text-sm text-gray-500">Switch to dark theme</div>
                        </div>
                        <Switch checked={isDark} onCheckedChange={setDark} />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Auto-detect Location</div>
                            <div className="text-sm text-gray-500">
                                Automatically use your current location
                            </div>
                        </div>
                        <Switch checked={autoLocation} onCheckedChange={setAutoLocation} />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Distance Unit</span>
                        </div>
                        <Select value={distanceUnit} onValueChange={setDistanceUnit}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="miles">Miles</SelectItem>
                                <SelectItem value="kilometers">Kilometers</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Default Search Radius</span>
                            <span className="text-gray-600">
                                {defaultRadius[0]} {distanceUnit}
                            </span>
                        </div>
                        <Slider
                            value={defaultRadius}
                            onValueChange={setDefaultRadius}
                            max={500}
                            min={25}
                            step={25}
                            className="[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-500"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Sound & Feedback */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-green-500" />
                        Sound & Feedback
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Sound Notifications</div>
                            <div className="text-sm text-gray-500">
                                Play sounds for notifications
                            </div>
                        </div>
                        <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Vibration</div>
                            <div className="text-sm text-gray-500">
                                Vibrate on notifications and interactions
                            </div>
                        </div>
                        <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
                    </div>
                </CardContent>
            </Card>

            {/* Driver Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-purple-500" />
                        Driver Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <label className="font-medium">Preferred Load Types</label>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                                Dry Van
                            </span>
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                                Reefer
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="font-medium">Equipment Type</label>
                        <Select defaultValue="dry-van-53">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dry-van-53">53' Dry Van</SelectItem>
                                <SelectItem value="reefer-53">53' Reefer</SelectItem>
                                <SelectItem value="flatbed-48">48' Flatbed</SelectItem>
                                <SelectItem value="step-deck">Step Deck</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
                <Button
                    onClick={handleSave}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save All Settings
                </Button>

                <div className="grid grid-cols-2 gap-3">
                    <Button onClick={handleReset} variant="outline" className="border-gray-300">
                        Reset Metrics
                    </Button>
                    <Button
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                        Reset All
                    </Button>
                </div>
            </div>

            {/* Quick Settings Summary */}
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <CardContent className="pt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Settings Summary</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>• {localMetrics.filter((m) => m.enabled).length} metrics enabled</p>
                        <p>
                            • Notifications: {Object.values(notifications).filter(Boolean).length}/4
                            active
                        </p>
                        <p>
                            • Default radius: {defaultRadius[0]} {distanceUnit}
                        </p>
                        <p>• {autoLocation ? 'Auto-location enabled' : 'Manual location entry'}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Info */}
            <div className="text-xs text-gray-500 text-center pb-4">
                Settings are automatically synced and apply across all devices
            </div>
        </div>
    );
}
