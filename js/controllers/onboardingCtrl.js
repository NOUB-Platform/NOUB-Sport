/*
 * Filename: js/controllers/onboardingCtrl.js
 * Version: 2.1.0
 * Description: Controller for Onboarding and Minting Studio.
 */

import { AuthService } from '../services/authService.js';
import { AvatarEngine } from '../utils/avatarEngine.js';
import { state } from '../core/state.js';
import { SoundManager } from '../utils/soundManager.js';

export class OnboardingController {
    constructor() {
        this.authService = new AuthService();
        this.dna = { kit: '#3b82f6', logo: 1, face: 1, hair: 1 };
        this.config = AvatarEngine.getConfig();
        this.currentMode = 'REGISTER'; // or 'LOGIN'
    }

    init() {
        this.setupEventListeners();
        this.updateAvatarPreview();
    }

    setupEventListeners() {
        // Tab switching: Register vs Login
        const tabReg = document.getElementById('tab-register');
        const tabLog = document.getElementById('tab-login');
        const regFields = document.querySelectorAll('.register-only');
        const avatarStudio = document.getElementById('avatar-studio-box');
        const submitBtn = document.getElementById('btn-auth-submit');

        if (tabReg && tabLog) {
            tabReg.addEventListener('click', () => {
                this.currentMode = 'REGISTER';
                tabReg.classList.add('active');
                tabLog.classList.remove('active');
                regFields.forEach(el => el.classList.remove('hidden'));
                if (avatarStudio) avatarStudio.classList.remove('hidden');
                if (submitBtn) submitBtn.innerText = 'صك الكارت والانضمام ⚡';
            });

            tabLog.addEventListener('click', () => {
                this.currentMode = 'LOGIN';
                tabLog.classList.add('active');
                tabReg.classList.remove('active');
                regFields.forEach(el => el.classList.add('hidden'));
                if (avatarStudio) avatarStudio.classList.add('hidden');
                if (submitBtn) submitBtn.innerText = 'تسجيل الدخول ⚽';
            });
        }

        // Avatar Studio controls
        document.querySelectorAll('.avatar-arrow').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.target;
                const dir = parseInt(e.currentTarget.dataset.dir, 10);
                this.cycleFeature(target, dir);
            });
        });

        // Live update on name input
        const nameInput = document.getElementById('inp-player-name');
        if (nameInput) {
            nameInput.addEventListener('input', () => {
                this.updateAvatarPreview();
            });
        }

        // Submit button
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleAuthSubmit());
        }

        // Quick Guest Preview
        const guestBtn = document.getElementById('btn-quick-guest');
        if (guestBtn) {
            guestBtn.addEventListener('click', () => {
                const guestUser = {
                    id: 'usr_guest_demo',
                    username: 'الفهد الأسمر',
                    balance: 10000,
                    reputation: 100,
                    position: 'FWD',
                    rating: 88,
                    role: 'PLAYER',
                    zone_id: 1,
                    visual_dna: { kit: '#1e3a8a', logo: 1, face: 1, hair: 1 }
                };
                state.setUser(guestUser);
                SoundManager.play('success');
                if (window.appInstance?.onUserLoggedIn) {
                    window.appInstance.onUserLoggedIn(guestUser);
                }
            });
        }
    }

    cycleFeature(feature, direction) {
        SoundManager.play('click');

        if (feature === 'kit') {
            const kits = this.config.KITS;
            let idx = kits.indexOf(this.dna.kit);
            idx = (idx + direction + kits.length) % kits.length;
            this.dna.kit = kits[idx];
            const displayEl = document.getElementById('disp-kit');
            if (displayEl) displayEl.innerText = (idx + 1).toString().padStart(2, '0');
        } else if (feature === 'logo') {
            const count = this.config.LOGOS.length;
            this.dna.logo = ((this.dna.logo - 1 + direction + count) % count) + 1;
            const displayEl = document.getElementById('disp-logo');
            if (displayEl) displayEl.innerText = this.dna.logo.toString().padStart(2, '0');
        } else if (feature === 'face') {
            const count = this.config.FACE_GEAR.length;
            this.dna.face = ((this.dna.face - 1 + direction + count) % count) + 1;
            const displayEl = document.getElementById('disp-face');
            if (displayEl) displayEl.innerText = this.dna.face.toString().padStart(2, '0');
        } else if (feature === 'hair') {
            const count = this.config.HEAD_GEAR.length;
            this.dna.hair = ((this.dna.hair - 1 + direction + count) % count) + 1;
            const displayEl = document.getElementById('disp-hair');
            if (displayEl) displayEl.innerText = this.dna.hair.toString().padStart(2, '0');
        }

        this.updateAvatarPreview();
    }

    updateAvatarPreview() {
        const previewBox = document.getElementById('avatar-preview-box');
        const nameInput = document.getElementById('inp-player-name');
        const shirtName = nameInput?.value?.trim() || 'NOUB';

        if (previewBox) {
            previewBox.innerHTML = AvatarEngine.generateAvatarHTML(this.dna, shirtName);
        }
    }

    async handleAuthSubmit() {
        const emailInput = document.getElementById('inp-auth-email');
        const passInput = document.getElementById('inp-auth-password');
        const nameInput = document.getElementById('inp-player-name');
        const posSelect = document.getElementById('sel-player-pos');
        const zoneSelect = document.getElementById('sel-player-zone');
        const submitBtn = document.getElementById('btn-auth-submit');

        const email = emailInput?.value?.trim();
        const password = passInput?.value;

        if (!email || !password) {
            alert("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
            return;
        }

        if (password.length < 6) {
            alert("كلمة المرور يجب أن لا تقل عن 6 أحرف.");
            return;
        }

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = 'جارٍ المعالجة... ⏳';
            }

            let user = null;

            if (this.currentMode === 'LOGIN') {
                user = await this.authService.loginEmail(email, password);
            } else {
                const username = nameInput?.value?.trim();
                if (!username || username.length < 2) {
                    alert("يرجى كتابة اسم اللاعب بالشكل الصحيح.");
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = 'صك الكارت والانضمام ⚡';
                    }
                    return;
                }

                user = await this.authService.registerUserEmail(email, password, {
                    username: username,
                    position: posSelect?.value || 'FWD',
                    zoneId: parseInt(zoneSelect?.value || '1', 10),
                    visualDna: this.dna
                });
            }

            if (user) {
                state.setUser(user);
                SoundManager.play('success');
                if (window.appInstance?.onUserLoggedIn) {
                    window.appInstance.onUserLoggedIn(user);
                } else {
                    window.location.reload();
                }
            }
        } catch (error) {
            SoundManager.play('error');
            console.error("Auth Error:", error);
            alert(error.message || "حدث خطأ أثناء المصادقة.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = (this.currentMode === 'LOGIN') ? 'تسجيل الدخول ⚽' : 'صك الكارت والانضمام ⚡';
            }
        }
    }
}
