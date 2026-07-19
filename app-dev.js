// ==========================================================================
// CONFIG: BAZOWY BEKAP WIZUALU (USTAWIENIA FABRYCZNE / PUNKT ZERO)
// ==========================================================================
const FACTORY_DEFAULTS = {
    '--bg-page': '#f6f5f7',
    '--bg-card': '#ffffff',
    '--color-accent': '#b05c75',
    '--border-radius-base': '16px',
    '--shadow-intensity': '4', // mapowane na 0.04 opacity
    '--shadow-blur': '20px'
};

document.addEventListener("DOMContentLoaded", () => {
    initThemeBuilder();
});

function initThemeBuilder() {
    const root = document.documentElement;

    // Pobieramy elementy sterujące z DOM
    const ctrlBgPage = document.getElementById('ctrl-bg-page');
    const ctrlBgCard = document.getElementById('ctrl-bg-card');
    const ctrlColorAccent = document.getElementById('ctrl-color-accent');
    const ctrlRadius = document.getElementById('ctrl-radius');
    const ctrlShadowIntensity = document.getElementById('ctrl-shadow-intensity');
    const ctrlShadowBlur = document.getElementById('ctrl-shadow-blur');
    
    const btnSave = document.getElementById('btn-save-style');
    const btnReset = document.getElementById('btn-hard-reset');

    // Вczytywanie zapisanych ustawień z LocalStorage (jeśli istnieją)
    loadSavedTheme();

    // ==========================================================================
    // REAKCJA NA ZMIANY W CZASIE RZECZYWISTYM (LIVE UPDATE)
    // ==========================================================================
    
    // Kolory
    ctrlBgPage.addEventListener('input', (e) => {
        root.style.setProperty('--bg-page', e.target.value);
    });
    
    ctrlBgCard.addEventListener('input', (e) => {
        root.style.setProperty('--bg-card', e.target.value);
    });
    
    ctrlColorAccent.addEventListener('input', (e) => {
        root.style.setProperty('--color-accent', e.target.value);
    });

    // Kształty (Promień zaokrąglenia)
    ctrlRadius.addEventListener('input', (e) => {
        root.style.setProperty('--border-radius-base', `${e.target.value}px`);
    });

    // Efekt 3D (Tonie)
    ctrlShadowIntensity.addEventListener('input', (e) => {
        const opacity = e.target.value / 100;
        root.style.setProperty('--shadow-opacity', opacity);
    });

    ctrlShadowBlur.addEventListener('input', (e) => {
        root.style.setProperty('--shadow-blur', `${e.target.value}px`);
    });

    // ==========================================================================
    // AKCJE SYSTEMOWE: ZAPIS I HARD RESET
    // ==========================================================================
    
    // Zapisywanie motywu
    btnSave.addEventListener('click', () => {
        const themeToSave = {
            '--bg-page': root.style.getPropertyValue('--bg-page') || FACTORY_DEFAULTS['--bg-page'],
            '--bg-card': root.style.getPropertyValue('--bg-card') || FACTORY_DEFAULTS['--bg-card'],
            '--color-accent': root.style.getPropertyValue('--color-accent') || FACTORY_DEFAULTS['--color-accent'],
            '--border-radius-base': root.style.getPropertyValue('--border-radius-base') || FACTORY_DEFAULTS['--border-radius-base'],
            '--shadow-opacity': root.style.getPropertyValue('--shadow-opacity') || (FACTORY_DEFAULTS['--shadow-intensity'] / 100),
            '--shadow-blur': root.style.getPropertyValue('--shadow-blur') || FACTORY_DEFAULTS['--shadow-blur']
        };
        
        localStorage.setItem('premium_crm_theme', JSON.stringify(themeToSave));
        alert('🎨 Nowy design został trwale zapisany w LocalStorage Twojej przeglądarki!');
    });

    // Funkcja Hard Reset (Powrót do kodu źródłowego)
    btnReset.addEventListener('click', () => {
        if (confirm('💥 Czy na pewno chcesz wyczyścić wszystkie eksperymenty wizualne i powrócić do fabrycznego designu Premium Soft-Business?')) {
            localStorage.removeItem('premium_crm_theme');
            
            // Przywracanie wartości w stylach dokumentu
            root.style.setProperty('--bg-page', FACTORY_DEFAULTS['--bg-page']);
            root.style.setProperty('--bg-card', FACTORY_DEFAULTS['--bg-card']);
            root.style.setProperty('--color-accent', FACTORY_DEFAULTS['--color-accent']);
            root.style.setProperty('--border-radius-base', FACTORY_DEFAULTS['--border-radius-base']);
            root.style.setProperty('--shadow-opacity', FACTORY_DEFAULTS['--shadow-intensity'] / 100);
            root.style.setProperty('--shadow-blur', FACTORY_DEFAULTS['--shadow-blur']);

            // Resetowanie pozycji kontrolek w edytorze HTML
            ctrlBgPage.value = FACTORY_DEFAULTS['--bg-page'];
            ctrlBgCard.value = FACTORY_DEFAULTS['--bg-card'];
            ctrlColorAccent.value = FACTORY_DEFAULTS['--color-accent'];
            ctrlRadius.value = parseInt(FACTORY_DEFAULTS['--border-radius-base']);
            ctrlShadowIntensity.value = FACTORY_DEFAULTS['--shadow-intensity'];
            ctrlShadowBlur.value = parseInt(FACTORY_DEFAULTS['--shadow-blur']);

            alert('🔄 Przywrócono stan fabrycznego bekapu z kodu źródłowego CRM.');
        }
    });

    // Funkcja pomocnicza do ładowania zapisanego motywu przy starcie
    function loadSavedTheme() {
        const savedTheme = localStorage.getItem('premium_crm_theme');
        if (savedTheme) {
            const theme = JSON.parse(savedTheme);
            Object.keys(theme).forEach(key => {
                root.style.setProperty(key, theme[key]);
            });

            // Synchronizacja pozycji kontrolek suwaków pod wczytane dane
            if(theme['--bg-page']) ctrlBgPage.value = theme['--bg-page'].trim();
            if(theme['--bg-card']) ctrlBgCard.value = theme['--bg-card'].trim();
            if(theme['--color-accent']) ctrlColorAccent.value = theme['--color-accent'].trim();
            if(theme['--border-radius-base']) ctrlRadius.value = parseInt(theme['--border-radius-base']);
            if(theme['--shadow-opacity']) ctrlShadowIntensity.value = parseFloat(theme['--shadow-opacity']) * 100;
            if(theme['--shadow-blur']) ctrlShadowBlur.value = parseInt(theme['--shadow-blur']);
        }
    }
}
