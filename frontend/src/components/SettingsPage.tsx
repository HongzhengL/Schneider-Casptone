import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
    GripVertical,
    Save,
    Bell,
    Moon,
    MapPin,
    Truck,
    Settings,
    Volume2,
    ChevronRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Reorder } from 'motion/react';
import { toast } from 'sonner';

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
    onNavigate: _onNavigate,
    isLoadingDefaults,
    loadError,
}: SettingsPageProps) {
    const [activeSection, setActiveSection] = useState<string | null>(null);
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

    const [equipmentType, setEquipmentType] = useState('dry-van-53');

    useEffect(() => {
        const savedSettings = localStorage.getItem('schneider_settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                if (parsed.notifications) setNotifications(parsed.notifications);
                if (parsed.autoLocation !== undefined) setAutoLocation(parsed.autoLocation);
                if (parsed.distanceUnit) setDistanceUnit(parsed.distanceUnit);
                if (parsed.defaultRadius) setDefaultRadius(parsed.defaultRadius);
                if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
                if (parsed.vibrationEnabled !== undefined)
                    setVibrationEnabled(parsed.vibrationEnabled);
                if (parsed.equipmentType) setEquipmentType(parsed.equipmentType);
            } catch (e) {
                console.error('Failed to parse settings from localStorage', e);
            }
        }
    }, []);

    const persistSettings = (metricsToPersist: Metric[]) => {
        setCustomMetrics(metricsToPersist);

        const settingsToSave = {
            metrics: metricsToPersist,
            notifications,
            autoLocation,
            distanceUnit,
            defaultRadius,
            soundEnabled,
            vibrationEnabled,
            equipmentType,
        };
        localStorage.setItem('schneider_settings', JSON.stringify(settingsToSave));
    };

    const handleToggleMetric = (metricId: string) => {
        setLocalMetrics((prev) =>
            prev.map((metric) =>
                metric.id === metricId ? { ...metric, enabled: !metric.enabled } : metric
            )
        );
    };

    const handleSave = () => {
        persistSettings(localMetrics);
        setActiveSection(null);
        toast.success('Settings saved successfully');
    };

    const handleReset = () => {
        const resetMetrics = cloneMetrics(defaultMetrics);
        setLocalMetrics(resetMetrics);
        persistSettings(resetMetrics);
        toast.success('Metrics reset to default');
    };

    const handleResetAll = () => {
        // Reset Metrics
        const resetMetrics = cloneMetrics(defaultMetrics);
        setLocalMetrics(resetMetrics);
        setCustomMetrics(resetMetrics);

        // Reset other settings to defaults
        setNotifications({
            newLoads: true,
            rateUpdates: true,
            systemAlerts: true,
            promotions: false,
        });
        setAutoLocation(true);
        setDistanceUnit('miles');
        setDefaultRadius([250]);
        setSoundEnabled(true);
        setVibrationEnabled(true);
        setEquipmentType('dry-van-53');

        // Clear storage to revert to system defaults
        localStorage.removeItem('schneider_settings');

        toast.success('All settings reset to defaults');
    };

    const renderMetricsSettings = () => (
        <div className="space-y-6">
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

            <Card>
                <CardHeader>
                    <CardTitle>Available Metrics</CardTitle>
                    {isLoadingDefaults && (
                        <p className="text-sm text-gray-500">Loading defaults…</p>
                    )}
                    {loadError && <p className="text-sm text-red-600">{loadError}</p>}
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">
                                Left Column Metrics
                            </h3>
                            <Reorder.Group
                                axis="y"
                                values={localMetrics.filter((m) => !m.id.startsWith('right_'))}
                                onReorder={(newOrder) => {
                                    const rightMetrics = localMetrics.filter((m) =>
                                        m.id.startsWith('right_')
                                    );
                                    setLocalMetrics([...newOrder, ...rightMetrics]);
                                }}
                                className="space-y-3"
                            >
                                {localMetrics
                                    .filter((m) => !m.id.startsWith('right_'))
                                    .map((metric) => (
                                        <Reorder.Item
                                            key={metric.id}
                                            value={metric}
                                            className="bg-accent text-accent-foreground rounded-lg p-4 border border-border cursor-grab active:cursor-grabbing"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">
                                                            {metric.label}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {metric.enabled
                                                                ? 'Currently shown'
                                                                : 'Currently hidden'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={metric.enabled}
                                                    onCheckedChange={() =>
                                                        handleToggleMetric(metric.id)
                                                    }
                                                />
                                            </div>
                                        </Reorder.Item>
                                    ))}
                            </Reorder.Group>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">
                                Right Column Metrics
                            </h3>
                            <Reorder.Group
                                axis="y"
                                values={localMetrics.filter((m) => m.id.startsWith('right_'))}
                                onReorder={(newOrder) => {
                                    const leftMetrics = localMetrics.filter(
                                        (m) => !m.id.startsWith('right_')
                                    );
                                    setLocalMetrics([...leftMetrics, ...newOrder]);
                                }}
                                className="space-y-3"
                            >
                                {localMetrics
                                    .filter((m) => m.id.startsWith('right_'))
                                    .map((metric) => (
                                        <Reorder.Item
                                            key={metric.id}
                                            value={metric}
                                            className="bg-accent text-accent-foreground rounded-lg p-4 border border-border cursor-grab active:cursor-grabbing"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">
                                                            {metric.label}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {metric.enabled
                                                                ? 'Currently shown'
                                                                : 'Currently hidden'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={metric.enabled}
                                                    onCheckedChange={() =>
                                                        handleToggleMetric(metric.id)
                                                    }
                                                />
                                            </div>
                                        </Reorder.Item>
                                    ))}
                            </Reorder.Group>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground mb-3">
                        Enabled metrics will appear in this order:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Left Column
                            </h4>
                            <div className="space-y-2">
                                {localMetrics
                                    .filter((m) => m.enabled && !m.id.startsWith('right_'))
                                    .map((metric, index) => (
                                        <div key={metric.id} className="flex items-center gap-2">
                                            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm">{metric.label}</span>
                                        </div>
                                    ))}
                                {localMetrics.filter((m) => m.enabled && !m.id.startsWith('right_'))
                                    .length === 0 && (
                                    <div className="text-muted-foreground text-sm italic">
                                        No left metrics enabled
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Right Column
                            </h4>
                            <div className="space-y-2">
                                {localMetrics
                                    .filter((m) => m.enabled && m.id.startsWith('right_'))
                                    .map((metric, index) => (
                                        <div key={metric.id} className="flex items-center gap-2">
                                            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm">{metric.label}</span>
                                        </div>
                                    ))}
                                {localMetrics.filter((m) => m.enabled && m.id.startsWith('right_'))
                                    .length === 0 && (
                                    <div className="text-muted-foreground text-sm italic">
                                        No right metrics enabled
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {localMetrics.filter((m) => m.enabled).length === 0 && (
                        <div className="text-muted-foreground text-sm italic">
                            No metrics enabled. Trip cards will show default layout.
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
                <Button
                    onClick={handleSave}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                </Button>
                <Button onClick={handleReset} variant="outline" className="border-gray-300">
                    Reset Metrics
                </Button>
            </div>
        </div>
    );

    const renderNotificationSettings = () => (
        <div className="space-y-6">
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
            <div className="pt-4">
                <Button
                    onClick={handleSave}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </div>
        </div>
    );

    const renderAppPreferences = () => (
        <div className="space-y-6">
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
            <div className="pt-4">
                <Button
                    onClick={handleSave}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </div>
        </div>
    );

    const renderSoundSettings = () => (
        <div className="space-y-6">
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
            <div className="pt-4">
                <Button
                    onClick={handleSave}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </div>
        </div>
    );

    const renderDriverPreferences = () => (
        <div className="space-y-6">
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
                        <Select value={equipmentType} onValueChange={setEquipmentType}>
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
            <div className="pt-4">
                <Button
                    onClick={handleSave}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </div>
        </div>
    );

    const renderMainView = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <button
                    onClick={() => setActiveSection('metrics')}
                    className="w-full flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm hover:bg-accent transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-full">
                            <GripVertical className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="text-left">
                            <div className="font-medium">Trip Card Metrics</div>
                            <div className="text-sm text-muted-foreground">
                                Customize card layout and data
                            </div>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                <button
                    onClick={() => setActiveSection('notifications')}
                    className="w-full flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm hover:bg-accent transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <Bell className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-left">
                            <div className="font-medium">Notification Settings</div>
                            <div className="text-sm text-muted-foreground">
                                Alerts, updates, and promotions
                            </div>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                <button
                    onClick={() => setActiveSection('app-preferences')}
                    className="w-full flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm hover:bg-accent transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Settings className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <div className="font-medium">App Preferences</div>
                            <div className="text-sm text-muted-foreground">
                                Theme, location, and units
                            </div>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                <button
                    onClick={() => setActiveSection('sound')}
                    className="w-full flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm hover:bg-accent transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <Volume2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-left">
                            <div className="font-medium">Sound & Feedback</div>
                            <div className="text-sm text-muted-foreground">
                                Audio and haptic feedback
                            </div>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                <button
                    onClick={() => setActiveSection('driver')}
                    className="w-full flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm hover:bg-accent transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                            <Truck className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-left">
                            <div className="font-medium">Driver Preferences</div>
                            <div className="text-sm text-muted-foreground">
                                Load types and equipment
                            </div>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t">
                <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    onClick={handleResetAll}
                >
                    Reset All
                </Button>
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

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl">
                        {activeSection === 'metrics'
                            ? 'Trip Card Metrics'
                            : activeSection === 'notifications'
                              ? 'Notifications'
                              : activeSection === 'app-preferences'
                                ? 'App Preferences'
                                : activeSection === 'sound'
                                  ? 'Sound & Feedback'
                                  : activeSection === 'driver'
                                    ? 'Driver Preferences'
                                    : 'Settings'}
                    </h1>
                </div>
            </div>

            {activeSection === 'metrics' && renderMetricsSettings()}
            {activeSection === 'notifications' && renderNotificationSettings()}
            {activeSection === 'app-preferences' && renderAppPreferences()}
            {activeSection === 'sound' && renderSoundSettings()}
            {activeSection === 'driver' && renderDriverPreferences()}
            {!activeSection && renderMainView()}
        </div>
    );
}
