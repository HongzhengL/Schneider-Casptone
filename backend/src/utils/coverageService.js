import { getSupabaseClient } from './supabaseClient.js';
import { getIsoWeekBounds } from './coverage.js';

const toIsoDateOnly = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    return date.toISOString().split('T')[0];
};

const normalizeAmount = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
};

export class CoverageService {
    static async recordRunAndAggregate(
        userId,
        { loadId, amount, distance, completionDate, metadata } = {}
    ) {
        const supabase = getSupabaseClient();
        const completion = completionDate ? new Date(completionDate) : new Date();
        const normalizedAmount = normalizeAmount(amount);
        const payload = {
            user_id: userId,
            load_id: loadId ?? null,
            amount: normalizedAmount,
            distance: typeof distance === 'number' ? distance : null,
            completed_at: completion.toISOString(),
            metadata: metadata ?? null,
            created_at: new Date().toISOString(),
        };

        const { error: runError } = await supabase.from('driver_runs').insert([payload]);
        if (runError) {
            throw new Error(`Failed to record driver run: ${runError.message}`);
        }

        const { startOfWeek, endOfWeek } = getIsoWeekBounds(completion);
        const weekStart = toIsoDateOnly(startOfWeek);
        const weekEnd = toIsoDateOnly(endOfWeek);

        const { data: existing, error: fetchError } = await supabase
            .from('driver_weekly_coverage')
            .select('*')
            .eq('user_id', userId)
            .eq('week_start', weekStart)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw new Error(`Failed to fetch weekly coverage: ${fetchError.message}`);
        }

        if (existing) {
            const { data: updated, error: updateError } = await supabase
                .from('driver_weekly_coverage')
                .update({
                    covered_amount: normalizeAmount(existing.covered_amount) + normalizedAmount,
                    run_count: Number(existing.run_count ?? 0) + 1,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (updateError) {
                throw new Error(`Failed to update weekly coverage: ${updateError.message}`);
            }

            return {
                coveredAmount: normalizeAmount(updated.covered_amount),
                runCount: Number(updated.run_count ?? 0),
                startOfWeek,
                endOfWeek,
            };
        }

        const { data: inserted, error: insertError } = await supabase
            .from('driver_weekly_coverage')
            .insert([
                {
                    user_id: userId,
                    week_start: weekStart,
                    week_end: weekEnd,
                    covered_amount: normalizedAmount,
                    run_count: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (insertError) {
            throw new Error(`Failed to create weekly coverage: ${insertError.message}`);
        }

        return {
            coveredAmount: normalizeAmount(inserted.covered_amount),
            runCount: Number(inserted.run_count ?? 0),
            startOfWeek,
            endOfWeek,
        };
    }

    static async getWeeklyCoverage(userId, referenceDate = new Date()) {
        const supabase = getSupabaseClient();
        const { startOfWeek, endOfWeek } = getIsoWeekBounds(referenceDate);
        const weekStart = toIsoDateOnly(startOfWeek);

        const { data, error } = await supabase
            .from('driver_weekly_coverage')
            .select('*')
            .eq('user_id', userId)
            .eq('week_start', weekStart)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Failed to fetch weekly coverage: ${error.message}`);
        }

        return {
            coveredAmount: data ? normalizeAmount(data.covered_amount) : 0,
            runCount: data ? Number(data.run_count ?? 0) : 0,
            startOfWeek,
            endOfWeek,
        };
    }
}
