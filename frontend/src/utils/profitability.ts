import type { ProfitabilitySettings } from '../components/ProfitabilitySettingsPage';

const perMile = (dollars: number, miles: number) => {
    if (!Number.isFinite(dollars) || !Number.isFinite(miles) || miles <= 0) {
        return 0;
    }
    return dollars / miles;
};

export const calculateDriverRollingCpm = (settings: ProfitabilitySettings): number => {
    const fuel = settings.mpg > 0 ? settings.fuelPrice / settings.mpg : 0;

    if (settings.useProMode) {
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
