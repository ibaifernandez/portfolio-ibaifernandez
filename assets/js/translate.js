// Función para cargar las traducciones
function loadTranslations(language, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var translations = JSON.parse(xhr.responseText);
                callback(null, translations);
            } else {
                callback('Error loading translations: ' + xhr.status, null);
            }
        }
    };
    xhr.open('GET', language + '.json', true);
    xhr.send();
}

function resolveInitialLanguage() {
    var fallback = 'en';
    try {
        var urlLanguage = new URLSearchParams(window.location.search).get('lang');
        if (urlLanguage === 'en' || urlLanguage === 'es') {
            return urlLanguage;
        }
    } catch (error) {
        // Ignore malformed URLSearchParams support issues.
    }
    try {
        var stored = window.localStorage.getItem('portfolio_language');
        if (stored === 'en' || stored === 'es') {
            return stored;
        }
    } catch (error) {
        // localStorage may be unavailable in strict privacy modes.
    }
    return fallback;
}

// Función para traducir los elementos con el atributo 'translate'
function translateElements(translations) {
    var elements = document.querySelectorAll('[translate]');
    elements.forEach(function(element) {
        var key = element.getAttribute('translate');
        if (translations[key]) {
            element.innerText = translations[key];
        }
    });
}

// Función para cambiar el ícono del botón de acuerdo al idioma actual
function toggleLanguageButton() {
    var buttonIcon = document.getElementById('translate-button-icon');
    if (!buttonIcon) {
        return;
    }
    var isEnglish = currentLanguage === 'en';
    var iconPath = isEnglish ? 'assets/images/spain.svg' : 'assets/images/english.svg';
    var nextLanguageLabel = isEnglish ? 'Switch to Spanish' : 'Switch to English';
    buttonIcon.setAttribute('src', iconPath);
    buttonIcon.setAttribute('alt', nextLanguageLabel);
    buttonIcon.setAttribute('aria-label', nextLanguageLabel);
}

function trackLanguageChange(previousLanguage, nextLanguage, source) {
    if (previousLanguage === nextLanguage) {
        return;
    }
    if (typeof window.gtag !== 'function') {
        return;
    }
    window.gtag('event', 'language_change', {
        source: source || 'unknown',
        from_language: previousLanguage,
        to_language: nextLanguage,
        page_path: window.location.pathname,
        page_location: window.location.href,
        page_title: document.title
    });
}

function applyLanguage(language, source) {
    loadTranslations(language, function(error, translations) {
        if (error) {
            console.error(error);
            return;
        }
        var previousLanguage = currentLanguage;
        currentLanguage = language;
        try {
            window.localStorage.setItem('portfolio_language', currentLanguage);
        } catch (error) {
            // localStorage is optional.
        }
        document.documentElement.setAttribute('lang', currentLanguage);
        translateElements(translations);
        toggleLanguageButton();
        trackLanguageChange(previousLanguage, currentLanguage, source);
    });
}

// Función para cambiar entre idiomas y traducir los elementos
function translate(language) {
    var targetLanguage = language || (currentLanguage === 'en' ? 'es' : 'en');
    applyLanguage(targetLanguage, 'toggle_button');
}

var buttonIcon = document.getElementById('translate-button-icon');
if (buttonIcon) {
    buttonIcon.setAttribute('role', 'button');
    buttonIcon.setAttribute('tabindex', '0');
    buttonIcon.addEventListener('click', function() {
        translate();
    });
    buttonIcon.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            translate();
        }
    });
}

var currentLanguage = resolveInitialLanguage();
applyLanguage(currentLanguage, 'initial_render');
