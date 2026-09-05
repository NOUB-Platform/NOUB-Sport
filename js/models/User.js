/*
 * Filename: js/models/User.js
 * Description: Data model representing a Player/User entity.
 */

export class User {
    constructor(data = {}) {
        this.id = data.id || null;
        this.username = data.username || 'Unknown';
        this.role = data.role || 'PLAYER';
        this.zoneId = data.current_zone_id || 1;
        this.balance = data.wallet_balance || data.noub_coins || 10000;
        this.telegramId = data.telegram_id || null;
        this.reputation = data.reputation_score || 100;
        this.visualDna = data.avatar_dna || { kit: '#3b82f6', logo: 1, face: 1, hair: 1 };
    }

    get isPlayer() {
        return this.role !== 'FAN' && this.role !== 'INACTIVE';
    }
}
