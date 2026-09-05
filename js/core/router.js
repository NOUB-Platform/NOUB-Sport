/*
 * Filename: js/core/router.js
 * Version: 2.0.0
 * Description: Handles SPA navigation.
 */

export class Router {
    constructor() {
        this.views = document.querySelectorAll('.view-section');
        this.navBtns = document.querySelectorAll('.nav-btn');
        window.router = (viewId) => this.navigate(viewId);
    }

    navigate(viewId) {
        this.views.forEach(view => {
            view.classList.add('hidden');
        });

        const target = document.getElementById(viewId);
        if (target) {
            target.classList.remove('hidden');
            window.scrollTo(0, 0);
        } else {
            console.error(`View not found: ${viewId}`);
            return;
        }

        const header = document.getElementById('app-header');
        const navbar = document.getElementById('global-navbar');
        const mainContent = document.getElementById('main-content');

        if (viewId === 'view-onboarding' || viewId === 'view-tactics') {
            header?.classList.add('hidden');
            navbar?.classList.add('hidden');
            if (mainContent) {
                mainContent.style.top = '0';
                mainContent.style.bottom = '0';
            }
        } else {
            header?.classList.remove('hidden');
            navbar?.classList.remove('hidden');
            if (mainContent) {
                mainContent.style.top = '75px';
                mainContent.style.bottom = 'var(--nav-height)';
            }
        }

        this.updateNavbar(viewId);
    }

    updateNavbar(activeViewId) {
        this.navBtns.forEach(btn => btn.classList.remove('active'));

        let btnId = '';
        if (activeViewId === 'view-home') btnId = 'nav-home';
        if (activeViewId === 'view-arena') btnId = 'nav-arena';
        if (activeViewId === 'view-scout') btnId = 'nav-scout';
        if (activeViewId === 'view-team') btnId = 'nav-team';
        if (activeViewId === 'view-tournaments' || activeViewId === 'view-tactics') {
            btnId = 'nav-action';
        }
        
        if (btnId) {
            const activeBtn = document.getElementById(btnId);
            if (activeBtn) activeBtn.classList.add('active');
        }
    }
}
