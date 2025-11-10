import type { ProfitabilitySettings } from '../components/ProfitabilitySettingsPage';

export type ProfitabilityMode = 'simple' | 'pro';

const perMile = (dollars: number, miles: number) => {
    if (!Number.isFinite(dollars) || !Number.isFinite(miles) || miles <= 0) {
        return 0;
    }
    return dollars / miles;
};

const convertToMonthly = (amount: number, period: number, unit: 'week' | 'month' | 'year') => {
    if (!Number.isFinite(amount) || !Number.isFinite(period) || period <= 0) {
        return 0;
    }

    const normalized = amount / period;

    switch (unit) {
        case 'week':
            return normalized * 4.33;
        case 'year':
            return normalized / 12;
        default:
            return normalized;
    }
};

export const calculateRollingCpmByMode = (
    settings: ProfitabilitySettings,
    mode: ProfitabilityMode
): number => {
    const fuel = settings.mpg > 0 ? settings.fuelPrice / settings.mpg : 0;

    if (mode === 'pro') {
        const tires = perMile(settings.tiresDollars, settings.tiresMiles);
        const maintenance = perMile(
            settings.maintenanceDollarsDetailed,
            settings.maintenanceMilesDetailed
        );
        const oil = perMile(settings.oilChangeDollars, settings.oilChangeMiles);
        const def = perMile(settings.defFluidDollars, settings.defFluidMiles);
        const tolls = perMile(settings.tollsDollars, settings.tollsMiles);
        return fuel + tires + maintenance + oil + def + tolls;
    }

    const maintenance = perMile(settings.maintenanceDollars, settings.maintenanceMiles);
    return fuel + maintenance;
};

export const calculateDriverRollingCpm = (settings: ProfitabilitySettings): number => {
    const mode: ProfitabilityMode = settings.useProMode ? 'pro' : 'simple';
    return calculateRollingCpmByMode(settings, mode);
};

export const calculateFixedCostsByMode = (
    settings: ProfitabilitySettings,
    mode: ProfitabilityMode
) => {
    if (mode === 'pro') {
        const monthly =
            convertToMonthly(
                settings.truckPayment,
                settings.truckPaymentPeriod,
                settings.truckPaymentUnit
            ) +
            convertToMonthly(
                settings.trailerPayment,
                settings.trailerPaymentPeriod,
                settings.trailerPaymentUnit
            ) +
            convertToMonthly(settings.insurance, settings.insurancePeriod, settings.insuranceUnit) +
            convertToMonthly(settings.permits, settings.permitsPeriod, settings.permitsUnit) +
            convertToMonthly(
                settings.eldSubscription,
                settings.eldSubscriptionPeriod,
                settings.eldSubscriptionUnit
            ) +
            convertToMonthly(
                settings.phoneInternet,
                settings.phoneInternetPeriod,
                settings.phoneInternetUnit
            ) +
            convertToMonthly(settings.parking, settings.parkingPeriod, settings.parkingUnit) +
            convertToMonthly(
                settings.softwareTools,
                settings.softwareToolsPeriod,
                settings.softwareToolsUnit
            ) +
            (Array.isArray(settings.otherFixed)
                ? settings.otherFixed.reduce(
                      (sum, item) =>
                          sum + convertToMonthly(item.amount, item.period, item.unit ?? 'month'),
                      0
                  )
                : 0);

        return {
            monthly,
            weekly: monthly / 4.33,
            daily: monthly / 30,
        };
    }

    const monthly = Number.isFinite(settings.monthlyFixedBundle) ? settings.monthlyFixedBundle : 0;
    return {
        monthly,
        weekly: monthly / 4.33,
        daily: monthly / 30,
    };
};

export const calculateDriverFixedCosts = (settings: ProfitabilitySettings) => {
    const mode: ProfitabilityMode = settings.useProMode ? 'pro' : 'simple';
    return calculateFixedCostsByMode(settings, mode);
};

export const calculateMarginThreshold = (settings: ProfitabilitySettings, rcpm: number): number => {
    const cents = (settings.marginCents ?? 0) / 100;
    const percentOfRcpm = rcpm * ((settings.marginPercent ?? 0) / 100);

    if (settings.useWhicheverGreater) {
        return Math.max(cents, percentOfRcpm);
    }

    // If they prefer whichever smaller (future toggle), fall back to cents unless percent is defined
    if (cents === 0) {
        return percentOfRcpm;
    }
    if (percentOfRcpm === 0) {
        return cents;
    }
    return Math.min(cents, percentOfRcpm);
};
