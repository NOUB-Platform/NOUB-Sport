/*
 * Filename: js/services/emergencyService.js
 * Version: 2.1.0
 * Description: Emergency scouting & SOS match requests.
 */

import { supabase } from '../core/supabaseClient.js';

export class EmergencyService {
    async createSosRequest(teamId, captainId, positionNeeded, pitchLocation, rewardCoins = 500) {
        if (!supabase) throw new Error("قاعدة البيانات غير متصلة.");

        const { data, error } = await supabase
            .from('emergency_requests')
            .insert([{
                team_id: teamId,
                creator_id: captainId,
                position_needed: positionNeeded,
                location: pitchLocation,
                reward_coins: rewardCoins,
                status: 'OPEN',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getActiveSosRequests(zoneId) {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('emergency_requests')
            .select(`
                *,
                teams:team_id (name, logo_dna)
            `)
            .eq('status', 'OPEN')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("SOS Fetch Error:", error);
            return [];
        }

        return data;
    }

    async acceptSosRequest(requestId, playerId) {
        if (!supabase) throw new Error("قاعدة البيانات غير متصلة.");

        const { data: rpcRes, error: rpcErr } = await supabase.rpc('accept_emergency_request_atomic', {
            p_request_id: requestId,
            p_responder_id: playerId
        });

        if (!rpcErr && rpcRes) {
            if (!rpcRes.success) throw new Error(rpcRes.message);
            return true;
        }

        const { error } = await supabase
            .from('emergency_requests')
            .update({
                status: 'ACCEPTED',
                accepted_by: playerId
            })
            .eq('id', requestId)
            .eq('status', 'OPEN');

        if (error) throw error;
        return true;
    }
}
