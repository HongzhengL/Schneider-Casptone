import { getSupabaseClient } from './supabaseClient.js';

const defaultSettings = {
    mpg: 6.5,
    fuelPrice: 3.89,
    maintenanceDollars: 1200,
    maintenanceMiles: 10000,
    monthlyFixedBundle: 12000,
    tiresDollars: 800,
    tiresMiles: 40000,
    maintenanceDollarsDetailed: 600,
    maintenanceMilesDetailed: 15000,
    oilChangeDollars: 300,
    oilChangeMiles: 15000,
    defFluidDollars: 150,
    defFluidMiles: 10000,
    tollsDollars: 250,
    tollsMiles: 10000,
    truckPayment: 1800,
    truckPaymentPeriod: 1,
    truckPaymentUnit: 'month',
    trailerPayment: 400,
    trailerPaymentPeriod: 1,
    trailerPaymentUnit: 'month',
    insurance: 1200,
    insurancePeriod: 1,
    insuranceUnit: 'month',
    permits: 1200,
    permitsPeriod: 1,
    permitsUnit: 'year',
    eldSubscription: 45,
    eldSubscriptionPeriod: 1,
    eldSubscriptionUnit: 'month',
    phoneInternet: 100,
    phoneInternetPeriod: 1,
    phoneInternetUnit: 'month',
    parking: 200,
    parkingPeriod: 1,
    parkingUnit: 'month',
    softwareTools: 50,
    softwareToolsPeriod: 1,
    softwareToolsUnit: 'month',
    otherFixed: [],
    marginCents: 10,
    marginPercent: 5,
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
