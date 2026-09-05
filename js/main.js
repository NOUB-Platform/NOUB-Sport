/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/main.js
 * Version: 3.5.0 (SINGLE ENTRY SPA)
 * Status: Production Ready
 */

import { Router } from './core/router.js';
import { TelegramService } from './core/telegram.js';
import { AuthService } from './services/authService.js';
import { state } from './core/state.js';
import { SoundManager } from './utils/soundManager.js';

// Controllers
import { OnboardingController } from './controllers/onboardingCtrl.js';
import { HomeController } from './controllers/homeCtrl.js';
import { ArenaController } from './controllers/arenaCtrl.js';
import { ScoutController } from './controllers/scoutCtrl.js';
import { TeamController } from './controllers/teamCtrl.js';
import { TacticsController } from './controllers/tacticsCtrl.js';
import { MenuController } from './controllers/menuCtrl.js';
import { OperationsController } from './controllers/operationsCtrl.js';
import { TournamentController } from './controllers/tournamentCtrl.js';

class NoubSportsApp {
    constructor() {
        this.router = new Router();
        this.telegram = new TelegramService();
        this.authService = new AuthService();

        // Instantiate controllers
        this.onboardingCtrl = new OnboardingController();
        this.homeCtrl = new HomeController();
        this.arenaCtrl = new ArenaController();
        this.scoutCtrl = new ScoutController();
        this.teamCtrl = new TeamController();
        this.tacticsCtrl = new TacticsController();
        this.menuCtrl = new MenuController();
        this.operationsCtrl = new OperationsController();
        this.tournamentCtrl = new TournamentController();
    }

    async bootstrap() {
        console.log("⚡ Bootstrapping NOUB Sports Ecosystem...");

        // 1. Telegram WebApp Ready
        this.telegram.init();

        // 2. Sound System Pre-warming
        SoundManager.init();

        // 3. Setup Global Nav Events
        this.setupNavigation();

        // 4. Check Authentication Session
        let user = await this.authService.checkUser();

        // Hide Splash Screen
        const splash = document.getElementById('screen-splash');
        if (splash) {
            splash.style.transition = 'opacity 0.4s ease-out';
            splash.style.opacity = '0';
            setTimeout(() => splash.remove(), 400);
        }

        if (user) {
            this.onUserLoggedIn(user);
        } else {
            console.log("No active session -> Launching Minting Studio.");
            this.router.navigate('view-onboarding');
            this.onboardingCtrl.init();
        }
    }

    onUserLoggedIn(user) {
        state.setUser(user);

        // Update header user balance
        const headerCoins = document.getElementById('header-user-coins');
        if (headerCoins) {
            headerCoins.innerText = user.balance || 10000;
        }

        // Initialize Core Views
        this.homeCtrl.init();
        this.arenaCtrl.init();
        this.scoutCtrl.init();
        this.teamCtrl.init();
        this.tacticsCtrl.init();
        this.menuCtrl.init();
        this.operationsCtrl.init();

        // Route to Home View
        this.router.navigate('view-home');
    }

    setupNavigation() {
        document.getElementById('nav-home')?.addEventListener('click', () => {
            SoundManager.play('click');
            this.router.navigate('view-home');
            this.homeCtrl.render();
        });

        document.getElementById('nav-arena')?.addEventListener('click', () => {
            SoundManager.play('click');
            this.router.navigate('view-arena');
            this.arenaCtrl.loadMatches();
        });

        document.getElementById('nav-scout')?.addEventListener('click', () => {
            SoundManager.play('click');
            this.router.navigate('view-scout');
            this.scoutCtrl.loadCards();
        });

        document.getElementById('nav-team')?.addEventListener('click', () => {
            SoundManager.play('click');
            this.router.navigate('view-team');
            this.teamCtrl.checkUserTeam();
        });
    }
}

// Global bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new NoubSportsApp();
    window.appInstance = app;
    app.bootstrap();
});
