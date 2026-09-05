/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/services/teamService.js
 * Version: Noub Sports_beta 0.0.1
 * Status: Production Ready
 */

import { supabase } from '../core/supabaseClient.js';

export class TeamService {
    async checkNameAvailability(name, zoneId) {
        if (!supabase) return false;
        try {
            const { data, error } = await supabase
                .from('teams')
                .select('id')
                .eq('name', name.trim())
                .maybeSingle();

            if (error) throw error;
            return !!data; 
        } catch (error) {
            console.error("TeamService: Name Check Error", error);
            return false;
        }
    }

    async createTeam(captainId, teamName, zoneId, logoDna) {
        if (!supabase) throw new Error("قاعدة البيانات غير متصلة.");

        const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .insert([{
                name: teamName,
                captain_id: captainId,
                zone_id: zoneId,
                logo_dna: logoDna,
                total_matches: 0,
                status: 'DRAFT'
            }])
            .select()
            .single();

        if (teamError) {
            console.error("Team Insert Error:", teamError);
            throw new Error(`فشل إنشاء الفريق: ${teamError.message}`);
        }

        const newTeamId = teamData.id;

        const { error: memberError } = await supabase
            .from('team_members')
            .insert([{
                team_id: newTeamId,
                user_id: captainId,
                role: 'CAPTAIN',
                jersey_number: 10,
                joined_at: new Date().toISOString()
            }]);

        if (memberError) {
            await supabase.from('teams').delete().eq('id', newTeamId);
            throw new Error("تم إنشاء الفريق ولكن فشل تعيين الكابتن.");
        }

        return teamData;
    }

    async getMyTeam(userId) {
        if (!supabase) return null;

        const { data: memberData, error } = await supabase
            .from('team_members')
            .select('team_id, role, teams (*)')
            .eq('user_id', userId)
            .maybeSingle();

        if (error || !memberData) {
            return null;
        }

        return {
            ...memberData.teams,
            my_role: memberData.role
        };
    }

    async getTeamRoster(teamId) {
        if (!supabase) return [];

        const { data: members, error: mError } = await supabase
            .from('team_members')
            .select(`
                user_id,
                role,
                jersey_number,
                joined_at,
                profiles:user_id ( username, reputation_score )
            `)
            .eq('team_id', teamId)
            .order('joined_at', { ascending: true });
        
        if (mError) {
            console.error("Roster Member Error:", mError);
            throw new Error("فشل تحميل الأعضاء.");
        }

        if (!members || members.length === 0) return [];

        const userIds = members.map(m => m.user_id);
        
        const { data: cards } = await supabase
            .from('cards')
            .select('*')
            .in('owner_id', userIds)
            .eq('type', 'GENESIS');

        return members.map(member => {
            const card = cards?.find(c => c.owner_id === member.user_id);

            return {
                userId: member.user_id,
                name: card?.display_name || member.profiles?.username || 'لاعب',
                role: member.role,
                position: card?.position || 'FWD',
                rating: card?.stats?.rating || 60,
                visual: card?.visual_dna || { kit: '#3b82f6', logo: 1, face: 1, hair: 1 },
                joinedAt: member.joined_at,
                reputation: member.profiles?.reputation_score || 100
            };
        });
    }

    async joinTeam(userId, teamId) {
        if (!supabase) throw new Error("قاعدة البيانات غير متصلة.");

        // Call our atomic function if available or direct fallback
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('join_team_atomic', {
            p_team_id: teamId,
            p_user_id: userId
        });

        if (!rpcErr && rpcRes) {
            if (!rpcRes.success) throw new Error(rpcRes.message);
            return true;
        }

        // Direct fallback
        const currentTeam = await this.getMyTeam(userId);
        if (currentTeam) throw new Error("أنت بالفعل عضو في فريق.");

        const { count } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', teamId);
        
        if (count >= 16) throw new Error("عذراً، هذا الفريق مكتمل العدد (16 لاعباً).");

        const { error } = await supabase
            .from('team_members')
            .insert([{
                team_id: teamId,
                user_id: userId,
                role: 'PLAYER',
                joined_at: new Date().toISOString()
            }]);

        if (error) throw new Error("فشل الانضمام للفريق.");
        
        if (count + 1 >= 5) {
            await supabase
                .from('teams')
                .update({ status: 'ACTIVE' })
                .eq('id', teamId)
                .eq('status', 'DRAFT');
        }

        return true;
    }

    async leaveTeam(userId, teamId) {
        if (!supabase) throw new Error("قاعدة البيانات غير متصلة.");

        const myTeam = await this.getMyTeam(userId);
        if (myTeam?.my_role === 'CAPTAIN') {
            throw new Error("الكابتن لا يمكنه المغادرة. يجب تعيين بديل أولاً أو حل الفريق.");
        }

        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('team_id', teamId)
            .eq('user_id', userId);

        if (error) throw new Error("فشل الخروج من الفريق.");
        return true;
    }

    async kickMember(captainId, teamId, memberId) {
        if (!supabase) throw new Error("قاعدة البيانات غير متصلة.");

        const myTeam = await this.getMyTeam(captainId);
        if (myTeam?.my_role !== 'CAPTAIN') throw new Error("صلاحيات غير كافية.");

        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('team_id', teamId)
            .eq('user_id', memberId);

        if (error) throw new Error("فشل طرد اللاعب.");
        return true;
    }

    async promoteMember(captainId, teamId, memberId) {
        if (!supabase) throw new Error("قاعدة البيانات غير متصلة.");

        const myTeam = await this.getMyTeam(captainId);
        if (myTeam?.my_role !== 'CAPTAIN') throw new Error("صلاحيات غير كافية.");

        const { error } = await supabase
            .from('team_members')
            .update({ role: 'VICE_CAPTAIN' })
            .eq('team_id', teamId)
            .eq('user_id', memberId);

        if (error) throw new Error("فشل الترقية.");
        return true;
    }
}
