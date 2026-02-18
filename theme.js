(function() {
    // Default Settings
    const defaultSettings = {
        accentColor: '#3b82f6', // Blue-500
        refreshRate: 0, // Disabled
        simulateData: false,
        fontSize: 'text-base',
        currency: 'USD',
        decimals: 2
    };

    // Load Settings
    const loadSettings = () => {
        try {
            const saved = localStorage.getItem('dashboardSettings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (e) {
            console.error('Error loading settings, resetting to defaults:', e);
            localStorage.removeItem('dashboardSettings');
            return defaultSettings;
        }
    };

    // Save Settings
    const saveSettings = (newSettings) => {
        localStorage.setItem('dashboardSettings', JSON.stringify(newSettings));
        DashboardTheme.settings = newSettings;
        applyTheme(); // Apply immediately
    };

    // Apply Global Theme Styles (CSS Variables & Body Classes)
    const applyTheme = () => {
        const settings = DashboardTheme.settings;
        document.documentElement.style.setProperty('--accent-color', settings.accentColor);
        
        // Font Size Application - remove all first to be safe
        document.body.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
        document.body.classList.add(settings.fontSize);
        
        // Force text redraw in case of browser optimization laziness
        document.body.style.display = 'none';
        document.body.offsetHeight; // trigger reflow
        document.body.style.display = '';

        console.log('Theme Applied:', settings);
    };

    // Init
    const settings = loadSettings();
    const DashboardTheme = {
        settings,
        saveSettings,
        applyTheme
    };

    // Expose valid accents for reference
    DashboardTheme.accents = {
        blue: '#3b82f6',
        purple: '#a855f7',
        emerald: '#10b981',
        orange: '#f97316'
    };

    window.DashboardTheme = DashboardTheme;
    
    // Apply on load
    document.addEventListener('DOMContentLoaded', applyTheme);

    // Initialize Settings Page inputs if we are on settings page
    document.addEventListener('DOMContentLoaded', () => {
        if(document.getElementById('accent-color')) {
            // Accent Color
            const accentSelect = document.getElementById('accent-color');
            accentSelect.value = settings.accentColor;
            accentSelect.addEventListener('change', (e) => {
                const newSettings = { ...DashboardTheme.settings, accentColor: e.target.value };
                saveSettings(newSettings);
            });

            // Refresh Rate
            const refreshInput = document.getElementById('refresh-rate');
            if(refreshInput) {
                refreshInput.value = settings.refreshRate;
                refreshInput.addEventListener('change', (e) => {
                    const newSettings = { ...DashboardTheme.settings, refreshRate: parseInt(e.target.value) };
                    saveSettings(newSettings);
                });
            }

            // Simulation
            const simToggle = document.getElementById('simulation-toggle');
            if(simToggle) {
                simToggle.checked = settings.simulateData;
                simToggle.addEventListener('change', (e) => {
                    const newSettings = { ...DashboardTheme.settings, simulateData: e.target.checked };
                    saveSettings(newSettings);
                });
            }

            // Formatting: Font Size
            const fontSelect = document.getElementById('font-size');
            if(fontSelect) {
                fontSelect.value = settings.fontSize;
                fontSelect.addEventListener('change', (e) => {
                    const newSettings = { ...DashboardTheme.settings, fontSize: e.target.value };
                    saveSettings(newSettings);
                });
            }

            // Formatting: Currency
            const currencySelect = document.getElementById('currency-select');
            if(currencySelect) {
                currencySelect.value = settings.currency;
                currencySelect.addEventListener('change', (e) => {
                    const newSettings = { ...DashboardTheme.settings, currency: e.target.value };
                    saveSettings(newSettings);
                });
            }

             // Formatting: Decimals
             const decimalsSelect = document.getElementById('decimals-select');
             if(decimalsSelect) {
                 decimalsSelect.value = settings.decimals;
                 decimalsSelect.addEventListener('change', (e) => {
                     const newSettings = { ...DashboardTheme.settings, decimals: parseInt(e.target.value) };
                     saveSettings(newSettings);
                 });
             }
        }
    });

})();
