/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/services/marketService.js
 * Version: Noub Sports_beta 0.0.1
 * Status: Production Ready
 */

import { supabase } from '../core/supabaseClient.js';
import { PlayerCard } from '../models/PlayerCard.js';

export class MarketService {
    async getGlobalCards(zoneId, filterPosition = 'ALL') {
        if (!supabase) return [];

        let query = supabase
            .from('cards')
            .select(`
                id,
                owner_id,
                display_name,
                position,
                activity_type,
                stats,
                visual_dna,
                is_verified,
                profiles:owner_id (
                    reputation_score,
                    current_zone_id
                )
            `)
            .eq('type', 'GENESIS');

        if (filterPosition && filterPosition !== 'ALL') {
            query = query.eq('position', filterPosition);
        }

        const { data, error } = await query.limit(50);

        if (error) {
            console.error("MarketService: Fetch Error", error);
            return [];
        }

        return data.map(item => {
            const card = new PlayerCard(item);
            card.reputation = item.profiles?.reputation_score || 100;
            card.zoneId = item.profiles?.current_zone_id || 1;
            return card;
        });
    }

    async getCardDetails(cardId) {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('cards')
            .select(`
                *,
                profiles:owner_id (
                    username,
                    reputation_score,
                    current_zone_id
                )
            `)
            .eq('id', cardId)
            .single();

        if (error || !data) return null;

        const card = new PlayerCard(data);
        card.ownerName = data.profiles?.username;
        card.reputation = data.profiles?.reputation_score;
        card.zoneId = data.profiles?.current_zone_id;
        return card;
    }
}
