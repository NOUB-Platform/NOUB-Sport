/*
 * Filename: js/services/socialService.js
 * Version: 2.0.0
 * Description: Social interactions, respect/endorsements, and badges.
 */

import { supabase } from '../core/supabaseClient.js';

export class SocialService {
    async endorsePlayer(giverId, receiverId) {
        if (!supabase) throw new Error("قاعدة البيانات غير متصلة.");
        if (giverId === receiverId) throw new Error("لا يمكنك تقييم نفسك!");

        const { error } = await supabase
            .from('endorsements')
            .insert([{
                giver_id: giverId,
                receiver_id: receiverId,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            if (error.code === '23505') throw new Error("لقد قمت بإعطاء احترام لهذا اللاعب من قبل.");
            throw error;
        }

        // Increase reputation score
        await supabase.rpc('increment_reputation', { target_user_id: receiverId, amount: 5 });

        return true;
    }
}
