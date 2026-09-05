/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/controllers/tacticsCtrl.js
 * Version: Noub Sports_beta 2.6.0
 * Description: Interactive Football Pitch Strategy & Tactics Board.
 */

import { CanvasExporter } from '../utils/canvasExporter.js';
import { SoundManager } from '../utils/soundManager.js';

export class TacticsController {
    constructor() {
        this.board = null;
        this.selectedItem = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.tokenCounter = 1;
    }

    init() {
        this.board = document.getElementById('tactics-field-container');
        if (!this.board) return;

        this.setupToolbar();
        this.setupBoardInteraction();
    }

    setupToolbar() {
        // Close board
        document.getElementById('btn-close-tactics')?.addEventListener('click', () => {
            document.getElementById('view-tactics')?.classList.add('hidden');
            window.router('view-home');
        });

        // Add Gold Player Token
        document.getElementById('btn-add-token-gold')?.addEventListener('click', () => {
            this.createToken('gold', this.tokenCounter++);
        });

        // Add Red Player Token
        document.getElementById('btn-add-token-red')?.addEventListener('click', () => {
            this.createToken('red', this.tokenCounter++);
        });

        // Add Ball
        document.getElementById('btn-add-ball')?.addEventListener('click', () => {
            this.createItem('ball');
        });

        // Add Cone
        document.getElementById('btn-add-cone')?.addEventListener('click', () => {
            this.createItem('cone');
        });

        // Add Arrow
        document.getElementById('btn-add-arrow')?.addEventListener('click', () => {
            this.createItem('arrow');
        });

        // Delete item
        document.getElementById('btn-delete-item')?.addEventListener('click', () => {
            if (this.selectedItem) {
                this.selectedItem.remove();
                this.deselectItem();
                SoundManager.play('click');
            }
        });

        // Rotate Arrow
        document.getElementById('btn-rotate-item')?.addEventListener('click', () => {
            if (this.selectedItem && this.selectedItem.classList.contains('tool-arrow')) {
                let rot = parseFloat(this.selectedItem.dataset.rotation || '0') + 45;
                if (rot >= 360) rot = 0;
                this.selectedItem.dataset.rotation = rot;
                this.selectedItem.style.transform = `rotate(${rot}deg)`;
            }
        });

        // Export PNG
        document.getElementById('btn-export-tactics')?.addEventListener('click', () => {
            if (this.board) {
                CanvasExporter.exportBoard(this.board, 'noub-tactic-board.png');
                SoundManager.play('success');
            }
        });

        // Clear Board
        document.getElementById('btn-clear-tactics')?.addEventListener('click', () => {
            if (confirm("هل تريد مسح لوحة التكتيك بالكامل؟")) {
                this.board.querySelectorAll('.draggable-item').forEach(el => el.remove());
                this.deselectItem();
                this.tokenCounter = 1;
            }
        });
    }

    setupBoardInteraction() {
        if (!this.board) return;

        // Pointer event listeners for smooth drag & drop
        this.board.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        window.addEventListener('pointermove', (e) => this.onPointerMove(e));
        window.addEventListener('pointerup', () => this.onPointerUp());
    }

    createToken(teamColor, num) {
        if (!this.board) return;
        const el = document.createElement('div');
        el.className = `draggable-item tactic-token token-${teamColor}`;
        el.innerText = num;
        el.style.left = '45%';
        el.style.top = '45%';
        this.board.appendChild(el);
        this.selectItem(el);
        SoundManager.play('click');
    }

    createItem(type) {
        if (!this.board) return;
        const el = document.createElement('div');
        el.className = `draggable-item tool-${type}`;
        el.style.left = '48%';
        el.style.top = '48%';

        if (type === 'arrow') {
            el.dataset.rotation = '0';
            el.innerHTML = `
                <div class="arrow-container">
                    <div class="arrow-shaft"></div>
                    <div class="arrow-head"></div>
                </div>
            `;
        }

        this.board.appendChild(el);
        this.selectItem(el);
        SoundManager.play('click');
    }

    selectItem(el) {
        this.deselectItem();
        this.selectedItem = el;
        el.classList.add('is-selected');

        const delBtn = document.getElementById('btn-delete-item');
        if (delBtn) delBtn.classList.add('enabled');

        const rotBtn = document.getElementById('btn-rotate-item');
        if (rotBtn) {
            if (el.classList.contains('tool-arrow')) {
                rotBtn.classList.add('enabled');
            } else {
                rotBtn.classList.remove('enabled');
            }
        }
    }

    deselectItem() {
        if (this.selectedItem) {
            this.selectedItem.classList.remove('is-selected');
            this.selectedItem = null;
        }
        const delBtn = document.getElementById('btn-delete-item');
        if (delBtn) delBtn.classList.remove('enabled');
        const rotBtn = document.getElementById('btn-rotate-item');
        if (rotBtn) rotBtn.classList.remove('enabled');
    }

    onPointerDown(e) {
        const item = e.target.closest('.draggable-item');
        if (item) {
            this.isDragging = true;
            this.selectItem(item);

            const boardRect = this.board.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();

            this.dragOffset.x = e.clientX - itemRect.left;
            this.dragOffset.y = e.clientY - itemRect.top;
            e.preventDefault();
        } else {
            this.deselectItem();
        }
    }

    onPointerMove(e) {
        if (!this.isDragging || !this.selectedItem) return;

        const boardRect = this.board.getBoundingClientRect();
        let newX = e.clientX - boardRect.left - this.dragOffset.x;
        let newY = e.clientY - boardRect.top - this.dragOffset.y;

        // Boundaries
        newX = Math.max(0, Math.min(newX, boardRect.width - this.selectedItem.offsetWidth));
        newY = Math.max(0, Math.min(newY, boardRect.height - this.selectedItem.offsetHeight));

        this.selectedItem.style.left = `${newX}px`;
        this.selectedItem.style.top = `${newY}px`;
    }

    onPointerUp() {
        this.isDragging = false;
    }
}
