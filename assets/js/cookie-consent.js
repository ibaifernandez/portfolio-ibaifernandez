// Cookie consent — GDPR / Chile Ley 21.719 compliant.
// Default: analytics denied until explicit opt-in.
// Decision persisted in localStorage as 'portfolio_consent' = 'granted' | 'declined'.
(function () {
	'use strict';

	var STORAGE_KEY = 'portfolio_consent';
	var banner = document.getElementById('cookie-consent-banner');
	if (!banner) return;

	function storedConsent() {
		try {
			return window.localStorage.getItem(STORAGE_KEY);
		} catch (err) {
			return null;
		}
	}

	function persistConsent(value) {
		try {
			window.localStorage.setItem(STORAGE_KEY, value);
		} catch (err) {
			// localStorage may be blocked in strict privacy modes.
		}
	}

	function applyConsent(decision) {
		if (typeof window.gtag !== 'function') return;
		if (decision === 'granted') {
			window.gtag('consent', 'update', {
				analytics_storage: 'granted',
				ad_storage: 'denied',
				ad_user_data: 'denied',
				ad_personalization: 'denied'
			});
		} else {
			window.gtag('consent', 'update', {
				analytics_storage: 'denied',
				ad_storage: 'denied',
				ad_user_data: 'denied',
				ad_personalization: 'denied'
			});
		}
	}

	function hideBanner() {
		banner.setAttribute('hidden', '');
		banner.classList.remove('is-visible');
	}

	function showBanner() {
		banner.removeAttribute('hidden');
		// Allow CSS transition.
		window.requestAnimationFrame(function () {
			banner.classList.add('is-visible');
		});
	}

	var current = storedConsent();
	if (current === 'granted' || current === 'declined') {
		applyConsent(current);
		// Banner not shown — decision already made.
		return;
	}

	// No decision yet — show banner.
	showBanner();

	var acceptBtn = document.getElementById('cookie-consent-accept');
	var declineBtn = document.getElementById('cookie-consent-decline');

	if (acceptBtn) {
		acceptBtn.addEventListener('click', function () {
			persistConsent('granted');
			applyConsent('granted');
			hideBanner();
		});
	}
	if (declineBtn) {
		declineBtn.addEventListener('click', function () {
			persistConsent('declined');
			applyConsent('declined');
			hideBanner();
		});
	}
})();
