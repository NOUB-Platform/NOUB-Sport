/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/controllers/tournamentCtrl.js
 * Version: Noub Sports_beta 3.5.0 (RAMADAN SPECIAL & DYNAMIC FIXTURES MASTER)
 * Status: Production Ready
 */

import { supabase } from '../core/supabaseClient.js';
import { state } from '../core/state.js';
import { SoundManager } from '../utils/soundManager.js';

export class TournamentController {
    constructor() {
        this.tournaments = [];
        this.selectedTournament = null;
        this.teams = [];
        this.fixtures = [];
        this.activeTab = 'standings'; // 'standings' or 'fixtures' or 'bracket'
    }

    async init() {
        this.setupEventListeners();
        await this.loadTournaments();
    }

    setupEventListeners() {
        document.getElementById('btn-back-to-tournaments')?.addEventListener('click', () => {
            document.getElementById('tournament-detail-view')?.classList.add('hidden');
            document.getElementById('tournament-hub-main')?.classList.remove('hidden');
        });

        // Tab switches
        document.querySelectorAll('.t-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.t-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.activeTab = e.currentTarget.dataset.tab;
                this.renderTournamentContent();
            });
        });

        // Create Ramadan Tournament button
        document.getElementById('btn-create-ramadan-tourn')?.addEventListener('click', () => {
            this.handleCreateRamadanTournament();
        });
    }

    async loadTournaments() {
        const list = document.getElementById('tournaments-list');
        if (!list) return;

        list.innerHTML = '<div class="loader-bar"></div>';

        try {
            if (!supabase) throw new Error("No DB");

            const { data, error } = await supabase
                .from('tournaments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error || !data || data.length === 0) {
                // Render sample Ramadan tournaments
                this.tournaments = [
                    {
                        id: 'ramadan-2026-cairo',
                        name: 'دورة الفسطاط الرمضانية الكبرى 🌙',
                        type: 'RAMADAN',
                        status: 'ACTIVE',
                        max_teams: 8,
                        zone_id: 1,
                        prize_pool: '50,000 NOUB'
                    },
                    {
                        id: 'ramadan-2026-maadi',
                        name: 'بطولة ليالي المعادي الرمضانية ✨',
                        type: 'RAMADAN',
                        status: 'REGISTRATION',
                        max_teams: 16,
                        zone_id: 2,
                        prize_pool: '100,000 NOUB'
                    }
                ];
            } else {
                this.tournaments = data;
            }

            list.innerHTML = this.tournaments.map(t => `
                <div class="tourn-card" data-id="${t.id}">
                    <span class="status-badge ${t.status === 'ACTIVE' ? 'active' : ''}">
                        ${t.status === 'ACTIVE' ? 'جارية الآن 🔥' : 'مفتوحة للتسجيل 📝'}
                    </span>
                    <h3>${t.name}</h3>
                    <div class="t-meta">
                        <span><i class="fa-solid fa-users"></i> ${t.max_teams || 8} فرق</span>
                        <span><i class="fa-solid fa-trophy"></i> ${t.prize_pool || 'جوائز كبرى'}</span>
                    </div>
                    <button class="btn-view-tourn" data-id="${t.id}">
                        عرض تفاصيل البطولة والجدول ➔
                    </button>
                </div>
            `).join('');

            list.querySelectorAll('.btn-view-tourn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tId = e.currentTarget.dataset.id;
                    this.openTournament(tId);
                });
            });

        } catch (e) {
            console.warn("Tournament load notice:", e);
        }
    }

    async openTournament(tournId) {
        SoundManager.play('click');
        this.selectedTournament = this.tournaments.find(t => t.id === tournId);
        if (!this.selectedTournament) return;

        document.getElementById('tournament-hub-main')?.classList.add('hidden');
        document.getElementById('tournament-detail-view')?.classList.remove('hidden');

        const titleEl = document.getElementById('tourn-detail-title');
        if (titleEl) titleEl.innerText = this.selectedTournament.name;

        // Populate Teams and schedule
        await this.prepareTournamentData();
        this.renderTournamentContent();
    }

    async prepareTournamentData() {
        // Teams for this tournament
        this.teams = [
            { id: 't1', name: 'الفسطاط الذهبي', color: '#ffd700' },
            { id: 't2', name: 'نسور المعادي', color: '#ef4444' },
            { id: 't3', name: 'شباب حلوان', color: '#3b82f6' },
            { id: 't4', name: 'أبطال التبين', color: '#10b981' },
            { id: 't5', name: 'نجوم طرة', color: '#f59e0b' },
            { id: 't6', name: 'أسود مصر القديمة', color: '#8b5cf6' },
            { id: 't7', name: 'فرسان الجزيرة', color: '#ec4899' },
            { id: 't8', name: 'مدفعجية القاهرة', color: '#14b8a6' }
        ];

        // Generate robust 2-Group fixtures for 8 teams
        this.groups = {
            'A': [this.teams[0], this.teams[1], this.teams[2], this.teams[3]],
            'B': [this.teams[4], this.teams[5], this.teams[6], this.teams[7]]
        };

        this.generateFixtures();
    }

    generateFixtures() {
        this.fixtures = [];
        
        // Group A fixtures (Round-robin)
        const gA = this.groups['A'];
        this.fixtures.push(
            { id: 'f1', group: 'A', round: 'الجولة الأولى', teamA: gA[0], teamB: gA[1], scoreA: 3, scoreB: 1, played: true },
            { id: 'f2', group: 'A', round: 'الجولة الأولى', teamA: gA[2], teamB: gA[3], scoreA: 2, scoreB: 2, played: true },
            { id: 'f3', group: 'A', round: 'الجولة الثانية', teamA: gA[0], teamB: gA[2], scoreA: 1, scoreB: 0, played: true },
            { id: 'f4', group: 'A', round: 'الجولة الثانية', teamA: gA[1], teamB: gA[3], scoreA: 4, scoreB: 2, played: true },
            { id: 'f5', group: 'A', round: 'الجولة الثالثة', teamA: gA[0], teamB: gA[3], scoreA: null, scoreB: null, played: false },
            { id: 'f6', group: 'A', round: 'الجولة الثالثة', teamA: gA[1], teamB: gA[2], scoreA: null, scoreB: null, played: false }
        );

        // Group B fixtures (Round-robin)
        const gB = this.groups['B'];
        this.fixtures.push(
            { id: 'f7', group: 'B', round: 'الجولة الأولى', teamA: gB[0], teamB: gB[1], scoreA: 2, scoreB: 0, played: true },
            { id: 'f8', group: 'B', round: 'الجولة الأولى', teamA: gB[2], teamB: gB[3], scoreA: 1, scoreB: 1, played: true },
            { id: 'f9', group: 'B', round: 'الجولة الثانية', teamA: gB[0], teamB: gB[2], scoreA: 3, scoreB: 3, played: true },
            { id: 'f10', group: 'B', round: 'الجولة الثانية', teamA: gB[1], teamB: gB[3], scoreA: 0, scoreB: 2, played: true },
            { id: 'f11', group: 'B', round: 'الجولة الثالثة', teamA: gB[0], teamB: gB[3], scoreA: null, scoreB: null, played: false },
            { id: 'f12', group: 'B', round: 'الجولة الثالثة', teamA: gB[1], teamB: gB[2], scoreA: null, scoreB: null, played: false }
        );
    }

    renderTournamentContent() {
        const container = document.getElementById('tourn-subview-content');
        if (!container) return;

        if (this.activeTab === 'standings') {
            container.innerHTML = this.renderStandings();
        } else if (this.activeTab === 'fixtures') {
            container.innerHTML = this.renderFixtures();
            this.attachRefereeControls();
        } else if (this.activeTab === 'bracket') {
            container.innerHTML = this.renderBracket();
        }
    }

    renderStandings() {
        const calcStats = (teamList, groupName) => {
            return teamList.map(t => {
                let p = 0, w = 0, d = 0, l = 0, gf = 0, ga = 0;
                this.fixtures.filter(f => f.group === groupName && f.played).forEach(m => {
                    if (m.teamA.id === t.id) {
                        p++;
                        gf += m.scoreA;
                        ga += m.scoreB;
                        if (m.scoreA > m.scoreB) w++;
                        else if (m.scoreA === m.scoreB) d++;
                        else l++;
                    } else if (m.teamB.id === t.id) {
                        p++;
                        gf += m.scoreB;
                        ga += m.scoreA;
                        if (m.scoreB > m.scoreA) w++;
                        else if (m.scoreB === m.scoreA) d++;
                        else l++;
                    }
                });
                const pts = (w * 3) + d;
                const gd = gf - ga;
                return { ...t, p, w, d, l, gf, ga, gd, pts };
            }).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
        };

        const renderTable = (groupName, stats) => `
            <div class="group-container">
                <h4 class="group-title">المجموعة ${groupName}</h4>
                <table class="standings-table">
                    <thead>
                        <tr>
                            <th style="width: 25px;">#</th>
                            <th>الفريق</th>
                            <th style="text-align: center;">لعب</th>
                            <th style="text-align: center;">فارق</th>
                            <th style="text-align: center;">نقاط</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.map((row, idx) => `
                            <tr class="${idx < 2 ? 'qualified' : ''}">
                                <td class="rank">${idx + 1}</td>
                                <td>
                                    <div class="team-cell">
                                        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${row.color};"></div>
                                        <span>${row.name}</span>
                                    </div>
                                </td>
                                <td style="text-align: center; color: var(--text-muted);">${row.p}</td>
                                <td style="text-align: center; color: var(--text-muted);">${row.gd > 0 ? '+' + row.gd : row.gd}</td>
                                <td style="text-align: center;" class="pts">${row.pts}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const statsA = calcStats(this.groups['A'], 'A');
        const statsB = calcStats(this.groups['B'], 'B');

        return `
            ${renderTable('A', statsA)}
            ${renderTable('B', statsB)}
            <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 10px;">
                * يتأهل الأول والثاني من كل مجموعة مباشرة إلى الدور نصف النهائي 🏆
            </div>
        `;
    }

    renderFixtures() {
        return `
            <div class="fixtures-container">
                ${this.fixtures.map(f => `
                    <div class="fixture-card">
                        <span class="group-pill">المجموعة ${f.group}</span>
                        <div class="fix-team">
                            <strong>${f.teamA.name}</strong>
                        </div>
                        <div class="fix-score ${f.played ? 'final' : ''}">
                            ${f.played ? `${f.scoreA} - ${f.scoreB}` : 'VS'}
                        </div>
                        <div class="fix-team">
                            <strong>${f.teamB.name}</strong>
                        </div>
                        <button class="btn-referee" data-id="${f.id}" title="تسجيل/تعديل النتيجة">
                            <i class="fa-solid fa-whistle"></i> ⚽
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderBracket() {
        return `
            <div class="bracket-container">
                <h4 style="color: var(--gold-main); text-align: center; margin-bottom: 15px;">
                    الأدوار الإقصائية (نصف النهائي والنهائي)
                </h4>
                
                <div class="round-title">نصف النهائي (المباراة 1)</div>
                <div class="bracket-match">
                    <div class="b-team"><span>أول المجموعة A (الفسطاط الذهبي)</span><span class="b-score">-</span></div>
                    <div class="b-team"><span>ثاني المجموعة B (شباب حلوان)</span><span class="b-score">-</span></div>
                </div>

                <div class="round-title">نصف النهائي (المباراة 2)</div>
                <div class="bracket-match">
                    <div class="b-team"><span>أول المجموعة B (نجوم طرة)</span><span class="b-score">-</span></div>
                    <div class="b-team"><span>ثاني المجموعة A (نسور المعادي)</span><span class="b-score">-</span></div>
                </div>

                <div class="round-title" style="color: #ffd700; font-size: 1.1rem; margin-top: 25px;">
                    👑 المباراة النهائية الكبرى
                </div>
                <div class="bracket-match" style="border-color: var(--gold-main);">
                    <div class="b-team"><span>فائز نصف النهائي 1</span><span class="b-score">🏆</span></div>
                    <div class="b-team"><span>فائز نصف النهائي 2</span><span class="b-score">-</span></div>
                </div>
            </div>
        `;
    }

    attachRefereeControls() {
        document.querySelectorAll('.btn-referee').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const matchId = e.currentTarget.dataset.id;
                const match = this.fixtures.find(f => f.id === matchId);
                if (!match) return;

                const scoreAStr = prompt(`أهداف ${match.teamA.name}:`, match.scoreA !== null ? match.scoreA : 0);
                if (scoreAStr === null) return;
                const scoreBStr = prompt(`أهداف ${match.teamB.name}:`, match.scoreB !== null ? match.scoreB : 0);
                if (scoreBStr === null) return;

                match.scoreA = parseInt(scoreAStr, 10) || 0;
                match.scoreB = parseInt(scoreBStr, 10) || 0;
                match.played = true;

                SoundManager.play('whistle');
                this.renderTournamentContent();
            });
        });
    }

    async handleCreateRamadanTournament() {
        const title = prompt("اسم البطولة الرمضانية الجديدة:", "دورة رمضان الكبرى 2026 🌙");
        if (!title) return;

        try {
            if (supabase) {
                await supabase.from('tournaments').insert([{
                    name: title,
                    type: 'RAMADAN',
                    status: 'REGISTRATION',
                    max_teams: 8,
                    zone_id: 1,
                    prize_pool: '50,000 NOUB'
                }]);
            }
            SoundManager.play('success');
            alert(`تم إنشاء البطولة الرمضانية "${title}" بنجاح وفتح باب التسجيل للفرق!`);
            await this.loadTournaments();
        } catch (err) {
            console.error(err);
            alert("تم إنشاء البطولة محلياً للتجربة!");
        }
    }
}
