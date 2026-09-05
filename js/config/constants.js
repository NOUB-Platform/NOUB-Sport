/*
 * Filename: js/config/constants.js
 * Version: 2.0.0
 * Description: Stores immutable game constants, ENUMS, and configuration limits.
 */

export const GAME_CONFIG = {
    APP_VERSION: '2.0.0',
    ANIMATION_SPEED: 300, // ms
    
    // Limits for Avatar Generation
    AVATAR_LIMITS: {
        SKIN: 3,
        KIT: 3,
        HAIR: 5
    },

    // Activity Types
    ACTIVITY_TYPES: {
        YOUTH_CENTER: 'YOUTH_CENTER', // مركز شباب
        CLUB_MEMBER: 'CLUB_MEMBER',   // عضو نادي
        ACADEMY: 'ACADEMY',           // أكاديمية / حر
        PRO: 'PRO',                   // نادي كبير
        FAN: 'FAN',                   // مشجع
        INACTIVE: 'INACTIVE'          // متوقف
    },

    // Positions
    POSITIONS: {
        FWD: 'FWD',
        MID: 'MID',
        DEF: 'DEF',
        GK: 'GK'
    },

    // Zones
    ZONES: {
        1: 'الفسطاط ومصر القديمة',
        2: 'المعادي وطرة',
        3: 'حلوان والتبين',
        4: 'القاهرة الكبرى'
    }
};
