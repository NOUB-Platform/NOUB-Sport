/*
 * Filename: js/utils/helpers.js
 * Description: General formatting utilities.
 */

export const Helpers = {
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US').format(amount || 0);
    },
    formatDate: (dateObj) => {
        if (!dateObj) return '';
        const d = (dateObj instanceof Date) ? dateObj : new Date(dateObj);
        return d.toLocaleDateString('ar-EG');
    }
};
