/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/controllers/teamCtrl.js
 * Version: 5.5.0
 * Description: Controller for Team Management, Creation & Roster.
 */

import { TeamService } from '../services/teamService.js';
import { state } from '../core/state.js';
import { SoundManager } from '../utils/soundManager.js';

export class TeamController {
    constructor() {
        this.teamService = new TeamService();
        this.currentTeam = null;
    }

    async init() {
        await this.checkUserTeam();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const createBtn = document.getElementById('btn-create-team-submit');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.handleCreateTeam());
        }

        const leaveBtn = document.getElementById('btn-leave-team');
        if (leaveBtn) {
            leaveBtn.addEventListener('click', () => this.handleLeaveTeam());
        }
    }

    async checkUserTeam() {
        const user = state.getUser();
        if (!user) return;

        const emptyBox = document.getElementById('team-empty-state');
        const dashBox = document.getElementById('team-dashboard-view');

        try {
            this.currentTeam = await this.teamService.getMyTeam(user.id);

            if (!this.currentTeam) {
                emptyBox?.classList.remove('hidden');
                dashBox?.classList.add('hidden');
            } else {
                emptyBox?.classList.add('hidden');
                dashBox?.classList.remove('hidden');
                await this.renderDashboard();
            }
        } catch (err) {
            console.error("Check Team Error:", err);
        }
    }

    async renderDashboard() {
        if (!this.currentTeam) return;

        const nameEl = document.getElementById('dash-team-name');
        const badgeEl = document.getElementById('dash-team-badge');
        const bannerEl = document.getElementById('dash-team-banner');
        const rosterContainer = document.getElementById('dash-roster-list');

        if (nameEl) nameEl.innerText = this.currentTeam.name;
        if (badgeEl) badgeEl.innerText = this.currentTeam.name?.charAt(0) || 'T';

        if (bannerEl && this.currentTeam.logo_dna?.color) {
            bannerEl.style.background = `linear-gradient(135deg, ${this.currentTeam.logo_dna.color} 0%, #111 100%)`;
        }

        if (rosterContainer) {
            rosterContainer.innerHTML = '<div class="loader-bar"></div>';
            try {
                const roster = await this.teamService.getTeamRoster(this.currentTeam.id);
                if (!roster || roster.length === 0) {
                    rosterContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center;">لا يوجد أعضاء في القائمة بعد.</p>';
                    return;
                }

                rosterContainer.innerHTML = roster.map(m => `
                    <div class="member-card">
                        <div class="member-avatar">
                            <i class="fa-solid fa-user" style="color: var(--gold-main);"></i>
                        </div>
                        <div class="member-info">
                            <div class="member-name">
                                ${m.name} ${m.role === 'CAPTAIN' ? '<i class="fa-solid fa-crown" style="color: var(--gold-main); font-size: 0.8rem;"></i>' : ''}
                            </div>
                            <div class="member-pos">${m.position} • RATING ${m.rating}</div>
                        </div>
                        <div class="member-rep">REP ${m.reputation}</div>
                    </div>
                `).join('');
            } catch (err) {
                console.error("Roster Render Error:", err);
                rosterContainer.innerHTML = '<p style="color: var(--danger); text-align: center;">فشل تحميل التشكيل.</p>';
            }
        }
    }

    async handleCreateTeam() {
        const user = state.getUser();
        if (!user) {
            alert("يرجى تسجيل الدخول أولاً.");
            return;
        }

        const nameInput = document.getElementById('inp-new-team-name');
        const colorInput = document.getElementById('inp-new-team-color');
        const teamName = nameInput?.value?.trim();
        const teamColor = colorInput?.value || '#2563eb';

        if (!teamName || teamName.length < 3) {
            alert("يرجى إدخال اسم صحيح للفريق (3 أحرف على الأقل).");
            return;
        }

        try {
            SoundManager.play('click');
            const exists = await this.teamService.checkNameAvailability(teamName, 1);
            if (exists) {
                alert("هذا الاسم مسجل بالفعل، يرجى اختيار اسم آخر.");
                return;
            }

            await this.teamService.createTeam(user.id, teamName, 1, { color: teamColor, icon: 'shield' });
            SoundManager.play('success');
            alert(`تهانينا! تم إنشاء فريق "${teamName}" بنجاح.`);
            await this.checkUserTeam();
        } catch (err) {
            SoundManager.play('error');
            console.error("Create Team Error:", err);
            alert(err.message || "حدث خطأ أثناء إنشاء الفريق.");
        }
    }

    async handleLeaveTeam() {
        const user = state.getUser();
        if (!user || !this.currentTeam) return;

        if (!confirm("هل أنت متأكد من مغادرة الفريق؟")) return;

        try {
            await this.teamService.leaveTeam(user.id, this.currentTeam.id);
            SoundManager.play('success');
            alert("تمت مغادرة الفريق.");
            await this.checkUserTeam();
        } catch (err) {
            SoundManager.play('error');
            alert(err.message || "فشل مغادرة الفريق.");
        }
    }
}
