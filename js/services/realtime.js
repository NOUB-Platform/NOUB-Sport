/*
 * Filename: js/services/realtime.js
 * Version: 2.0.0
 * Description: Realtime subscriptions for matches and notifications.
 */

import { supabase } from '../core/supabaseClient.js';

export class RealtimeService {
    static subscribeToMatches(onUpdate) {
        if (!supabase) return null;

        const channel = supabase
            .channel('public:matches')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
                if (onUpdate) onUpdate(payload);
            })
            .subscribe();

        return channel;
    }

    static subscribeToNotifications(userId, onNotification) {
        if (!supabase || !userId) return null;

        const channel = supabase
            .channel(`public:notifications:${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                if (onNotification) onNotification(payload.new);
            })
            .subscribe();

        return channel;
    }
}
