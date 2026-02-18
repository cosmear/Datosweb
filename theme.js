// theme.js - Handles centralized settings and theme application

const defaultSettings = {
    accentColor: '#3b82f6', // Blue
    refreshRate: 0, // 0 = off, value in seconds
    simulateData: false
};

// Colors map for Tailwind classes or manipulation
const accentColors = {
    'blue': { hex: '#3b82f6', tailwind: 'blue-500' },
    'purple': { hex: '#a855f7', tailwind: 'purple-500' },
    'emerald': { hex: '#10b981', tailwind: 'emerald-500' },
    'orange': { hex: '#f97316', tailwind: 'orange-500' }
};

function loadSettings() {
    const stored = localStorage.getItem('dashboardSettings');
    return stored ? JSON.parse(stored) : defaultSettings;
}

function saveSettings(settings) {
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    applyTheme(settings);
}

function applyTheme(settings) {
    // Dynamic CSS variables approach for accent colors
    const root = document.documentElement;
    root.style.setProperty('--accent-color', settings.accentColor);
    
    // We can also inject a style tag to override Tailwind utilities if needed for specific classes
    // But for now, we rely on js manipulation or CSS vars in style tag
}

// Apply on load
const currentSettings = loadSettings();
applyTheme(currentSettings);

// Export for other scripts
window.DashboardTheme = {
    settings: currentSettings,
    save: saveSettings,
    colors: accentColors
};
