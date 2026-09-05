/*
 * Filename: js/utils/visualEffects.js
 * Description: Handles visual animations.
 */

export const VisualEffects = {
    triggerConfetti: () => {
        console.log("Confetti Triggered");
    },
    shakeElement: (elementId) => {
        const el = document.getElementById(elementId);
        if (el) {
            el.classList.add('shake-anim');
            setTimeout(() => el.classList.remove('shake-anim'), 500);
        }
    }
};
