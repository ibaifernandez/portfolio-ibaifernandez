(function () {
	'use strict';

	function updateLanguageToggleLabel() {
		var button = document.getElementById('cv-language-toggle');
		if (!button) {
			return;
		}
		var current = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
		button.textContent = current === 'en' ? 'ES' : 'EN';
	}

	function bindActions() {
		var printButton = document.getElementById('cv-print-trigger');
		var languageButton = document.getElementById('cv-language-toggle');

		if (printButton) {
			printButton.addEventListener('click', function () {
				window.print();
			});
		}

		if (languageButton) {
			languageButton.addEventListener('click', function () {
				if (typeof window.translate === 'function') {
					window.translate();
					window.setTimeout(updateLanguageToggleLabel, 300);
				}
			});
		}

		updateLanguageToggleLabel();
	}

	window.addEventListener('load', function () {
		bindActions();
		if (window.location.hash === '#print') {
			window.setTimeout(function () {
				window.print();
			}, 450);
		}
	});
})();
