/*
 * Filename: js/utils/soundManager.js
 * Version: 5.0.0 (Active Audio Engine)
 * Description: Manages application sound effects (SFX).
 */

export const SoundManager = {
    sounds: {
        'click': new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
        'success': new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),
        'error': new Audio('https://assets.mixkit.co/active_storage/sfx/2673/2673-preview.mp3'),
        'notify': new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'),
        'whistle': new Audio('https://assets.mixkit.co/active_storage/sfx/2180/2180-preview.mp3')
    },

    init() {
        Object.values(this.sounds).forEach(audio => {
            audio.load();
            audio.volume = 0.4;
        });
        console.log("Sound System: Ready");
    },

    play(key) {
        const audio = this.sounds[key];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => {
                // Ignore autoplay policies before user interaction
            });
        }
    }
};
