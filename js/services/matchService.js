/*
 * Filename: js/services/matchService.js
 * Version: 2.1.0
 * Description: Match recording, confirming, and history fetching.
 */

import { supabase } from '../core/supabaseClient.js';

export class MatchService {
    async recordMatch(captainId, matchData) {
        if (!supabase) throw new Error("قاعدة البيانات غير متصلة.");

        // Check if atomic function exists
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('submit_match_result_atomic', {
            p_match_id: matchData.id || null,
            p_submitter_id: captainId,
            p_team_a_score: matchData.scoreA,
            p_team_b_score: matchData.scoreB
        });

        if (!rpcErr && rpcRes) {
            return rpcRes;
        }

        // Standard insert/update fallback
        const { data, error } = await supabase
            .from('matches')
            .insert([{
                team_a_id: matchData.teamAId,
                team_b_id: matchData.teamBId,
                score_a: matchData.scoreA,
                score_b: matchData.scoreB,
                status: 'COMPLETED',
                played_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getTeamMatches(teamId) {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('matches')
            .select(`
                *,
                team_a:team_a_id (name, logo_dna),
                team_b:team_b_id (name, logo_dna)
            `)
            .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
            .order('played_at', { ascending: false });

        if (error) {
            console.error("Fetch Matches Error:", error);
            return [];
        }

        return data.map(m => ({
            id: m.id,
            teamA: m.team_a?.name || 'فريق أ',
            teamB: m.team_b?.name || 'فريق ب',
            scoreA: m.score_a || 0,
            scoreB: m.score_b || 0,
            status: m.status,
            playedAt: m.played_at
        }));
    }

    async getZoneMatches(zoneId) {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('matches')
            .select(`
                *,
                team_a:team_a_id (name, logo_dna),
                team_b:team_b_id (name, logo_dna)
            `)
            .order('played_at', { ascending: false })
            .limit(20);

        if (error) return [];

        return data.map(m => ({
            id: m.id,
            teamA: m.team_a?.name || 'فريق أ',
            teamB: m.team_b?.name || 'فريق ب',
            scoreA: m.score_a || 0,
            scoreB: m.score_b || 0,
            status: m.status,
            playedAt: m.played_at
        }));
    }
}
