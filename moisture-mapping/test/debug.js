// Debug logging utility
window.debugLog = function(...args) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}]`, ...args);
};

// Initialize debug mode
document.addEventListener('DOMContentLoaded', () => {
    debugLog('Debug mode initialized');
});
