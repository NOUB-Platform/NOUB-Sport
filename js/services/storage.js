/*
 * Filename: js/services/storage.js
 * Description: Browser storage wrapper with fallback.
 */

export const Storage = {
    set(key, val) {
        try {
            localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
        } catch (e) {
            console.warn("Storage write failed", e);
        }
    },
    get(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            try {
                return JSON.parse(item);
            } catch {
                return item;
            }
        } catch (e) {
            return null;
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {}
    }
};
