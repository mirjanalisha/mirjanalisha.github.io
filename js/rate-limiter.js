/**
 * Rate Limiter Utility
 * Persists submission timestamps in localStorage
 */
(function() {
    'use strict';

    const RateLimiter = {
        /**
         * Get remaining cooldown time in seconds
         * @param {string} key - Unique key for the action (e.g. 'contact', 'faq')
         * @returns {number} - Seconds remaining
         */
        getRemainingTime(key) {
            const lastSubmission = localStorage.getItem(`rl_${key}`);
            if (!lastSubmission) return 0;

            const duration = parseInt(localStorage.getItem(`rl_${key}_dur`)) || 0;
            const now = Date.now();
            const elapsed = (now - parseInt(lastSubmission)) / 1000;
            
            return Math.max(0, Math.ceil(duration - elapsed));
        },

        /**
         * Check if action is on cooldown
         * @param {string} key 
         * @returns {boolean}
         */
        isOnCooldown(key) {
            return this.getRemainingTime(key) > 0;
        },

        /**
         * Set a new cooldown
         * @param {string} key 
         * @param {number} durationSeconds 
         */
        setCooldown(key, durationSeconds) {
            localStorage.setItem(`rl_${key}`, Date.now().toString());
            localStorage.setItem(`rl_${key}_dur`, durationSeconds.toString());
        },

        /**
         * Helper to format seconds into readable string (Mm Ss)
         * @param {number} seconds 
         * @returns {string}
         */
        formatTime(seconds) {
            if (seconds < 60) return `${seconds} seconds`;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}m ${secs}s`;
        }
    };

    // Expose globally
    window.RateLimiter = RateLimiter;
})();
