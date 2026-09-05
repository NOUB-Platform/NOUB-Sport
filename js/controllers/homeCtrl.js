/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/controllers/homeCtrl.js
 * Version: 3.1.0
 * Description: Controller for Home Screen, 3D Player Card & Quick Actions.
 */

import { state } from '../core/state.js';
import { AvatarEngine } from '../utils/avatarEngine.js';
import { CVGenerator } from '../utils/cvGenerator.js';
import { SoundManager } from '../utils/soundManager.js';

export class HomeController {
    constructor() {
        this.activeTab = 'card'; // 'card' or 'stats'
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const tabCard = document.getElementById('htab-card');
        const tabStats = document.getElementById('htab-stats');

        if (tabCard && tabStats) {
            tabCard.addEventListener('click', () => {
                this.activeTab = 'card';
                tabCard.classList.add('active');
                tabStats.classList.remove('active');
                this.render();
            });

            tabStats.addEventListener('click', () => {
                this.activeTab = 'stats';
                tabStats.classList.add('active');
                tabCard.classList.remove('active');
                this.render();
            });
        }

        const btnExportCv = document.getElementById('btn-download-cv');
        if (btnExportCv) {
            btnExportCv.addEventListener('click', () => {
                SoundManager.play('click');
                CVGenerator.downloadCV('home-player-card', `noub-card-${state.getUser()?.username || 'player'}.png`);
            });
        }
    }

    render() {
        const user = state.getUser();
        if (!user) return;

        const container = document.getElementById('home-dynamic-content');
        if (!container) return;

        if (this.activeTab === 'card') {
            container.innerHTML = this.renderCardView(user);
            this.attach3DEffect();
        } else {
            container.innerHTML = this.renderStatsView(user);
        }
    }

    renderCardView(user) {
        const dna = user.visualDna || { kit: '#3b82f6', logo: 1, face: 1, hair: 1 };
        const rating = user.stats?.rating || 65;
        const position = user.position || 'FWD';
        const username = user.username || 'PLAYER';
        const ratingLabel = rating >= 85 ? 'LEGEND' : (rating >= 75 ? 'PRO' : 'ELITE');

        return `
            <div id="home-player-card" class="player-card card-gold fade-in" style="cursor: pointer;">
                <div class="card-inner">
                    <!-- Top Ribbon -->
                    <div class="card-header">
                        <div class="player-rating-box">
                            <span class="p-rating">${rating}</span>
                            <span class="p-pos">${position}</span>
                        </div>
                        <div class="club-badge">
                            <i class="fa-solid fa-crown" style="color: var(--gold-main); font-size: 1.5rem;"></i>
                        </div>
                    </div>

                    <!-- 3D Avatar Body -->
                    <div class="player-visual-container">
                        ${AvatarEngine.generateAvatarHTML(dna, username)}
                    </div>

                    <!-- Card Bottom Info -->
                    <div class="card-footer">
                        <h2 class="player-name">${username}</h2>
                        <div class="card-tier-label">${ratingLabel} • Z-01</div>
                        
                        <!-- Radar / Quick Stats -->
                        <div class="card-stats-grid">
                            <div class="stat-cell"><span class="val">74</span><span class="lbl">PAC</span></div>
                            <div class="stat-cell"><span class="val">68</span><span class="lbl">SHO</span></div>
                            <div class="stat-cell"><span class="val">71</span><span class="lbl">PAS</span></div>
                            <div class="stat-cell"><span class="val">75</span><span class="lbl">DRI</span></div>
                            <div class="stat-cell"><span class="val">58</span><span class="lbl">DEF</span></div>
                            <div class="stat-cell"><span class="val">70</span><span class="lbl">PHY</span></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderStatsView(user) {
        return `
            <div class="stats-overview-box fade-in" style="
                background: var(--bg-surface);
                border: 1px solid var(--gold-dim);
                border-radius: 20px;
                padding: 25px;
                width: 90%;
                max-width: 380px;
                color: #fff;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            ">
                <h3 style="color: var(--gold-main); margin-bottom: 20px; text-align: center; font-family: var(--font-sport); font-size: 1.4rem;">
                    سجل اللاعب الكروي
                </h3>
                
                <div style="display: flex; justify-content: space-around; margin-bottom: 25px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 14px;">
                    <div style="text-align: center;">
                        <span style="font-family: var(--font-orbitron); font-size: 1.8rem; color: #fff; font-weight: bold; display: block;">12</span>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">مباريات ملعوبة</span>
                    </div>
                    <div style="text-align: center;">
                        <span style="font-family: var(--font-orbitron); font-size: 1.8rem; color: var(--gold-main); font-weight: bold; display: block;">9</span>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">أهداف مسجلة</span>
                    </div>
                    <div style="text-align: center;">
                        <span style="font-family: var(--font-orbitron); font-size: 1.8rem; color: var(--success); font-weight: bold; display: block;">${user.reputation || 100}</span>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">السمعة</span>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                        <span style="color: var(--text-muted);">الرصيد المالي:</span>
                        <span style="color: var(--gold-main); font-weight: bold; font-family: var(--font-orbitron);">${user.balance || 10000} NOUB</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                        <span style="color: var(--text-muted);">المنطقة الجغرافية:</span>
                        <span style="color: #fff;">الفسطاط ومصر القديمة</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                        <span style="color: var(--text-muted);">حالة التوثيق:</span>
                        <span style="color: var(--success);"><i class="fa-solid fa-circle-check"></i> موثق رسمياً</span>
                    </div>
                </div>
            </div>
        `;
    }

    attach3DEffect() {
        const card = document.getElementById('home-player-card');
        if (!card) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);
            const rotX = -(y / (rect.height / 2)) * 12;
            const rotY = (x / (rect.width / 2)) * 12;
            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    }
}
