/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/controllers/scoutCtrl.js
 * Version: 3.1.0
 * Description: Controller for Scout Market, Player Cards Browser & Detail Inspection.
 */

import { MarketService } from '../services/marketService.js';
import { AvatarEngine } from '../utils/avatarEngine.js';
import { SoundManager } from '../utils/soundManager.js';
import { NotificationService } from '../services/notificationService.js';
import { TeamService } from '../services/teamService.js';
import { state } from '../core/state.js';

export class ScoutController {
    constructor() {
        this.marketService = new MarketService();
        this.notificationService = new NotificationService();
        this.teamService = new TeamService();
        this.currentFilter = 'ALL';
        this.cards = [];
    }

    async init() {
        this.setupEventListeners();
        await this.loadCards();
    }

    setupEventListeners() {
        // Filter pills
        document.querySelectorAll('.filter-pills .pill').forEach(pill => {
            pill.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentFilter = e.currentTarget.dataset.pos || 'ALL';
                this.renderGrid();
            });
        });

        // Search input
        const searchInp = document.getElementById('scout-search-input');
        if (searchInp) {
            searchInp.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    async loadCards() {
        const grid = document.getElementById('scout-market-grid');
        if (grid) grid.innerHTML = '<div class="loader-bar"></div>';

        try {
            this.cards = await this.marketService.getGlobalCards(1, 'ALL');
            this.renderGrid();
            this.renderTrending();
        } catch (e) {
            console.error("Scout Error:", e);
        }
    }

    renderGrid(filteredCards = null) {
        const grid = document.getElementById('scout-market-grid');
        if (!grid) return;

        let list = filteredCards || this.cards;
        if (this.currentFilter !== 'ALL') {
            list = list.filter(c => c.position === this.currentFilter);
        }

        if (list.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: span 2; text-align: center; color: var(--text-muted); padding: 40px;">
                    لا يوجد لاعبين مطابقين للبحث.
                </div>
            `;
            return;
        }

        grid.innerHTML = list.map(c => {
            const rating = c.stats?.rating || 60;
            const rarityClass = rating >= 80 ? 'rarity-diamond' : (rating >= 70 ? 'rarity-gold' : (rating >= 60 ? 'rarity-silver' : 'rarity-common'));

            return `
                <div class="scout-card ${rarityClass}" data-id="${c.id}">
                    <div class="scout-card-top">
                        <span class="scout-pos">${c.position}</span>
                        <span class="scout-rating">${rating}</span>
                    </div>
                    <div class="scout-avatar-wrapper">
                        ${AvatarEngine.generateAvatarHTML(c.visuals, c.displayName)}
                    </div>
                    <div class="scout-info">
                        <h5>${c.displayName}</h5>
                        <div class="scout-tags">
                            <span><i class="fa-solid fa-medal"></i> REP ${c.reputation || 100}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach click to open player inspection
        grid.querySelectorAll('.scout-card').forEach(cardEl => {
            cardEl.addEventListener('click', () => {
                const cardId = cardEl.dataset.id;
                this.inspectPlayer(cardId);
            });
        });
    }

    renderTrending() {
        const scroll = document.getElementById('trending-scroll-container');
        if (!scroll) return;

        const top = [...this.cards].sort((a, b) => (b.stats?.rating || 0) - (a.stats?.rating || 0)).slice(0, 6);
        
        scroll.innerHTML = top.map(c => `
            <div class="mini-trend-card" data-id="${c.id}" style="cursor: pointer;">
                <div class="mini-avatar"><i class="fa-solid fa-futbol" style="color: var(--gold-main);"></i></div>
                <strong style="color: #fff; font-size: 0.8rem;">${c.stats?.rating || 60}</strong>
                <span>${c.displayName}</span>
            </div>
        `).join('');

        scroll.querySelectorAll('.mini-trend-card').forEach(el => {
            el.addEventListener('click', () => this.inspectPlayer(el.dataset.id));
        });
    }

    handleSearch(query) {
        const q = query.trim().toLowerCase();
        if (!q) {
            this.renderGrid();
            return;
        }
        const filtered = this.cards.filter(c => 
            c.displayName?.toLowerCase().includes(q) || 
            c.position?.toLowerCase().includes(q)
        );
        this.renderGrid(filtered);
    }

    async inspectPlayer(cardId) {
        SoundManager.play('click');
        const card = this.cards.find(c => c.id === cardId) || await this.marketService.getCardDetails(cardId);
        if (!card) return;

        const modal = document.getElementById('player-detail-modal');
        const box = document.getElementById('player-detail-content');
        if (!modal || !box) return;

        box.innerHTML = `
            <div class="player-detail-header">
                <div style="height: 180px; width: 100%; display: flex; justify-content: center; align-items: center;">
                    ${AvatarEngine.generateAvatarHTML(card.visuals, card.displayName)}
                </div>
                <h3 style="font-size: 1.6rem; color: #fff; margin-top: 15px; font-family: var(--font-sport);">${card.displayName}</h3>
                <div style="color: var(--gold-main); font-weight: bold; font-family: var(--font-orbitron);">${card.position} • RATING ${card.stats?.rating || 60}</div>
            </div>

            <div class="detail-stats-row">
                <div class="ds-item"><span class="ds-val">${card.stats?.matches || 0}</span><span class="ds-lbl">مباريات</span></div>
                <div class="ds-item"><span class="ds-val">${card.stats?.goals || 0}</span><span class="ds-lbl">أهداف</span></div>
                <div class="ds-item"><span class="ds-val">${card.reputation || 100}</span><span class="ds-lbl">السمعة</span></div>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="btn-invite-player" class="btn-primary-3d" style="flex: 2;">
                    <i class="fa-solid fa-user-plus"></i> إرسال دعوة للفريق
                </button>
                <button id="btn-endorse-player" class="btn-primary-3d" style="flex: 1; background: #222; border-color: #444; color: #fff;">
                    <i class="fa-solid fa-heart" style="color: #ef4444;"></i> احترام
                </button>
            </div>
        `;

        modal.classList.remove('hidden');

        document.getElementById('btn-close-detail')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        document.getElementById('btn-invite-player')?.addEventListener('click', async () => {
            const user = state.getUser();
            if (!user) {
                alert("يرجى تسجيل الدخول أولاً.");
                return;
            }
            try {
                const myTeam = await this.teamService.getMyTeam(user.id);
                if (!myTeam) {
                    alert("يجب أن تكون كابتن فريق لتقديم دعوة انضمام.");
                    return;
                }
                await this.notificationService.sendTeamInvite(user.id, card.ownerId, myTeam.id);
                SoundManager.play('success');
                alert(`تم إرسال دعوة الانضمام إلى ${card.displayName} بنجاح!`);
                modal.classList.add('hidden');
            } catch (err) {
                SoundManager.play('error');
                alert(err.message || "فشل إرسال الدعوة.");
            }
        });

        document.getElementById('btn-endorse-player')?.addEventListener('click', () => {
            SoundManager.play('success');
            alert(`منحت احترامك للاعب ${card.displayName}! 🌟`);
        });
    }
}
