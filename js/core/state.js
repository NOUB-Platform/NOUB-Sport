/*
 * Filename: js/core/state.js
 * Version: 4.2.0 (Diamond Release)
 * Description: Centralized State Management Store (Singleton Pattern).
 */

class StateManager {
    constructor() {
        this.currentUser = null;
        this.lastActive = new Date();
    }

    setUser(userData, persist = true) {
        this.currentUser = userData;
        this.lastActive = new Date();

        if (persist && userData) {
            try {
                localStorage.setItem('noub_session_cache', JSON.stringify(userData));
            } catch (error) {
                console.error("State: Failed to persist user data", error);
            }
        }
    }

    getUser() {
        if (this.currentUser) {
            return this.currentUser;
        }

        const cachedData = localStorage.getItem('noub_session_cache');
        if (cachedData) {
            try {
                this.currentUser = JSON.parse(cachedData);
                return this.currentUser;
            } catch (error) {
                console.error("State: Cache Corrupted. Clearing...", error);
                this.clear();
                return null;
            }
        }

        return null;
    }

    clear() {
        this.currentUser = null;
        localStorage.removeItem('noub_session_cache');
        localStorage.removeItem('noub_user_id');
    }

    isLoggedIn() {
        return !!this.getUser();
    }
}

export const state = new StateManager();
