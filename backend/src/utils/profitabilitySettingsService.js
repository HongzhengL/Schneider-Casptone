import { getSupabaseClient } from './supabaseClient.js';

const defaultSettings = {
    mpg: 0,
    fuelPrice: 0,
    maintenanceDollars: 0,
    maintenanceMiles: 0,
    monthlyFixedBundle: 0,
    tiresDollars: 0,
    tiresMiles: 0,
    maintenanceDollarsDetailed: 0,
    maintenanceMilesDetailed: 0,
    oilChangeDollars: 0,
    oilChangeMiles: 0,
    defFluidDollars: 0,
    defFluidMiles: 0,
    tollsDollars: 0,
    tollsMiles: 0,
    truckPayment: 0,
    truckPaymentPeriod: 1,
    truckPaymentUnit: 'month',
    trailerPayment: 0,
    trailerPaymentPeriod: 1,
    trailerPaymentUnit: 'month',
    insurance: 0,
    insurancePeriod: 1,
    insuranceUnit: 'month',
    permits: 0,
    permitsPeriod: 1,
    permitsUnit: 'year',
    eldSubscription: 0,
    eldSubscriptionPeriod: 1,
    eldSubscriptionUnit: 'month',
    phoneInternet: 0,
    phoneInternetPeriod: 1,
    phoneInternetUnit: 'month',
    parking: 0,
    parkingPeriod: 1,
    parkingUnit: 'month',
    softwareTools: 0,
    softwareToolsPeriod: 1,
    softwareToolsUnit: 'month',
    otherFixed: [],
    marginCents: 0,
    marginPercent: 0,
    useWhicheverGreater: true,
    useRealTimeFuel: false,
    useProMode: false,
};

export class ProfitabilitySettingsService {
    static async getSettings(userId) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('profitability_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return defaultSettings;
            }
            throw new Error(`Failed to fetch profitability settings: ${error.message}`);
        }

        return data.settings || defaultSettings;
    }

    static async saveSettings(userId, settings) {
        const supabase = getSupabaseClient();

        const existing = await supabase
            .from('profitability_settings')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (existing.data) {
            const { data, error } = await supabase
                .from('profitability_settings')
                .update({
                    settings,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to update profitability settings: ${error.message}`);
            }

            return data.settings;
        } else {
            const { data, error } = await supabase
                .from('profitability_settings')
                .insert([
                    {
                        user_id: userId,
                        settings,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                ])
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to create profitability settings: ${error.message}`);
            }

            return data.settings;
        }
    }
}
