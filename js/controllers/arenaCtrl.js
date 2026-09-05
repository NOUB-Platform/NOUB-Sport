/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/controllers/arenaCtrl.js
 * Version: 3.1.0
 * Description: Controller for Matches Arena, Live Scores, and Match Form Submission.
 */

import { MatchService } from '../services/matchService.js';
import { TeamService } from '../services/teamService.js';
import { state } from '../core/state.js';
import { SoundManager } from '../utils/soundManager.js';
import { NewsEngine } from '../utils/newsEngine.js';

export class ArenaController {
    constructor() {
        this.matchService = new MatchService();
        this.teamService = new TeamService();
        this.activeTab = 'matches'; // or 'new_match'
    }

    async init() {
        this.setupEventListeners();
        await this.loadMatches();
    }

    setupEventListeners() {
        const tabMatches = document.getElementById('arena-tab-matches');
        const tabNew = document.getElementById('arena-tab-new');
        const listSection = document.getElementById('arena-matches-list');
        const formSection = document.getElementById('arena-match-form-box');

        if (tabMatches && tabNew) {
            tabMatches.addEventListener('click', () => {
                this.activeTab = 'matches';
                tabMatches.classList.add('active');
                tabNew.classList.remove('active');
                listSection?.classList.remove('hidden');
                formSection?.classList.add('hidden');
                this.loadMatches();
            });

            tabNew.addEventListener('click', () => {
                this.activeTab = 'new_match';
                tabNew.classList.add('active');
                tabMatches.classList.remove('active');
                listSection?.classList.add('hidden');
                formSection?.classList.remove('hidden');
            });
        }

        const submitBtn = document.getElementById('btn-submit-match');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleMatchSubmit());
        }
    }

    async loadMatches() {
        const container = document.getElementById('arena-matches-container');
        if (!container) return;

        container.innerHTML = '<div class="loader-bar"></div>';

        try {
            const matches = await this.matchService.getZoneMatches(1);
            if (!matches || matches.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; color: var(--text-muted); padding: 40px 10px;">
                        <i class="fa-solid fa-trophy" style="font-size: 2.5rem; margin-bottom: 10px; color: var(--gold-dim);"></i>
                        <p>لا توجد مباريات مسجلة حتى الآن في منطقتك. كن أول من يسجل مباراة!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = matches.map(m => `
                <div class="match-card">
                    <div class="match-meta">
                        <span><i class="fa-regular fa-clock"></i> ${new Date(m.playedAt).toLocaleDateString('ar-EG')}</span>
                        <span class="match-status status-confirmed">تم الاعتماد</span>
                    </div>
                    <div class="scoreboard">
                        <div class="sb-team">
                            <div class="sb-logo" style="background: #2563eb; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold;">A</div>
                            <span style="font-weight: bold; font-size: 0.9rem; color: #fff;">${m.teamA}</span>
                        </div>
                        <div class="sb-score">${m.scoreA} - ${m.scoreB}</div>
                        <div class="sb-team">
                            <div class="sb-logo" style="background: #dc2626; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold;">B</div>
                            <span style="font-weight: bold; font-size: 0.9rem; color: #fff;">${m.teamB}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error("Load Matches Error:", error);
            container.innerHTML = '<p style="color: var(--danger); text-align: center;">فشل تحميل المباريات.</p>';
        }
    }

    async handleMatchSubmit() {
        const user = state.getUser();
        if (!user) {
            alert("يرجى تسجيل الدخول أولاً.");
            return;
        }

        const myTeam = await this.teamService.getMyTeam(user.id);
        if (!myTeam) {
            alert("يجب أن تكون مسجلاً في فريق لتوثيق مباراة.");
            return;
        }

        const teamBNameInput = document.getElementById('inp-match-opp-name');
        const scoreAInput = document.getElementById('inp-match-score-a');
        const scoreBInput = document.getElementById('inp-match-score-b');

        const oppName = teamBNameInput?.value?.trim();
        const scoreA = parseInt(scoreAInput?.value || '0', 10);
        const scoreB = parseInt(scoreBInput?.value || '0', 10);

        if (!oppName) {
            alert("يرجى إدخال اسم الفريق المنافس.");
            return;
        }

        try {
            await this.matchService.recordMatch(user.id, {
                teamAId: myTeam.id,
                teamBId: myTeam.id, // For scrimmage testing
                scoreA: scoreA,
                scoreB: scoreB
            });

            SoundManager.play('whistle');
            const report = NewsEngine.generateReport(myTeam.name, oppName, scoreA, scoreB);
            alert(`🎉 ${report.headline}\n\n${report.body}`);

            // Switch back to matches list
            document.getElementById('arena-tab-matches')?.click();
        } catch (err) {
            SoundManager.play('error');
            console.error("Submit Match Error:", err);
            alert(err.message || "حدث خطأ أثناء تسجيل النتيجة.");
        }
    }
}
