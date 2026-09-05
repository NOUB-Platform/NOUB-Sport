/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/controllers/operationsCtrl.js
 * Version: 2.1.0
 * Description: Controller for Floating Quick Action FAB Menu & Emergency Hub.
 */

import { SoundManager } from '../utils/soundManager.js';
import { EmergencyService } from '../services/emergencyService.js';
import { TeamService } from '../services/teamService.js';
import { state } from '../core/state.js';

export class OperationsController {
    constructor() {
        this.emergencyService = new EmergencyService();
        this.teamService = new TeamService();
    }

    init() {
        this.setupFabMenu();
    }

    setupFabMenu() {
        const fabTrigger = document.getElementById('nav-action');
        const fabOverlay = document.getElementById('fab-operations-overlay');
        const fabClose = document.getElementById('btn-close-fab');

        if (fabTrigger && fabOverlay) {
            fabTrigger.addEventListener('click', () => {
                SoundManager.play('click');
                fabOverlay.classList.add('active');
            });

            const closeFab = () => {
                fabOverlay.classList.remove('active');
            };

            fabClose?.addEventListener('click', closeFab);
            fabOverlay.addEventListener('click', (e) => {
                if (e.target === fabOverlay) closeFab();
            });

            // Action 1: Tactics Board
            document.getElementById('fab-item-tactics')?.addEventListener('click', () => {
                closeFab();
                document.getElementById('view-tactics')?.classList.remove('hidden');
            });

            // Action 2: Tournaments Hub
            document.getElementById('fab-item-tournament')?.addEventListener('click', () => {
                closeFab();
                window.router('view-tournaments');
                if (window.appInstance?.tournamentCtrl) {
                    window.appInstance.tournamentCtrl.init();
                }
            });

            // Action 3: New Match
            document.getElementById('fab-item-match')?.addEventListener('click', () => {
                closeFab();
                window.router('view-arena');
                document.getElementById('arena-tab-new')?.click();
            });

            // Action 4: Emergency SOS
            document.getElementById('fab-item-sos')?.addEventListener('click', () => {
                closeFab();
                this.promptEmergencyCall();
            });
        }
    }

    async promptEmergencyCall() {
        const user = state.getUser();
        if (!user) {
            alert("يرجى تسجيل الدخول أولاً.");
            return;
        }

        const myTeam = await this.teamService.getMyTeam(user.id);
        if (!myTeam) {
            alert("خدمة الطوارئ تتطلب أن تكون مسجلاً في فريق.");
            return;
        }

        const pos = prompt("ما هو المركز المطلوب بشكل عاجل؟ (GK, DEF, MID, FWD)", "GK");
        if (!pos) return;

        const pitch = prompt("اسم الملعب أو المنطقة:", "ملعب الفسطاط الخماسي");
        if (!pitch) return;

        try {
            await this.emergencyService.createSosRequest(myTeam.id, user.id, pos.toUpperCase(), pitch, 500);
            SoundManager.play('whistle');
            alert(`🚨 تم نشر نداء الطوارئ لطلب لاعب (${pos}) في ${pitch} مع مكافأة 500 NOUB!`);
        } catch (err) {
            SoundManager.play('error');
            alert(err.message || "فشل إرسال نداء الطوارئ.");
        }
    }
}
