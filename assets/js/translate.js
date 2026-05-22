function buildTranslationUrl(language) {
    var url = new URL(language + '.json', window.location.href);
    // Bust local/dev caches so ?lang=es remains reliable after rebuilds.
    url.searchParams.set('v', '2026-03-16');
    return url.toString();
}

// Función para cargar las traducciones
function loadTranslations(language, callback) {
    var requestUrl = buildTranslationUrl(language);

    if (typeof window.fetch === 'function') {
        window.fetch(requestUrl, { cache: 'no-store' })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Error loading translations: ' + response.status);
                }
                return response.json();
            })
            .then(function(translations) {
                callback(null, translations);
            })
            .catch(function(error) {
                callback(error.message, null);
            });
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var translations = JSON.parse(xhr.responseText);
                    callback(null, translations);
                } catch (error) {
                    callback('Error parsing translations: ' + error.message, null);
                }
            } else {
                callback('Error loading translations: ' + xhr.status, null);
            }
        }
    };
    xhr.open('GET', requestUrl, true);
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
    // Respect browser language preference as final fallback.
    try {
        var nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
        if (nav.indexOf('es') === 0) return 'es';
    } catch (error) {
        // ignore
    }
    return fallback;
}

// Página: <title>, <meta name="description">, OG/Twitter meta switch with language.
function translatePageMeta(translations) {
    var titleKey = 'page-title';
    var descriptionKey = 'page-description';
    if (Object.prototype.hasOwnProperty.call(translations, titleKey)) {
        document.title = translations[titleKey];
        var ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', translations[titleKey]);
        var twTitle = document.querySelector('meta[property="twitter:title"]');
        if (twTitle) twTitle.setAttribute('content', translations[titleKey]);
    }
    if (Object.prototype.hasOwnProperty.call(translations, descriptionKey)) {
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', translations[descriptionKey]);
        var ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', translations[descriptionKey]);
        var twDesc = document.querySelector('meta[property="twitter:description"]');
        if (twDesc) twDesc.setAttribute('content', translations[descriptionKey]);
    }
}

// Función para traducir los elementos con el atributo 'translate'
function translateElements(translations) {
    translatePageMeta(translations);

    var htmlElements = document.querySelectorAll('[translate-html]');
    htmlElements.forEach(function(element) {
        var htmlKey = element.getAttribute('translate-html');
        if (Object.prototype.hasOwnProperty.call(translations, htmlKey)) {
            element.innerHTML = translations[htmlKey];
        }
    });

    var textElements = document.querySelectorAll('[translate]');
    textElements.forEach(function(element) {
        var textKey = element.getAttribute('translate');
        if (Object.prototype.hasOwnProperty.call(translations, textKey)) {
            element.innerText = translations[textKey];
        }
    });

    // Targeted attribute selectors (instead of querySelectorAll('*')) — same
    // result, ~50× cheaper on a large DOM.
    var attrTargeted = document.querySelectorAll(
        '[translate-aria-label],[translate-alt],[translate-placeholder],[translate-content],[translate-title],[translate-href]'
    );
    attrTargeted.forEach(function(element) {
        Array.prototype.forEach.call(element.attributes, function(attribute) {
            if (attribute.name.indexOf('translate-') !== 0 || attribute.name === 'translate-html') {
                return;
            }
            var targetAttribute = attribute.name.slice('translate-'.length);
            var attributeKey = attribute.value;
            if (Object.prototype.hasOwnProperty.call(translations, attributeKey)) {
                element.setAttribute(targetAttribute, translations[attributeKey]);
            }
        });
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
        try {
            document.dispatchEvent(new CustomEvent('portfolio:language-applied', {
                detail: {
                    language: currentLanguage,
                    source: source || 'unknown'
                }
            }));
        } catch (error) {
            // CustomEvent support is optional.
        }
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
