/*
 * Filename: js/utils/validators.js
 * Description: Helper functions to validate user input.
 */

export const Validators = {
    isValidName: (name) => {
        return name && name.trim().length >= 3 && name.trim().length <= 20;
    },
    isValidPosition: (pos) => {
        return ['FWD', 'MID', 'DEF', 'GK', 'FAN'].includes(pos);
    }
};
