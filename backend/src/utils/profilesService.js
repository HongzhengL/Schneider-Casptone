import { getSupabaseClient } from './supabaseClient.js';

export class ProfilesService {
    static async getProfiles(userId) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch profiles: ${error.message}`);
        }

        return data || [];
    }

    static async getProfile(userId, profileId) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profileId)
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw new Error(`Failed to fetch profile: ${error.message}`);
        }

        return data;
    }

    static async createProfile(userId, input) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('profiles')
            .insert([
                {
                    user_id: userId,
                    name: input.name,
                    filters: input.filters || {},
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create profile: ${error.message}`);
        }

        return data;
    }

    static async updateProfile(userId, profileId, input) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('profiles')
            .update({
                name: input.name,
                filters: input.filters || {},
                updated_at: new Date().toISOString(),
            })
            .eq('id', profileId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw new Error(`Failed to update profile: ${error.message}`);
        }

        return data;
    }

    static async deleteProfile(userId, profileId) {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profileId)
            .eq('user_id', userId);

        if (error) {
            throw new Error(`Failed to delete profile: ${error.message}`);
        }
    }
}
