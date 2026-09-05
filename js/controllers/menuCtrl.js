/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/controllers/menuCtrl.js
 * Version: 2.1.0
 * Description: Controller for Side Menu Drawer & App Settings.
 */

import { state } from '../core/state.js';
import { AuthService } from '../services/authService.js';
import { SoundManager } from '../utils/soundManager.js';

export class MenuController {
    constructor() {
        this.authService = new AuthService();
    }

    init() {
        this.setupEventListeners();
        this.updateProfileSummary();
    }

    setupEventListeners() {
        const menuBtn = document.getElementById('btn-open-menu');
        const closeBtn = document.getElementById('btn-close-menu');
        const drawer = document.getElementById('side-menu-drawer');
        const backdrop = document.getElementById('menu-backdrop');
        const logoutBtn = document.getElementById('btn-menu-logout');

        if (menuBtn && drawer) {
            menuBtn.addEventListener('click', () => {
                SoundManager.play('click');
                this.updateProfileSummary();
                drawer.classList.remove('hidden');
                drawer.classList.add('open');
                backdrop?.classList.remove('hidden');
            });
        }

        const closeMenu = () => {
            drawer?.classList.remove('open');
            setTimeout(() => {
                drawer?.classList.add('hidden');
                backdrop?.classList.add('hidden');
            }, 300);
        };

        closeBtn?.addEventListener('click', closeMenu);
        backdrop?.addEventListener('click', closeMenu);

        logoutBtn?.addEventListener('click', async () => {
            if (confirm("هل تريد تسجيل الخروج؟")) {
                await this.authService.logout();
            }
        });
    }

    updateProfileSummary() {
        const user = state.getUser();
        if (!user) return;

        const nameEl = document.getElementById('menu-user-name');
        const repEl = document.getElementById('menu-user-rep');
        const coinsEl = document.getElementById('menu-user-coins');

        if (nameEl) nameEl.innerText = user.username || 'لاعب';
        if (repEl) repEl.innerText = `REP ${user.reputation || 100}`;
        if (coinsEl) coinsEl.innerText = `${user.balance || 10000} NOUB`;
    }
}
