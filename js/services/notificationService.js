/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/services/notificationService.js
 * Version: Noub Sports_beta 0.0.1
 * Status: Production Ready
 */

import { supabase } from '../core/supabaseClient.js';

export class NotificationService {
    async sendTeamInvite(senderId, receiverId, teamId) {
        if (!supabase) throw new Error("قاعدة البيانات غير متصلة.");

        const { data, error } = await supabase
            .from('notifications')
            .insert([{
                user_id: receiverId,
                sender_id: senderId,
                type: 'TEAM_INVITE',
                payload: { teamId: teamId },
                is_read: false,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error("Invite Error:", error);
            throw new Error("فشل إرسال الدعوة.");
        }
        return data;
    }

    async getNotifications(userId) {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                sender:sender_id (username)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Notification Fetch Error:", error);
            return [];
        }
        return data;
    }

    async markAsRead(notificationId) {
        if (!supabase) return;

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
    }
}
