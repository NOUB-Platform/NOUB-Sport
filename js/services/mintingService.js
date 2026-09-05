/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/services/mintingService.js
 * Version: Noub Sports_beta 1.0.0 (SECURE MINTING)
 * Status: Production Ready
 */

import { supabase } from '../core/supabaseClient.js';

export class MintingService {
    async mintSportsCard(userId, cardData) {
        if (!supabase) throw new Error("قاعدة البيانات غير متصلة.");

        const { data: rpcRes, error: rpcErr } = await supabase.rpc('mint_genesis_sports_card', {
            p_owner_id: userId,
            p_display_name: cardData.username,
            p_activity_type: cardData.activityType || 'FOOTBALL',
            p_position: cardData.position || 'FWD',
            p_visual_dna: cardData.visualDna
        });

        if (!rpcErr && rpcRes) {
            return rpcRes;
        }

        const { data, error } = await supabase
            .from('cards')
            .insert([{
                owner_id: userId,
                subject_id: userId,
                display_name: cardData.username,
                activity_type: cardData.activityType || 'FOOTBALL',
                position: cardData.position || 'FWD',
                visual_dna: cardData.visualDna,
                stats: { rating: 60, matches: 0, goals: 0, pace: 65, shooting: 55, passing: 60, dribbling: 58, defending: 50, physical: 62 },
                minted_by: userId,
                serial_number: 1,
                type: 'GENESIS',
                is_verified: true
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
