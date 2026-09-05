/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/services/authService.js
 * Version: Noub Sports_beta 1.0.0 (ULTIMATE AUTH)
 * Status: Production Ready
 */

import { supabase } from '../core/supabaseClient.js';
import { User } from '../models/User.js';

export class AuthService {
    getCurrentIdentityToken() {
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (tgUser && tgUser.id) {
            return { type: 'TELEGRAM', value: tgUser.id.toString() };
        }
        
        const storedId = localStorage.getItem('noub_user_id');
        if (storedId) {
            return { type: 'TELEGRAM', value: storedId };
        }

        return null;
    }

    async checkUser() {
        if (!supabase) return null;

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            
            if (sessionData?.session?.user) {
                let user = await this.getUserByUuid(sessionData.session.user.id);
                if (!user) {
                    user = await this._healMissingProfile(sessionData.session.user);
                }
                return user;
            }

            const identity = this.getCurrentIdentityToken();
            if (identity && identity.type === 'TELEGRAM') {
                const { data } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('telegram_id', identity.value)
                    .maybeSingle();

                if (data) {
                    return this.getUserByUuid(data.id);
                }
            }
        } catch (err) {
            console.warn("Auth check error:", err);
        }

        return null; 
    }

    async getUserByUuid(uuid) {
        if (!supabase) return null;

        const { data: userData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uuid)
            .maybeSingle();
            
        if (error || !userData) {
            return null;
        }

        const { data: cardData } = await supabase
            .from('cards')
            .select('visual_dna')
            .eq('owner_id', uuid)
            .eq('type', 'GENESIS')
            .maybeSingle();

        let visualDna = { kit: '#3b82f6', logo: 1, face: 1, hair: 1 };
        if (cardData && cardData.visual_dna) {
            visualDna = (typeof cardData.visual_dna === 'string') 
                ? JSON.parse(cardData.visual_dna) 
                : cardData.visual_dna;
        }

        const userObj = new User(userData);
        userObj.visualDna = visualDna;
        
        return userObj;
    }

    async registerUserEmail(email, password, userData) {
        if (!supabase) throw new Error("قاعدة البيانات غير متصلة.");

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: { data: { username: userData.username } }
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error("فشل إنشاء الحساب. يرجى المحاولة لاحقاً.");

        const userId = authData.user.id;

        // Upsert Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert([{
                id: userId,
                email: email,
                username: userData.username,
                current_zone_id: userData.zoneId || 1,
                noub_coins: 10000,
                reputation_score: 100
            }]);

        if (profileError && profileError.code !== '23505') {
            console.error("Profile Create Error:", profileError);
        }

        // Mint Genesis Card
        await this._mintGenesisCard(userId, userData);

        return this.getUserByUuid(userId);
    }

    async loginEmail(email, password) {
        if (!supabase) throw new Error("قاعدة البيانات غير متصلة.");
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email, password
        });

        if (error) throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        
        let user = await this.getUserByUuid(data.user.id);
        if (!user) {
            user = await this._healMissingProfile(data.user);
        }
        
        return user;
    }

    async registerUserTelegram(userData) {
        if (!supabase) throw new Error("قاعدة البيانات غير متصلة.");

        let finalId = userData.telegramId;
        if (!finalId) {
            finalId = Math.floor(Math.random() * 1000000000).toString();
        }

        const { data: newUser, error: userError } = await supabase
            .from('profiles')
            .insert([{
                id: extensions?.uuid_generate_v4 ? undefined : undefined,
                telegram_id: finalId,
                username: userData.username,
                current_zone_id: userData.zoneId || 1,
                noub_coins: 10000,
                reputation_score: 100
            }])
            .select()
            .single();

        if (userError) throw new Error(`Registration Failed: ${userError.message}`);

        await this._mintGenesisCard(newUser.id, userData);

        if (!window.Telegram?.WebApp?.initDataUnsafe?.user) {
            localStorage.setItem('noub_user_id', finalId);
        }

        return this.getUserByUuid(newUser.id);
    }

    async logout() {
        if (supabase) {
            await supabase.auth.signOut();
        }
        localStorage.removeItem('noub_user_id');
        localStorage.removeItem('noub_session_cache');
        window.location.reload();
    }

    async _mintGenesisCard(userId, userData) {
        if (!supabase) return;

        const { data } = await supabase.from('cards')
            .select('id')
            .eq('owner_id', userId)
            .eq('type', 'GENESIS')
            .maybeSingle();

        if (data) return;

        const { error } = await supabase.from('cards').insert([{
            owner_id: userId,
            subject_id: userId,
            display_name: userData.username,
            activity_type: userData.activityType || 'FOOTBALL',
            position: userData.position || 'FWD',
            visual_dna: userData.visualDna,
            stats: { rating: 60, matches: 0, goals: 0, pace: 65, shooting: 55, passing: 60, dribbling: 58, defending: 50, physical: 62 },
            minted_by: userId,
            serial_number: 1,
            type: 'GENESIS',
            is_verified: true
        }]);

        if (error) console.error("Minting Error:", error);
    }

    async _healMissingProfile(authUser) {
        try {
            await supabase.from('profiles').upsert([{
                id: authUser.id,
                email: authUser.email,
                username: authUser.user_metadata?.username || authUser.email.split('@')[0] || 'Player',
                current_zone_id: 1, 
                noub_coins: 10000
            }]);

            await this._mintGenesisCard(authUser.id, {
                username: authUser.user_metadata?.username || 'Player',
                activityType: 'FOOTBALL',
                position: 'FWD',
                visualDna: { kit: '#3b82f6', logo: 1, face: 1, hair: 1 }
            });

            return this.getUserByUuid(authUser.id);
        } catch (e) {
            console.error("Heal Failed:", e);
            return null;
        }
    }
}
