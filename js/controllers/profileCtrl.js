/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/controllers/profileCtrl.js
 * Version: 2.1.0
 * Description: Controller for User Profile View.
 */

import { state } from '../core/state.js';
import { supabase } from '../core/supabaseClient.js';
import { SoundManager } from '../utils/soundManager.js';

export class ProfileController {
    init() {
        this.renderProfile();
    }

    renderProfile() {
        const user = state.getUser();
        if (!user) return;

        const nameEl = document.getElementById('prof-username');
        const zoneEl = document.getElementById('prof-zone');
        const coinsEl = document.getElementById('prof-coins');
        const repEl = document.getElementById('prof-rep');

        if (nameEl) nameEl.innerText = user.username;
        if (zoneEl) zoneEl.innerText = 'منطقة الفسطاط ومصر القديمة';
        if (coinsEl) coinsEl.innerText = `${user.balance || 10000} NOUB`;
        if (repEl) repEl.innerText = `REP ${user.reputation || 100}`;
    }
}
