/*
 * Project: NOUB SPORTS ECOSYSTEM
 * Filename: js/utils/avatarEngine.js
 * Version: 10.0.0 (NECK & SHOULDER CORRECTION)
 * Status: Production Ready
 */

const AVATAR_CONFIG = {
    FIXED_SKIN: '#e0ac69', 

    LOGOS: [
        null,                  // 01. None
        'fa-shield-halved',    // 02. Classic Crest
        'fa-star',             // 03. Star
        'fa-bolt',             // 04. Bolt
        'fa-fire',             // 05. Fire
        'fa-crown',            // 06. Crown
        'fa-skull',            // 07. Skull
        'fa-gem',              // 08. Gem
        'fa-dragon',           // 09. Dragon
        'fa-anchor',           // 10. Anchor
        'fa-feather-pointed',  // 11. Feather
        'fa-paw',              // 12. Paw
        'fa-award',            // 13. Award
        'fa-certificate',      // 14. Seal
        'fa-yin-yang',         // 15. Balance
        'fa-peace',            // 16. Peace
        'fa-heart-crack',      // 17. Broken Heart
        'fa-diamond',          // 18. Suit Diamond
        'fa-chess-knight',     // 19. Knight
        'fa-rocket',           // 20. Rocket
        'fa-jet-fighter',      // 21. Jet
        'fa-ghost',            // 22. Ghost
        'fa-robot',            // 23. Robot
        'fa-tree',             // 24. Tree
        'fa-water',            // 25. Wave
        'fa-wind'              // 26. Wind
    ],
    
    FACE_GEAR: [
        null,                  // 01. Clean
        'fa-glasses',          // 02. Glasses
        'fa-mask',             // 03. Mask
        'fa-infinity',         // 10. Cyclops
    ],

    HEAD_GEAR: [
        null,                  // 01. Shaved
        'fa-hat-cowboy',       // 02. Cowboy
        'fa-graduation-cap',   // 04. Cap
        'fa-helmet-safety',    // 05. Helmet
        'fa-crown',            // 06. Crown
    ],

    KITS: [
        '#3b82f6', // Blue
        '#ef4444', // Red
        '#10b981', // Green
        '#f59e0b', // Orange
        '#ffffff', // White
        '#111111', // Black
        '#8b5cf6', // Purple
        '#D4AF37', // Gold
        '#ec4899', // Pink
        '#6366f1', // Indigo
        '#14b8a6', // Teal
        '#7f1d1d', // Dark Red
        '#1e3a8a'  // Dark Blue
    ]
};

export class AvatarEngine {
    constructor() {
        this.state = { kit: '#3b82f6', logo: 1, face: 1, hair: 1 };
    }

    static generateAvatarHTML(visualDna, shirtName) {
        const dna = (typeof visualDna === 'string') ? JSON.parse(visualDna) : (visualDna || {});
        
        const kitColor = dna.kit || '#3b82f6'; 
        const logoIcon = AVATAR_CONFIG.LOGOS[(dna.logo || 1) - 1];
        const faceIcon = AVATAR_CONFIG.FACE_GEAR[(dna.face || 1) - 1];
        const headIcon = AVATAR_CONFIG.HEAD_GEAR[(dna.hair || 1) - 1];
        const skinColor = AVATAR_CONFIG.FIXED_SKIN;
        const displayName = (shirtName || 'NOUB').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return `
            <div class="avatar-comp" style="
                position: relative; 
                width: 100%; 
                height: 100%; 
                display: flex; 
                justify-content: center; 
                align-items: flex-end; 
                overflow: hidden;
                transform: scale(0.9);
                transform-origin: bottom center;
            ">
                <!-- 1. BODY (LAYER 1 - BACK) -->
                <i class="fa-solid fa-user" style="
                    font-size: 105px; 
                    color: ${skinColor}; 
                    position: absolute; 
                    bottom: 70px; 
                    z-index: 1; 
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));
                "></i>

                <!-- 2. SHIRT (LAYER 2 - FRONT) -->
                <i class="fa-solid fa-shirt" style="
                    font-size: 155px; 
                    color: ${kitColor}; 
                    position: absolute; 
                    bottom: -80px; 
                    z-index: 2; 
                    transform: scaleY(1.25);
                    transform-origin: bottom center;
                    filter: drop-shadow(0 -4px 12px rgba(0,0,0,0.5));
                "></i>

                <!-- 3. FACE ACCESSORY (LAYER 3) -->
                ${faceIcon ? `
                <i class="fa-solid ${faceIcon}" style="
                    font-size: 38px; 
                    color: #222; 
                    position: absolute;
                    bottom: 130px; 
                    z-index: 3; 
                    opacity: 0.98;
                "></i>
                ` : ''}

                <!-- 4. LOGO (LAYER 4) -->
                ${logoIcon ? `
                <div style="
                    position: absolute; 
                    bottom: 50px; 
                    left: 50%; 
                    margin-left: 24px; 
                    z-index: 4; 
                    width: 22px; 
                    height: 22px; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.6));
                ">
                    <i class="fa-solid ${logoIcon}" style="
                        font-size: 20px; 
                        color: rgba(255,255,255,0.95);
                    "></i>
                </div>` : ''}

                <!-- 5. NAME (LAYER 5) -->
                <div class="shirt-text" style="
                    position: absolute; 
                    bottom: 10px; 
                    z-index: 5; 
                    color: rgba(255,255,255,0.9); 
                    font-family: 'Orbitron', sans-serif; 
                    font-size: 11px; 
                    font-weight: 900;
                    text-transform: uppercase;
                    text-shadow: 0 1px 3px #000;
                    pointer-events: none;
                ">
                    ${displayName}
                </div>

                <!-- 6. HEADGEAR (LAYER 6 - TOP) -->
                ${headIcon ? `
                <i class="fa-solid ${headIcon}" style="
                    font-size: 65px; 
                    color: #fff;
                    text-shadow: 0 4px 8px rgba(0,0,0,0.5); 
                    position: absolute;
                    bottom: 160px; 
                    z-index: 6; 
                "></i>
                ` : ''}
            </div>
        `;
    }
    
    static getConfig() {
        return AVATAR_CONFIG;
    }
}
