/*--------------------- Copyright (c) 2019 -----------------------
[Master Javascript]

Project: Portfolio Responsive HTML Template
Version: 1.0.6
Assigned to: ThemeForest
------------------------------------------------------------------


------------------------------------------------------------------*/

// Minimal client-side error visibility (A-OPS-04). No external beacon — surfaces
// runtime JS errors in the console for support/debugging without adding a
// third-party error tracker or a new CSP connect-src origin.
(function () {
	if (typeof window === 'undefined') return;
	window.addEventListener('error', function (event) {
		if (event && event.message) {
			console.error('[client-error]', event.message, (event.filename || '') + ':' + (event.lineno || 0));
		}
	});
	window.addEventListener('unhandledrejection', function (event) {
		console.error('[client-error] unhandled promise rejection:', event && event.reason);
	});
})();

(function ($) {
	"use strict";
	var portfolio = {
		initialised: false,
		version: 1.0,
		mobile: false,
		reduceMotion: false,
		scriptLoaders: {},
		stylesheetLoaders: {},
		youtubeApiPromise: null,
		init: function () {

			if(!this.initialised) {
				this.initialised = true;
			} else {
				return;
			}
			this.reduceMotion = !!(
				window.matchMedia &&
				window.matchMedia('(prefers-reduced-motion: reduce)').matches
			);

			/*-------------- CV Portfolio Functions Calling ---------------------------------------------------
			------------------------------------------------------------------------------------------------*/
			this.open_menu();
			this.enhance_accessibility();
			this.bind_analytics_events();
			this.custom_scrollbar();
			this.rightbtn_onload();
			this.rightside_onload();
			this.bannerleft_onload();
				this.banner_typingtext();
				this.typed_js();
				this.about_opendetails();
				this.training_arrows();
				this.circle_progressbar();
				this.testimonial_slider();
			this.popup_video();			
			this.responsor_slider();			
			this.world_map();
			this.contact_form();
			this.goto_top();
			this.page_scroll();
			this.window_scroll();
			this.scroll_contact();
			this.read_more();
			
		},

		load_script: function(src) {
			var _this = this;
			if(_this.scriptLoaders[src]){
				return _this.scriptLoaders[src];
			}
			_this.scriptLoaders[src] = new Promise(function(resolve, reject) {
				var existing = document.querySelector('script[src="' + src + '"]');
				if(existing){
					if(existing.dataset.loaded === 'true'){
						resolve();
						return;
					}
					existing.addEventListener('load', function() {
						existing.dataset.loaded = 'true';
						resolve();
					}, { once: true });
					existing.addEventListener('error', function() {
						reject(new Error('Failed to load script: ' + src));
					}, { once: true });
					return;
				}
				var script = document.createElement('script');
				script.src = src;
				script.defer = true;
				script.dataset.loaded = 'false';
				script.addEventListener('load', function() {
					script.dataset.loaded = 'true';
					resolve();
				}, { once: true });
				script.addEventListener('error', function() {
					reject(new Error('Failed to load script: ' + src));
				}, { once: true });
				document.head.appendChild(script);
			}).catch(function(error) {
				delete _this.scriptLoaders[src];
				throw error;
			});
			return _this.scriptLoaders[src];
		},

		load_style: function(href) {
			var _this = this;
			if(_this.stylesheetLoaders[href]){
				return _this.stylesheetLoaders[href];
			}
			_this.stylesheetLoaders[href] = new Promise(function(resolve, reject) {
				var existing = document.querySelector('link[href="' + href + '"]');
				if(existing){
					if(existing.dataset.loaded === 'true' || existing.sheet){
						existing.dataset.loaded = 'true';
						resolve();
						return;
					}
					existing.addEventListener('load', function() {
						existing.dataset.loaded = 'true';
						resolve();
					}, { once: true });
					existing.addEventListener('error', function() {
						reject(new Error('Failed to load stylesheet: ' + href));
					}, { once: true });
					return;
				}
				var link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = href;
				link.dataset.loaded = 'false';
				link.addEventListener('load', function() {
					link.dataset.loaded = 'true';
					resolve();
				}, { once: true });
				link.addEventListener('error', function() {
					reject(new Error('Failed to load stylesheet: ' + href));
				}, { once: true });
				document.head.appendChild(link);
			}).catch(function(error) {
				delete _this.stylesheetLoaders[href];
				throw error;
			});
			return _this.stylesheetLoaders[href];
		},

		when_in_view: function(element, callback, options) {
			var target = element && element.jquery ? element[0] : element;
			if(!target || typeof callback !== 'function'){
				return;
			}
			var opts = options || { rootMargin: '250px 0px' };
			if('IntersectionObserver' in window){
				var observer = new IntersectionObserver(function(entries, localObserver) {
					var shouldRun = entries.some(function(entry) {
						return entry.isIntersecting;
					});
					if(shouldRun){
						localObserver.disconnect();
						callback();
					}
				}, opts);
				observer.observe(target);
				return;
			}
			callback();
		},

		track_event: function(eventName, eventParams) {
			var runtimeConfig = window.PORTFOLIO_RUNTIME || {};
			if(runtimeConfig.analytics && runtimeConfig.analytics.enabled === false){
				return;
			}
			if(typeof window.gtag !== 'function'){
				return;
			}
			var params = $.extend({
				page_path: window.location.pathname,
				page_location: window.location.href,
				page_title: document.title
			}, eventParams || {});
			try {
				window.gtag('event', eventName, params);
			} catch (error) {
				// Fail-safe: analytics must never block UX flows.
			}
		},

		load_youtube_api: function() {
			var _this = this;
			if(_this.youtubeApiPromise){
				return _this.youtubeApiPromise;
			}
			_this.youtubeApiPromise = new Promise(function(resolve, reject) {
				if(window.YT && typeof window.YT.Player === 'function'){
					resolve(window.YT);
					return;
				}
				var timeoutId = window.setTimeout(function() {
					reject(new Error('YouTube Iframe API load timeout'));
				}, 10000);
				var previousReady = window.onYouTubeIframeAPIReady;
				window.onYouTubeIframeAPIReady = function() {
					window.clearTimeout(timeoutId);
					if(typeof previousReady === 'function'){
						try {
							previousReady();
						} catch (error) {
							// Ignore external callback errors.
						}
					}
					if(window.YT && typeof window.YT.Player === 'function'){
						resolve(window.YT);
						return;
					}
					reject(new Error('YouTube API loaded without Player constructor'));
				};
				var scriptSrc = 'https://www.youtube.com/iframe_api';
				var existing = document.querySelector('script[src="' + scriptSrc + '"]');
				if(existing){
					return;
				}
				var script = document.createElement('script');
				script.src = scriptSrc;
				script.async = true;
				script.addEventListener('error', function() {
					window.clearTimeout(timeoutId);
					reject(new Error('Failed to load YouTube Iframe API'));
				}, { once: true });
				document.head.appendChild(script);
			}).catch(function(error) {
				_this.youtubeApiPromise = null;
				throw error;
			});
			return _this.youtubeApiPromise;
		},

		bind_analytics_events: function() {
			var _this = this;
			if($(document.body).data('portfolio-analytics-bound')){
				return;
			}
			$(document.body).data('portfolio-analytics-bound', true);

			var trackedSelectors = [
				'a.portfolio_btn',
				'.project_spotlight_cta',
				'.project_spotlight_media_link',
				'.project_case_navlink',
				'a.redirect_contact',
				'.port_navigation a.siderbar_menuicon'
			];

			$(document).on('click', trackedSelectors.join(','), function() {
				var element = $(this);
				var rawText = element.text() || element.attr('aria-label') || element.attr('title') || '';
				var normalizedText = rawText.replace(/\s+/g, ' ').trim();
				var section = 'global';
				if(element.closest('#about_sec').length > 0){
					section = 'about';
				}else if(element.closest('#training_sec').length > 0){
					section = 'training';
				}else if(element.closest('#project_sec').length > 0){
					section = 'projects';
				}else if(element.closest('#contact_sec, #scroll_contact').length > 0){
					section = 'contact';
				}
				_this.track_event('cta_click', {
					cta_text: normalizedText.slice(0, 120),
					cta_href: element.attr('href') || '',
					cta_section: section,
					cta_classes: (element.attr('class') || '').replace(/\s+/g, ' ').trim().slice(0, 120)
				});
			});

			$(document).on('click', '[data-track-event]', function() {
				var element = $(this);
				var eventName = (element.attr('data-track-event') || '').trim();
				if(!eventName){
					return;
				}
				var rawText = element.text() || element.attr('aria-label') || element.attr('title') || '';
				var normalizedText = rawText.replace(/\s+/g, ' ').trim();
				_this.track_event(eventName, {
					cta_text: normalizedText.slice(0, 120),
					cta_href: element.attr('href') || '',
					cta_section: element.attr('data-track-section') || 'global',
					cta_location: element.attr('data-track-location') || '',
					cta_target: element.attr('data-track-target') || '',
					cta_classes: (element.attr('class') || '').replace(/\s+/g, ' ').trim().slice(0, 120)
				});
				var secondaryEvent = (element.attr('data-track-event-secondary') || '').trim();
				if(secondaryEvent){
					_this.track_event(secondaryEvent, {
						cta_text: normalizedText.slice(0, 120),
						cta_href: element.attr('href') || '',
						cta_section: element.attr('data-track-section') || 'global',
						cta_location: element.attr('data-track-location') || '',
						cta_target: element.attr('data-track-target') || '',
						cta_classes: (element.attr('class') || '').replace(/\s+/g, ' ').trim().slice(0, 120)
					});
				}
			});

			if('IntersectionObserver' in window){
				var viewObserver = new IntersectionObserver(function(entries, observer) {
					entries.forEach(function(entry) {
						if(!entry.isIntersecting){
							return;
						}
						var target = entry.target;
						var eventName = (target.getAttribute('data-track-view') || '').trim();
						if(!eventName || target.getAttribute('data-track-view-fired') === 'true'){
							observer.unobserve(target);
							return;
						}
						target.setAttribute('data-track-view-fired', 'true');
						_this.track_event(eventName, {
							cta_section: target.getAttribute('data-track-section') || 'global',
							cta_location: target.getAttribute('data-track-location') || 'unknown',
							cta_target: target.getAttribute('data-track-target') || '',
							view_text: (target.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160)
						});
						observer.unobserve(target);
					});
				}, {
					threshold: 0.45
				});
				$('[data-track-view]').each(function() {
					viewObserver.observe(this);
				});
			}

			$('details[data-track-faq]').each(function() {
				var details = this;
				if(details.dataset.analyticsBound === 'true'){
					return;
				}
				details.dataset.analyticsBound = 'true';
				details.addEventListener('toggle', function() {
					if(!details.open){
						return;
					}
					_this.track_event('research_engine_faq_open', {
						cta_section: 'research-engine',
						cta_location: 'faq',
						cta_target: details.getAttribute('data-track-target') || '',
						faq_question: ((details.querySelector('summary') || {}).textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160)
					});
				});
			});

			if(document.body && document.body.classList.contains('researchengine_dossier_page')){
				var scrollEventsState = { milestone50: false, milestone90: false };
				var scrollTicking = false;
				var onScrollMilestones = function() {
					if(scrollTicking){
						return;
					}
					scrollTicking = true;
					window.requestAnimationFrame(function() {
						var doc = document.documentElement;
						var scrollable = Math.max(0, doc.scrollHeight - window.innerHeight);
						if(scrollable <= 0){
							scrollTicking = false;
							return;
						}
						var progress = ((window.pageYOffset || window.scrollY || 0) / scrollable) * 100;
						if(progress >= 50 && !scrollEventsState.milestone50){
							scrollEventsState.milestone50 = true;
							_this.track_event('research_engine_scroll_50', {
								cta_section: 'research-engine',
								cta_location: 'scroll',
								scroll_percent: 50
							});
						}
						if(progress >= 90 && !scrollEventsState.milestone90){
							scrollEventsState.milestone90 = true;
							_this.track_event('research_engine_scroll_90', {
								cta_section: 'research-engine',
								cta_location: 'scroll',
								scroll_percent: 90
							});
						}
						scrollTicking = false;
					});
				};
				window.addEventListener('scroll', onScrollMilestones, { passive: true });
				onScrollMilestones();

				var trackedVideo = document.querySelector('iframe[data-track-youtube]');
				if(trackedVideo){
					var videoId = trackedVideo.getAttribute('data-video-id') || '';
					var prefix = (trackedVideo.getAttribute('data-track-prefix') || 'research_engine_vsl').trim();
					if(!trackedVideo.id){
						trackedVideo.id = 'tracked-youtube-vsl';
					}
					_this.load_youtube_api()
						.then(function() {
							var state = {
								playTracked: false,
								q25Tracked: false,
								q50Tracked: false,
								q75Tracked: false,
								completeTracked: false,
								progressTimer: null
							};
							var stopTimer = function() {
								if(state.progressTimer){
									window.clearInterval(state.progressTimer);
									state.progressTimer = null;
								}
							};
							var trackProgress = function(player) {
								if(typeof player.getDuration !== 'function' || typeof player.getCurrentTime !== 'function'){
									return;
								}
								var duration = player.getDuration();
								if(!duration || duration <= 0){
									return;
								}
								var progress = (player.getCurrentTime() / duration) * 100;
								if(progress >= 25 && !state.q25Tracked){
									state.q25Tracked = true;
									_this.track_event(prefix + '_progress_25', {
										cta_section: 'research-engine',
										cta_location: 'vsl',
										cta_target: videoId,
										video_progress_percent: 25
									});
								}
								if(progress >= 50 && !state.q50Tracked){
									state.q50Tracked = true;
									_this.track_event(prefix + '_progress_50', {
										cta_section: 'research-engine',
										cta_location: 'vsl',
										cta_target: videoId,
										video_progress_percent: 50
									});
								}
								if(progress >= 75 && !state.q75Tracked){
									state.q75Tracked = true;
									_this.track_event(prefix + '_progress_75', {
										cta_section: 'research-engine',
										cta_location: 'vsl',
										cta_target: videoId,
										video_progress_percent: 75
									});
								}
							};
							new window.YT.Player(trackedVideo.id, {
								events: {
									onStateChange: function(event) {
										var YTRef = window.YT;
										if(!YTRef || !YTRef.PlayerState){
											return;
										}
										if(event.data === YTRef.PlayerState.PLAYING){
											if(!state.playTracked){
												state.playTracked = true;
												_this.track_event(prefix + '_play', {
													cta_section: 'research-engine',
													cta_location: 'vsl',
													cta_target: videoId
												});
											}
											stopTimer();
											state.progressTimer = window.setInterval(function() {
												trackProgress(event.target);
											}, 1000);
										} else if(event.data === YTRef.PlayerState.ENDED){
											trackProgress(event.target);
											if(!state.completeTracked){
												state.completeTracked = true;
												_this.track_event(prefix + '_complete', {
													cta_section: 'research-engine',
													cta_location: 'vsl',
													cta_target: videoId
												});
											}
											stopTimer();
										} else if(event.data === YTRef.PlayerState.PAUSED || event.data === YTRef.PlayerState.BUFFERING){
											stopTimer();
										}
									}
								}
							});
						})
						.catch(function() {
							// If YouTube API fails, keep page functional without blocking.
						});
				}
			}
		},
		
		/*-------------- CV Portfolio Functions Calling ---------------------------------------------------
		---------------------------------------------------------------------------------------------------*/
		
	// open menu click toggle
	open_menu: function() {
		if($('.port_togglebox').length > 0){
			$('.port_togglebox').on('click', function(){
				$('body').toggleClass('port_menu_open');
				var expanded = $('body').hasClass('port_menu_open');
				$(this).attr('aria-expanded', expanded ? 'true' : 'false');
			});
		}
	},
	/*---------------------------------------------------------------------------------------------------*/
	// improve keyboard and aria support without changing layout
	enhance_accessibility: function() {
		if($('.port_navigation .tooltip_box').length > 0){
			$('.port_navigation .tooltip_box').each(function() {
				var link = $(this).find('a.siderbar_menuicon').first();
				var tooltip = $(this).find('.menu_tooltip').first().text().trim();
				if(link.length > 0 && tooltip !== ''){
					link.attr('aria-label', tooltip);
					link.attr('title', tooltip);
				}
			});
		}
		if($('.port_togglebox').length > 0){
			$('.port_togglebox')
				.attr('role', 'button')
				.attr('tabindex', '0')
				.attr('aria-label', 'Toggle menu')
				.attr('aria-expanded', 'false')
				.on('keydown', function(event){
					if(event.key === 'Enter' || event.key === ' '){
						event.preventDefault();
						$(this).trigger('click');
					}
				});
		}
	},
	/*---------------------------------------------------------------------------------------------------*/
	
	
	/*---------------------------------------------------------------------------------------------------*/
	//start custom scroll bar
	custom_scrollbar: function() {
		var _this = this;
		var sidebar = $('.port_sidebar_wrapper');
		if(sidebar.length > 0){
			var initScrollbar = function() {
				if(sidebar.data('scrollbar-ready') || typeof $.fn.mCustomScrollbar !== 'function'){
					return;
				}
				sidebar.mCustomScrollbar({
					moveDragger:true,
					scrollEasing:"easeOut"
				});
				sidebar.data('scrollbar-ready', true);
			};
			if(typeof $.fn.mCustomScrollbar === 'function' && document.querySelector('link[href="assets/css/scrollbar.min.css"]')){
				initScrollbar();
				return;
			}
			var scriptLoader = typeof $.fn.mCustomScrollbar === 'function'
				? Promise.resolve()
				: _this.load_script('assets/js/scrollbar.min.js');
			Promise.all([
				_this.load_style('assets/css/scrollbar.min.css'),
				scriptLoader
			])
				.then(initScrollbar)
				.catch(function() {
					sidebar.data('scrollbar-failed', true);
				});
		}
	},
	/*---------------------------------------------------------------------------------------------------*/
	
	// start on load 
	bannerleft_onload: function() {
		var disableMotion = this.reduceMotion;
		if($('.bannner_leftpart').length > 0){
			$(window).on('load', function(){
			setTimeout(function() {
				$('.bannner_leftpart').addClass('mbannner_leftpart');
				}, disableMotion ? 0 : 300);
			});
		}
	},
	/*------------------------------------------------------------------*/

	// hero photo removed — banner_svg_box animation no longer needed
	rightside_onload: function() {
		// noop
	},
	/*------------------------------------------------------------------*/ 
	
	// right side hire me btn
	rightbtn_onload: function() {
		var disableMotion = this.reduceMotion;
		if($('.brc_hirebtn').length > 0){	
			$(window).on('load', function(){
			setTimeout(function() {
				$('.brc_hirebtn').addClass('mbrc_hirebtn');
				}, disableMotion ? 0 : 2500);
			});
		}
	},
	/*------------------------------------------------------------------*/ 
	
	// Typed JS
	typed_js: function() {
		if($('.typed').length > 0){	
			if(this.reduceMotion){
				$('.typed').each(function(){
					var _this = $(this);
					var stringsContainer = _this.parent().find('.typed-strings');
					if(stringsContainer.length > 0){
						var firstText = stringsContainer.find('p').first().text().trim();
						if(firstText !== ''){
							_this.text(firstText);
						}
					}
				});
				return;
			}
			$('.typed').each(function(){
				var _this = $(this);
				var typed = new Typed(this, {
					stringsElement: _this.parent().find('.typed-strings')[0],
					typeSpeed: 100,
					backSpeed: 80,
					fadeOut: false,
					loop: true
				});
			});
		}
	},
	/*------------------------------------------------------------------*/ 
	
	// animated banner text
	banner_typingtext: function() {
		var target = document.querySelector('.banner_typingtext .texts');
		if(!target){
			return;
		}
		var items = Array.prototype.slice.call(target.querySelectorAll('li'));
		if(items.length === 0){
			return;
		}
		// Honor prefers-reduced-motion: show first item only, no cycling.
		if(this.reduceMotion){
			items[0].classList.add('is-active');
			return;
		}
		var idx = 0;
		var DISPLAY_MS = 1800;
		var EXIT_MS = 220;
		items[0].classList.add('is-active');
		setInterval(function() {
			var current = items[idx];
			current.classList.remove('is-active');
			current.classList.add('is-leaving');
			setTimeout(function() {
				current.classList.remove('is-leaving');
				idx = (idx + 1) % items.length;
				items[idx].classList.add('is-active');
			}, EXIT_MS);
		}, DISPLAY_MS);
	},
	/*------------------------------------------------------------------*/ 
	
	//about open details
	about_opendetails: function() {
		if($('.about_icon_toggle').length > 0){
			$('.about_icon_toggle').on('click', function() {
				var isOpen = $('.about_leftsection').toggleClass('open_details').hasClass('open_details');
				$(this).attr('aria-expanded', isOpen ? 'true' : 'false');
			});
		}
	},
	// Training timeline: prev/next arrows scroll the horizontal track by one node width.
	training_arrows: function() {
		var container = document.querySelector('.training_timeline');
		if(!container){
			return;
		}
		var prev = document.querySelector('.training_arrow--prev');
		var next = document.querySelector('.training_arrow--next');
		if(!prev || !next){
			return;
		}
		function getStep() {
			var node = container.querySelector('.training_node');
			if(!node){
				return 240;
			}
			var track = node.parentNode;
			var gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap) || 0;
			return node.getBoundingClientRect().width + gap;
		}
		function updateArrows() {
			var max = container.scrollWidth - container.clientWidth;
			prev.disabled = container.scrollLeft <= 4;
			next.disabled = container.scrollLeft >= max - 4;
		}
		prev.addEventListener('click', function() {
			container.scrollBy({ left: -getStep(), behavior: 'smooth' });
		});
		next.addEventListener('click', function() {
			container.scrollBy({ left: getStep(), behavior: 'smooth' });
		});
		container.addEventListener('scroll', updateArrows, { passive: true });
		window.addEventListener('resize', updateArrows);
		updateArrows();
	},
	
		/*------------------------------------------------------------------*/ 
	    zoom_in: function() {
        $(document).ready(function(){
            $('.mpf-img img').zoom({ on: 'click' });
        });
    },    
    
	/*------------------------------------------------------------------*/
	// Start testimonial swipper slider
	testimonial_slider: function() {
		var _this = this;
		var target = $('.port_testimonial_setions .swiper-container');
		if(target.length > 0){
			var disableMotion = this.reduceMotion;
			var initSwiper = function() {
				if(target.data('swiper-ready') || typeof window.Swiper !== 'function'){
					return;
				}
				new Swiper('.port_testimonial_setions .swiper-container', {
				  slidesPerView: 1,
				  spaceBetween: 30,
				  loop: true,
				  speed:disableMotion ? 0 : 1000,
				   navigation: {
					nextEl: '.swiper-button-next',
					prevEl: '.swiper-button-prev',
					},
				  autoplay: disableMotion ? false : {
						delay: 5500,
						disableOnInteraction: false,
					},
				});
				target.data('swiper-ready', true);
			};
			var bootSwiper = function() {
				if(typeof window.Swiper === 'function' && document.querySelector('link[href="assets/css/swiper.min.css"]')){
					initSwiper();
					return;
				}
				var scriptLoader = typeof window.Swiper === 'function'
					? Promise.resolve()
					: _this.load_script('assets/js/swiper.min.js');
				Promise.all([
					_this.load_style('assets/css/swiper.min.css'),
					scriptLoader
				])
					.then(initSwiper)
					.catch(function() {
						target.data('swiper-failed', true);
					});
			};
			var section = $('.port_testimonial_setions').get(0) || target.get(0);
			_this.when_in_view(section, bootSwiper, { rootMargin: '250px 0px' });
		}
	},
	// End testimonial swipper slider
	/*------------------------------------------------------------------*/ 
	
	// Re sponsor swipper slider
	responsor_slider: function() {
		var _this = this;
		var target = $('.port_responsor_setions .swiper-container');
		if(target.length > 0){
			var disableMotion = this.reduceMotion;
			var initSwiper = function() {
				if(target.data('swiper-ready') || typeof window.Swiper !== 'function'){
					return;
				}
				new Swiper('.port_responsor_setions .swiper-container', {
				  slidesPerView: 5,
				  spaceBetween: 30,
				  loop: true,
				  speed:disableMotion ? 0 : 1000,
				  autoplay: disableMotion ? false : {
						delay: 3500,
					},
				  breakpoints: {
					480: {
					  slidesPerView: 1,
					  spaceBetween: 10
					},
					767: {
					  slidesPerView: 3,
					  spaceBetween: 20
					},
					991: {
					  slidesPerView: 4,
					  spaceBetween: 30
					}
				  }
				});
				target.data('swiper-ready', true);
			};
			var bootSwiper = function() {
				if(typeof window.Swiper === 'function' && document.querySelector('link[href="assets/css/swiper.min.css"]')){
					initSwiper();
					return;
				}
				var scriptLoader = typeof window.Swiper === 'function'
					? Promise.resolve()
					: _this.load_script('assets/js/swiper.min.js');
				Promise.all([
					_this.load_style('assets/css/swiper.min.css'),
					scriptLoader
				])
					.then(initSwiper)
					.catch(function() {
						target.data('swiper-failed', true);
					});
			};
			var section = $('.port_responsor_setions').get(0) || target.get(0);
			_this.when_in_view(section, bootSwiper, { rootMargin: '250px 0px' });
		}
	},
	
	// End Re sponsor swipper slider
	/*------------------------------------------------------------------*/ 
	
	// circle progress bar js start
	circle_progressbar: function() {
		var _this = this;
		var progressItems = $('.progressbar');
		if(progressItems.length > 0){
			var disableMotion = this.reduceMotion;
			var initProgress = function() {
				if(progressItems.data('circle-ready') || typeof $.fn.circleProgress !== 'function'){
					return;
				}
				progressItems.data('circle-ready', true);
				function animateElements() {
					progressItems.each(function () {
						var elementPos = $(this).offset().top;
						var topOfWindow = $(window).scrollTop();
						var percent = $(this).find('.circle').attr('data-percent');
						var animate = $(this).data('animate');
						if (elementPos < topOfWindow + $(window).height() - 30 && !animate) {
							$(this).data('animate', true);
							$(this).find('.circle').circleProgress({
								startAngle: -Math.PI / 2,
								value: percent / 100,
								size : 400,
								thickness: 15,
								lineCap: 'round',
								animation: disableMotion ? false : {
									duration: 1100
								},
								fill: {
									color: '#FF754A'
								}
							}).stop();
						}
					});
				}
				animateElements();
				$(window).off('scroll.circleProgress').on('scroll.circleProgress', animateElements);
			};
			var bootProgress = function() {
				if(typeof $.fn.circleProgress === 'function'){
					initProgress();
					return;
				}
				_this.load_script('assets/js/circle-progress.min.js')
					.then(initProgress)
					.catch(function() {
						progressItems.data('circle-failed', true);
					});
			};
			_this.when_in_view(progressItems.get(0), bootProgress, { rootMargin: '300px 0px' });
		}
	},
		
	// circle progress bar js start
	/*------------------------------------------------------------------*/ 
	
	// start map js
	world_map: function() {
		var _this = this;
		if($('#world-map').length > 0){
			var mapContainer = $('#world-map');
			var mapBooting = false;
			var ensureVectorMapAssets = function() {
				if(typeof mapContainer.vectorMap === 'function' && document.querySelector('link[href="assets/css/jquery-jvectormap-2.0.3.min.css"]')){
					return Promise.resolve();
				}
				var mapScriptLoader = typeof mapContainer.vectorMap === 'function'
					? Promise.resolve()
					: _this.load_script('assets/js/jquery-jvectormap.min.js')
						.then(function() {
							return _this.load_script('assets/js/jquery-jvectormap-world-mill.min.js');
						});
				return Promise.all([
					_this.load_style('assets/css/jquery-jvectormap-2.0.3.min.css'),
					mapScriptLoader
				]);
			};
			var initializeMap = function() {
				if(mapContainer.data('map-initialized') || mapBooting){
					return;
				}
				mapBooting = true;
				ensureVectorMapAssets()
					.then(function() {
						if(mapContainer.data('map-initialized') || typeof mapContainer.vectorMap !== 'function'){
							mapBooting = false;
							return;
						}
						mapContainer.data('map-initialized', true);
						mapContainer.vectorMap({
				map: 'world_mill',
				scaleColors: ['#C8EEFF', '#0071A4'],
				normalizeFunction: 'polynomial',
				hoverOpacity: 0.9,
				hoverColor: false,
				zoomOnScrollSpeed:1, //default value is 3
				 zoomStep:1.1, //default value is 1.6
					markerStyle: {
									initial:{
												fill: '#00c8da',
												stroke: '#556d91'
											},
									hover: {
												stroke: '#00c8da',
												fill:'#ffc454',
												"stroke-width": 2,
												cursor: 'pointer'
											},
									selected:{
												fill: 'blue'
											},
									selectedHover: {
													}
								},
					regionStyle:{
									initial: {
												fill: '#e3eaef',
												"fill-opacity": 1,
												stroke: 'none',
												"stroke-width": 0,
												"stroke-opacity": 1
											},
									hover: {
												"fill-opacity": 0.8,
												cursor: 'pointer'
											},
									selected:{
												fill: 'yellow'
											},
									selectedHover: {
													}
								},
					backgroundColor: '#fff',
					markers: [
						{
							latLng: [36.72016, -4.42034],
							name: 'Málaga',
						},
						{
							latLng: [-0.22985, -78.52495],
							name: 'Quito',
						},
						{
							latLng: [10.48801, -66.87919],
							name: 'Caracas',
						},
						{
							latLng: [-2.21452, -80.95151],
							name: 'Salinas',
						},
						{
							latLng: [-2.19616, -79.88621],
							name: 'Guayaquil',
						},
						{
							latLng: [4.60971, -74.08175],
							name: 'Bogotá',
						},
						{
							latLng: [36.81897, 10.16579],
							name: 'Túnez',
						},
						{
							latLng: [41.38879, 2.15899],
							name: 'Barcelona',
						},
						{
							latLng: [52.37403, 4.88969],
							name: 'Amsterdam',
						},
						{
							latLng: [52.07667, 4.29861],
							name: 'The Hague',
						},
						{
							latLng: [40.7127837, -74.0059413],
							name: 'New York',
						},
						{
							latLng: [34.052235, -118.243683],
							name: 'Los Angeles',
						},
						{
							latLng: [41.878113, -87.629799],
							name: 'Chicago',
						},
						{
							latLng: [35.222, -101.8313],
							name: 'Amarillo',
						},
						{
							latLng: [40.416775, -3.70379],
							name: 'Madrid',
						},
						{
							latLng: [37.21533, -93.29824],
							name: 'Springfield',
						},
                        {
                            latLng: [37.7749, -122.4194],
                            name: 'San Francisco'
                        },
                        {
                            latLng: [34.8958, -117.0173],
                            name: 'Barstow'
                        },
                        {
                            latLng: [36.1699, -115.1398],
                            name: 'Las Vegas'
                        },
                        {
                            latLng: [36.1069, -112.1129],
                            name: 'Grand Canyon'
                        },
                        {
                            latLng: [35.4676, -97.5164],
                            name: 'Oklahoma City'
                        },
                        {
                            latLng: [27.9659, -82.8001],
                            name: 'Clearwater'
                        },
                        {
                            latLng: [35.1495, -90.0490],
                            name: 'Memphis'
                        },
                        {
                            latLng: [43.0731, -89.4012],
                            name: 'Madison'
                        },
                        {
                            latLng: [44.5192, -88.0198],
                            name: 'Green Bay'
                        },
                        {
                            latLng: [44.9369, -91.3929],
                            name: 'Chippewa Falls'
                        },
                        {
                            latLng: [34.0522, -118.2437],
                            name: 'Los Angeles'
                        },
                        {
                            latLng: [42.3601, -71.0589],
                            name: 'Boston'
                        },
                        {
                            latLng: [42.7654, -71.4676],
                            name: 'Nashua'
                        },
                        {
                            latLng: [-0.9624, -80.7128],
                            name: 'Manta'
                        },
                        {
                            latLng: [36.5298, -6.2920],
                            name: 'Cádiz'
                        },
                        {
                            latLng: [40.9701, -5.6635],
                            name: 'Salamanca'
                        },
                        {
                            latLng: [41.9028, 12.4964],
                            name: 'Roma'
                        },
                        {
                            latLng: [43.7696, 11.2558],
                            name: 'Florencia'
                        },
                        {
                            latLng: [45.4408, 12.3155],
                            name: 'Venecia'
                        },
                        {
                            latLng: [35.0361, 9.4858],
                            name: 'Sidi Bouzid'
                        },
                        {
                            latLng: [35.7595, -5.8330],
                            name: 'Tánger'
                        },
                        {
                            latLng: [36.1408, -5.4562],
                            name: 'Algeciras'
                        },
                        {
                            latLng: [43.2630, -2.9350],
                            name: 'Bilbao'
                        },
                        {
                            latLng: [42.8597, -2.6818],
                            name: 'Vitoria'
                        },
                        {
                            latLng: [43.3623, -8.4115],
                            name: 'La Coruña'
                        },
                        {
                            latLng: [35.0844, -106.6504],
                            name: 'Albuquerque, New Mexico'
                        },
                        {
                            latLng: [38.6270, -90.1994],
                            name: 'Saint Louis, Missouri'
                        },
                        {
                            latLng: [27.9506, -82.4572],
                            name: 'Tampa Bay, Florida'
                        },
                        {
                            latLng: [42.8864, -78.8784],
                            name: 'Buffalo, New York'
                        },
                        {
                            latLng: [-1.0546, -80.4544],
                            name: 'Portoviejo, Ecuador'
                        },
                        {
                            latLng: [0.3392, -78.1220],
                            name: 'Ibarra, Ecuador'
                        },
                        {
                            latLng: [-3.9942, -79.2057],
                            name: 'Loja, Ecuador'
                        },
                        {
                            latLng: [-2.9043, -79.0119],
                            name: 'Cuenca, Ecuador'
                        },
                        {
                            latLng: [43.3614, -5.8494],
                            name: 'Oviedo, España'
                        },
                        {
                            latLng: [43.5322, -5.6615],
                            name: 'Gijón, España'
                        },
                        {
                            latLng: [40.7829, 17.2408],
                            name: 'Alberobello, Italia'
                        },
                        {
                            latLng: [43.3188, 11.3308],
                            name: 'Siena, Italia'
                        },
                        {
                            latLng: [52.3676, 4.9041],
                            name: 'Amsterdam'
                        },
                        {
                            latLng: [51.9225, 4.4792],
                            name: 'Rotterdam'
                        },
                        {
                            latLng: [50.7753, 6.0839],
                            name: 'Aachen'
                        },
                        {
                            latLng: [52.5200, 13.4050],
                            name: 'Berlín'
                        },
                        {
                            latLng: [48.8566, 2.3522],
                            name: 'París'
                        },
                        {
                            latLng: [44.4056, 8.9463],
                            name: 'Génova'
                        },
                        {
                            latLng: [43.7102, 7.2620],
                            name: 'Niza'
                        },
                        {
                            latLng: [37.6257, -0.9966],
                            name: 'Cartagena'
                        },
                        {
                            latLng: [38.7223, -9.1393],
                            name: 'Lisboa'
                        },
                        {
                            latLng: [41.6918, -8.8335],
                            name: 'Viana Do Castelo'
                        },
                        {
                            latLng: [37.0194, -7.9306],
                            name: 'Algarve'
                        },
                        {
                            latLng: [41.1579, -8.6291],
                            name: 'Oporto'
                        },
                        {
                            latLng: [42.5063, 1.5218],
                            name: 'Andorra'
                        },
                        {
                            latLng: [43.7228, 10.4017],
                            name: 'Pisa'
                        },
                        {
                            latLng: [46.7867, -92.1005],
                            name: 'Duluth'
                        },
                        {
                            latLng: [44.9778, -93.2650],
                            name: 'Minneapolis'
                        },
                        {
                            latLng: [36.6437, -93.2185],
                            name: 'Branson'
                        },
                        {
                            latLng: [36.1540, -95.9928],
                            name: 'Tulsa'
                        },
                        {
                            latLng: [34.9387, -104.9373],
                            name: 'Santa Rosa'
                        },
                        {
                            latLng: [34.9022, -110.1593],
                            name: 'Holbrook'
                        },
                        {
                            latLng: [35.1983, -111.6513],
                            name: 'Flagstaff'
                        },
                        {
                            latLng: [35.3733, -119.0187],
                            name: 'Bakersfield'
                        },
                        {
                            latLng: [37.3382, -121.8863],
                            name: 'San José'
                        },
                        {
                            latLng: [34.7465, -92.2896],
                            name: 'Little Rock'
                        },
                        {
                            latLng: [36.1627, -86.7816],
                            name: 'Nashville'
                        },
                        {
                            latLng: [35.2574, -86.3698],
                            name: 'Lynchburg'
                        },
                        {
                            latLng: [53.3498, -6.2603],
                            name: 'Dublín'
                        },
                        {
                            latLng: [6.2442, -75.5812],
                            name: 'Medellín'
                        },
                        {
                            latLng: [11.2408, -74.1990],
                            name: 'Santa Marta'
                        },
                        {
                            latLng: [3.2174, -75.1744],
                            name: "Villavieja"
                        },
                        {
                            latLng: [-19.92083, -43.93778],
                            name: 'Belo Horizonte'
                        }
					]
				  });
						mapBooting = false;
					})
					.catch(function() {
						mapBooting = false;
						mapContainer.data('map-init-failed', true);
					});
			};
				_this.when_in_view(mapContainer[0], initializeMap, { rootMargin: '250px 0px' });
			}
		},
	// end map js
	/*------------------------------------------------------------------*/ 
	
	// start video popup js
	popup_video: function() {
		var _this = this;
		var videoItems = $('.testimonial_icon .video');
		if(videoItems.length > 0){
			var initPopup = function() {
				if(videoItems.data('video-popup-ready') || typeof $.fn.magnificPopup !== 'function'){
					return;
				}
				videoItems.magnificPopup({ 
					type: 'iframe',
					iframe: {
						markup: '<div class="mfp-iframe-scaler">'+
							'<div class="mfp-close"></div>'+
							'<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+
							'<div class="mfp-title">Some caption</div>'+
							'</div>',
						patterns: {
							youtube: {
								index: 'youtube.com/', 
								id: 'v=',
								src: 'https://www.youtube.com/embed/fpQcEiwxzQE'
							}
						}
					}
				});	
				videoItems.data('video-popup-ready', true);
			};
			var bootPopup = function() {
				if(typeof $.fn.magnificPopup === 'function'){
					initPopup();
					return;
				}
				_this.load_script('assets/js/jquery.magnific-popup.min.js')
					.then(initPopup)
					.catch(function() {
						videoItems.data('video-popup-failed', true);
					});
			};
			var section = $('.port_testimonial_setions').get(0) || videoItems.get(0);
			_this.when_in_view(section, bootPopup, { rootMargin: '250px 0px' });
		}
	},
	// End video popup js
	/*------------------------------------------------------------------*/
	
	// Contact Form Submission
	contact_form: function() {
		if($('.submitForm').length > 0){
			var _this = this;
			var minSubmitDelayMs = 1200;
			// Bilingual feedback so a visitor on lang=es gets Spanish at the highest-
			// intent moment (UX-FORM-01). `messages.<key>` resolves live against
			// window.currentLanguage (set by translate.js) at access time, i.e. on submit.
			var messagesByLang = {
				en: {
					missingFields: 'Please complete the required fields.',
					waitBeforeSubmit: 'Please wait a moment and try again.',
					completeCaptcha: 'Please complete the security check.',
					captchaUnavailable: 'Security verification is temporarily unavailable. Please try again later.',
					genericError: 'Something went wrong. Please try again later.',
					success: 'Your message has been sent successfully.',
					invalidRule: 'Validation rule is not configured.'
				},
				es: {
					missingFields: 'Por favor, completa los campos obligatorios.',
					waitBeforeSubmit: 'Espera un momento e inténtalo de nuevo.',
					completeCaptcha: 'Por favor, completa la verificación de seguridad.',
					captchaUnavailable: 'La verificación de seguridad no está disponible temporalmente. Inténtalo más tarde.',
					genericError: 'Algo salió mal. Por favor, inténtalo más tarde.',
					success: 'Tu mensaje se ha enviado correctamente.',
					invalidRule: 'La regla de validación no está configurada.'
				}
			};
			var messages = {};
			Object.keys(messagesByLang.en).forEach(function(key){
				Object.defineProperty(messages, key, {
					enumerable: true,
					get: function(){
						var lang = (window.currentLanguage === 'es') ? 'es' : 'en';
						return messagesByLang[lang][key];
					}
				});
			});
			var captchaScriptSrc = {
				recaptcha: 'https://www.google.com/recaptcha/api.js?render=explicit',
				hcaptcha: 'https://js.hcaptcha.com/1/api.js?render=explicit',
				turnstile: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
			};
			function setResponse(targetResp, message, type){
				targetResp.removeClass('is-error is-success');
				targetResp.attr('role', type === 'error' ? 'alert' : 'status');
				targetResp.addClass(type === 'error' ? 'is-error' : 'is-success');
				targetResp.text(message);
			}
			function clearResponse(targetResp){
				targetResp.removeClass('is-error is-success');
				targetResp.attr('role', 'status');
				targetResp.text('');
			}
			function setFieldInvalid(field){
				field.addClass('error').attr('aria-invalid', 'true');
			}
			function clearFieldInvalid(field){
				field.removeClass('error').attr('aria-invalid', 'false');
			}
			function refreshStartTimestamp(targetForm){
				var startedAtField = targetForm.find('input[name="form_started_at"]');
				if(startedAtField.length > 0){
					startedAtField.val(String(Date.now()));
				}
			}
			function getRuntimeCaptchaConfig(){
				var runtime = window.PORTFOLIO_RUNTIME || {};
				return runtime.captcha || {};
			}
			function getCaptchaApi(provider){
				if(provider === 'hcaptcha'){
					return window.hcaptcha;
				}
				if(provider === 'recaptcha'){
					return window.grecaptcha;
				}
				if(provider === 'turnstile'){
					return window.turnstile;
				}
				return null;
			}
			function createCaptchaState(targetForm){
				var runtimeCaptcha = getRuntimeCaptchaConfig();
				var provider = (targetForm.attr('data-captcha-provider') || runtimeCaptcha.provider || '').toLowerCase().trim();
				var siteKey = (targetForm.attr('data-captcha-site-key') || runtimeCaptcha.siteKey || '').trim();
				var enabled = (provider === 'hcaptcha' || provider === 'recaptcha' || provider === 'turnstile') && siteKey !== '';
				return {
					enabled: enabled,
					provider: provider,
					siteKey: siteKey,
					widgetId: null,
					readyPromise: null,
					tokenRequestPromise: null,
					tokenRequestResolve: null,
					tokenRequestTimer: null
				};
			}
			function settleCaptchaTokenRequest(state, token){
				if(!state || typeof state.tokenRequestResolve !== 'function'){
					return;
				}
				if(state.tokenRequestTimer){
					clearTimeout(state.tokenRequestTimer);
					state.tokenRequestTimer = null;
				}
				var resolve = state.tokenRequestResolve;
				state.tokenRequestResolve = null;
				state.tokenRequestPromise = null;
				resolve((token || '').trim());
			}
			function ensureCaptchaState(targetForm){
				var state = targetForm.data('captcha-state');
				if(state){
					return state;
				}
				state = createCaptchaState(targetForm);
				targetForm.data('captcha-state', state);
				return state;
			}
			function setCaptchaToken(targetForm, value){
				targetForm.find('input[name="captcha_token"]').val((value || '').trim());
			}
			function setCaptchaProvider(targetForm, value){
				targetForm.find('input[name="captcha_provider"]').val((value || '').trim());
			}
			function getCaptchaToken(targetForm, state){
				var token = (targetForm.find('input[name="captcha_token"]').val() || '').trim();
				if(token !== ''){
					return token;
				}
				if(!state || !state.enabled || state.widgetId === null){
					return '';
				}
				var api = getCaptchaApi(state.provider);
				if(api && typeof api.getResponse === 'function'){
					try {
						return (api.getResponse(state.widgetId) || '').trim();
					} catch (error) {
						return '';
					}
				}
				return '';
			}
			function setCaptchaPresentation(targetForm, state, presentation){
				var widgetContainer = targetForm.find('.contact_captcha_widget');
				if(widgetContainer.length === 0){
					return;
				}
				widgetContainer.removeClass('is-prepared is-staged is-visible').removeAttr('aria-hidden');
				if(presentation === 'visible'){
					widgetContainer.show().addClass('is-prepared is-visible');
					return;
				}
				if(presentation === 'staged' && state && state.provider === 'turnstile'){
					widgetContainer.show().addClass('is-prepared is-staged').attr('aria-hidden', 'true');
					return;
				}
				widgetContainer.hide();
			}
			function resetCaptcha(targetForm){
				var state = ensureCaptchaState(targetForm);
				settleCaptchaTokenRequest(state, '');
				if(!state.enabled || state.widgetId === null){
					setCaptchaToken(targetForm, '');
					return;
				}
				var api = getCaptchaApi(state.provider);
				if(api && typeof api.reset === 'function'){
					try {
						api.reset(state.widgetId);
					} catch (error) {
						// Ignore reset errors to keep form available.
					}
				}
				setCaptchaToken(targetForm, '');
			}
			function renderCaptchaWidget(targetForm, state){
				var widgetContainer = targetForm.find('.contact_captcha_widget');
				if(widgetContainer.length === 0){
					return Promise.resolve(state);
				}
				var api = getCaptchaApi(state.provider);
				if(!api || typeof api.render !== 'function'){
					return Promise.reject(new Error('Captcha API unavailable'));
				}
				var renderFn = function() {
					setCaptchaPresentation(targetForm, state, state.provider === 'turnstile' ? 'staged' : 'visible');
					setCaptchaProvider(targetForm, state.provider);
					setCaptchaToken(targetForm, '');
					var widgetOptions = {
						sitekey: state.siteKey,
						callback: function(token){
							setCaptchaToken(targetForm, token);
							settleCaptchaTokenRequest(state, token);
						},
						'expired-callback': function(){
							setCaptchaToken(targetForm, '');
							settleCaptchaTokenRequest(state, '');
						},
						'error-callback': function(){
							setCaptchaToken(targetForm, '');
							settleCaptchaTokenRequest(state, '');
						}
					};
					if(state.provider === 'turnstile'){
						widgetOptions.execution = 'execute';
						widgetOptions.appearance = 'interaction-only';
					}
					state.widgetId = api.render(widgetContainer[0], widgetOptions);
					return state;
				};

				if(state.provider === 'recaptcha' && typeof api.ready === 'function'){
					return new Promise(function(resolve, reject){
						api.ready(function(){
							try {
								resolve(renderFn());
							} catch (error) {
								reject(error);
							}
						});
					});
				}

				return Promise.resolve(renderFn());
			}
			function ensureCaptchaReady(targetForm){
				var state = ensureCaptchaState(targetForm);
				var widgetContainer = targetForm.find('.contact_captcha_widget');
				if(!state.enabled){
					if(widgetContainer.length > 0){
						widgetContainer.removeClass('is-prepared is-staged is-visible').removeAttr('aria-hidden').hide().empty();
					}
					settleCaptchaTokenRequest(state, '');
					setCaptchaProvider(targetForm, '');
					setCaptchaToken(targetForm, '');
					return Promise.resolve(state);
				}
				if(state.readyPromise){
					return state.readyPromise;
				}
				var scriptSrc = captchaScriptSrc[state.provider];
				if(!scriptSrc){
					state.enabled = false;
					return Promise.resolve(state);
				}
				state.readyPromise = _this.load_script(scriptSrc)
					.then(function(){
						return renderCaptchaWidget(targetForm, state);
					}).catch(function(error){
						state.readyPromise = null;
						setCaptchaPresentation(targetForm, state, 'hidden');
						throw error;
					});
				return state.readyPromise;
			}
			function requestCaptchaToken(targetForm, state){
				var existingToken = getCaptchaToken(targetForm, state);
				if(existingToken !== ''){
					return Promise.resolve(existingToken);
				}
				if(!state || !state.enabled || state.provider !== 'turnstile' || state.widgetId === null){
					return Promise.resolve('');
				}
				if(state.tokenRequestPromise){
					return state.tokenRequestPromise;
				}
				var api = getCaptchaApi(state.provider);
				if(!api || typeof api.execute !== 'function'){
					return Promise.resolve('');
				}

				state.tokenRequestPromise = new Promise(function(resolve){
					state.tokenRequestResolve = resolve;
					state.tokenRequestTimer = window.setTimeout(function(){
						settleCaptchaTokenRequest(state, '');
					}, 10000);
					try {
						api.execute(state.widgetId);
					} catch (error) {
						settleCaptchaTokenRequest(state, '');
					}
				});

				return state.tokenRequestPromise;
			}
			function checkRequire(formId , targetResp){
				clearResponse(targetResp);
				var email = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
				var url = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
				var image = /\.(jpe?g|gif|png|PNG|JPE?G)$/;
				var mobile = /^[\s()+-]*([0-9][\s()+-]*){6,20}$/;
				var facebook = /^(https?:\/\/)?(www\.)?facebook.com\/[a-zA-Z0-9(\.\?)?]/;
				var twitter = /^(https?:\/\/)?(www\.)?twitter.com\/[a-zA-Z0-9(\.\?)?]/;
				var google_plus = /^(https?:\/\/)?(www\.)?plus.google.com\/[a-zA-Z0-9(\.\?)?]/;
				var validators = {
					email: email,
					url: url,
					image: image,
					mobile: mobile,
					facebook: facebook,
					twitter: twitter,
					google_plus: google_plus
				};
				var check = 0;
				$('#er_msg').remove();
				var target = (typeof formId == 'object')? $(formId):$('#'+formId);
				target.find('.form-control').each(function(){
					clearFieldInvalid($(this));
				});
				target.find('input , textarea , select').each(function(){
					if($(this).attr('type') === 'hidden'){
						return true;
					}
					if($(this).hasClass('require')){
						if($(this).val().trim() == ''){
							check = 1;
							$(this).focus();
							setFieldInvalid($(this));
							setResponse(targetResp, messages.missingFields, 'error');
							return false;
						}else{
							clearFieldInvalid($(this));
						}
					}
					if($(this).val().trim() != ''){
						var valid = $(this).attr('data-valid');
						if(typeof valid != 'undefined'){
							if(typeof validators[valid] === 'undefined'){
								check = 1;
								setResponse(targetResp, messages.invalidRule, 'error');
								return false;
							}
							if(!validators[valid].test($(this).val().trim())){
								setFieldInvalid($(this));
								$(this).focus();
								check = 1;
								setResponse(targetResp, $(this).attr('data-error'), 'error');
								return false;
							}else{
								clearFieldInvalid($(this));
							}
						}
					}
				});
				return check;
			}
			$('.submitForm').each(function(){
				var targetForm = $(this).closest('form');
				refreshStartTimestamp(targetForm);
				targetForm.find('.form-control').attr('aria-invalid', 'false');
				var state = ensureCaptchaState(targetForm);
				targetForm.find('.contact_captcha_widget')
					.removeClass('is-prepared is-staged is-visible')
					.removeAttr('aria-hidden')
					.hide()
					.empty();
				setCaptchaProvider(targetForm, state.enabled ? state.provider : '');
				setCaptchaToken(targetForm, '');
			});
			$(document).on('focusin', '#scroll_contact .form-control', function(){
				var targetForm = $(this).closest('form');
				var state = ensureCaptchaState(targetForm);
				if(!state.enabled || state.readyPromise){
					return;
				}
				ensureCaptchaReady(targetForm).catch(function(){
					targetForm.find('.contact_captcha_widget')
						.removeClass('is-prepared is-staged is-visible')
						.removeAttr('aria-hidden')
						.hide()
						.empty();
				});
			});
			$(document).on('input change', '#scroll_contact .form-control', function(){
				clearFieldInvalid($(this));
			});
			$('.submitForm').on('click', function() {
				var _this = $(this);
				if(_this.prop('disabled')){
					return;
				}
				var targetForm = _this.closest('form');
				var errroTarget = targetForm.find('.response');
				var honeypotValue = targetForm.find('input[name="website"]').val();
				var startedAtValue = parseInt(targetForm.find('input[name="form_started_at"]').val(), 10);
				if(typeof honeypotValue === 'string' && honeypotValue.trim() !== ''){
					portfolio.track_event('contact_submit_blocked', {
						reason: 'honeypot_triggered'
					});
					setResponse(errroTarget, messages.genericError, 'error');
					refreshStartTimestamp(targetForm);
					return;
				}
				if(!startedAtValue || (Date.now() - startedAtValue) < minSubmitDelayMs){
					portfolio.track_event('contact_submit_blocked', {
						reason: 'too_fast'
					});
					setResponse(errroTarget, messages.waitBeforeSubmit, 'error');
					return;
				}
				var check = checkRequire(targetForm , errroTarget);
				if(check == 0){
					clearResponse(errroTarget);
					_this.prop('disabled', true).attr('aria-busy', 'true');
					ensureCaptchaReady(targetForm).then(function(captchaState){
						return requestCaptchaToken(targetForm, captchaState).then(function(requestedToken){
							return {
								captchaState: captchaState,
								token: requestedToken || getCaptchaToken(targetForm, captchaState)
							};
						});
					}).then(function(captchaContext){
						var captchaState = captchaContext.captchaState;
						var token = (captchaContext.token || '').trim();
						if(captchaState.enabled && token === ''){
							if(captchaState.provider === 'turnstile'){
								setCaptchaPresentation(targetForm, captchaState, 'visible');
							}
							portfolio.track_event('contact_submit_blocked', {
								reason: 'captcha_missing'
							});
							setResponse(errroTarget, messages.completeCaptcha, 'error');
							_this.prop('disabled', false).removeAttr('aria-busy');
							return;
						}
						var formData = {};
						targetForm[0].querySelectorAll('[name]').forEach(function(el){ formData[el.name] = el.value; });
						formData.form_type = _this.attr('data-type');
						if(captchaState.enabled){
							formData.captcha_provider = captchaState.provider;
							formData.captcha_token = token;
						}
						if(captchaState.provider === 'turnstile'){
							setCaptchaPresentation(targetForm, captchaState, 'staged');
						}
						portfolio.track_event('contact_submit_attempt', {
							captcha_enabled: captchaState.enabled ? '1' : '0'
						});

						$.ajax({
							method : 'post',
							url : '/.netlify/functions/contact',
							data: JSON.stringify(formData),
							cache: false,
							contentType: 'application/json; charset=UTF-8',
							processData: false
						}).done(function(resp){
							if(resp == 1){
								targetForm.find('input:not([type="hidden"])').val('');
								targetForm.find('textarea').val('');
								targetForm.find('input[name="website"]').val('');
								targetForm.find('.form-control').attr('aria-invalid', 'false');
								refreshStartTimestamp(targetForm);
								resetCaptcha(targetForm);
								if(captchaState.provider === 'turnstile'){
									setCaptchaPresentation(targetForm, captchaState, 'staged');
								}
								setResponse(errroTarget, messages.success, 'success');
								portfolio.track_event('contact_submit_success', {
									captcha_enabled: captchaState.enabled ? '1' : '0'
								});
							}else{
								setResponse(errroTarget, messages.genericError, 'error');
								refreshStartTimestamp(targetForm);
								resetCaptcha(targetForm);
								if(captchaState.provider === 'turnstile'){
									setCaptchaPresentation(targetForm, captchaState, 'staged');
								}
								portfolio.track_event('contact_submit_failure', {
									reason: 'server_rejected'
								});
							}
						}).fail(function(){
							setResponse(errroTarget, messages.genericError, 'error');
							refreshStartTimestamp(targetForm);
							resetCaptcha(targetForm);
							if(captchaState.provider === 'turnstile'){
								setCaptchaPresentation(targetForm, captchaState, 'staged');
							}
							portfolio.track_event('contact_submit_failure', {
								reason: 'network_error'
							});
						}).always(function(){
							_this.prop('disabled', false).removeAttr('aria-busy');
						});
					}).catch(function(){
						setResponse(errroTarget, messages.captchaUnavailable, 'error');
						portfolio.track_event('contact_submit_failure', {
							reason: 'captcha_unavailable'
						});
						refreshStartTimestamp(targetForm);
						_this.prop('disabled', false).removeAttr('aria-busy');
					});
				}else{
					portfolio.track_event('contact_submit_blocked', {
						reason: 'validation_error'
					});
				}
			});
		}
	},		
	
	
	/*------------------------------------------------------------------*/
	
	/*------------------------------------------------------------------*/
	// Go to Top button
	goto_top: function() {
		var disableMotion = this.reduceMotion;
		if($('.bottom_top').length > 0){
			$(function(){
				// Scroll Event
				$(window).on('scroll', function(){
					var scrolled = $(window).scrollTop();
					if (scrolled > 600) $('.bottom_top').addClass('active');
					if (scrolled < 600) $('.bottom_top').removeClass('active');
				});  
				// Click Event
				$('.bottom_top').on('click', function() {
					$("html, body").animate({ scrollTop: "0" }, disableMotion ? 0 : 500);
				});
			});
		}
	},	
	/*------------------------------------------------------------------*/ 
	
	/*------------------------------------------------------------------*/ 
	//Single page scroll js
	page_scroll: function() {
		var disableMotion = this.reduceMotion;
		if($('.port_navigation.index_navigation .nav_list li').length > 0){
			var navItems = $('.port_navigation.index_navigation .nav_list li');
			var sectionTargets = $('.page_scroll[data-scroll]');
			var scrollToTarget = function(scrollNumber) {
				var target = sectionTargets.filter('[data-scroll="' + scrollNumber + '"]').first();
				if(target.length === 0){
					target = $('[data-scroll="' + scrollNumber + '"]').first();
				}
				if(target.length === 0){
					return;
				}
				$('.port_navigation .nav_list li').removeClass('active');
				navItems.filter('[data-number="' + scrollNumber + '"]').addClass('active');
				$('html, body').animate({
					scrollTop: target.offset().top
				}, disableMotion ? 0 : 220);
			};

			navItems.on('click', function(e){
				e.preventDefault();
				scrollToTarget($(this).attr('data-number'));
			});

			navItems.find('a.siderbar_menuicon').on('click', function(e){
				e.preventDefault();
				e.stopPropagation();
				scrollToTarget($(this).closest('li').attr('data-number'));
			});
		}
	},	
	//scroll active class js
	window_scroll: function() {
		if($('.port_navigation').length > 0){	
			var navItems = $('.port_navigation .nav_list li');
			var sectionTargets = $('.page_scroll[data-scroll]');
			if(sectionTargets.length === 0){
				sectionTargets = $('[data-scroll]');
			}
			sectionTargets = sectionTargets.filter(function() {
				var scrollNumber = String($(this).attr('data-scroll'));
				return navItems.filter('[data-number="' + scrollNumber + '"]').length > 0;
			});
			$(window).on('scroll', function() {
				var windscroll = $(window).scrollTop();
				if (windscroll >= 0) {
					var activeNumber = null;
					sectionTargets.each(function() {
						if ($(this).offset().top <= windscroll + 120) {
							activeNumber = String($(this).attr('data-scroll'));
						}
					});
					if(activeNumber !== null){
						navItems.removeClass('active');
						navItems.filter('[data-number="' + activeNumber + '"]').addClass('active');
					}
				}else{
					navItems.removeClass('active');
					$('.port_navigation .nav_list li:first').addClass('active');
				}
			});
			$(window).trigger('scroll');
		}
	},
	/*------------------------------------------------------------------*/ 
	
	/*------------------------------------------------------------------*/
	//click to scroll
	scroll_contact: function() {
		var disableMotion = this.reduceMotion;
		if($('.redirect_contact').length > 0){
			$('.redirect_contact').on('click', function(e) {
				e.preventDefault();
				if(window.history && typeof window.history.pushState === 'function'){
					window.history.pushState(null, '', '#scroll_contact');
				}else{
					window.location.hash = 'scroll_contact';
				}
				$('html, body').animate({
					scrollTop: $('#scroll_contact').offset().top
				}, disableMotion ? 0 : 220);
			});
		}
	},
	/*------------------------------------------------------------------*/ 
	
	/*------------------------------------------------------------------*/ 
		//Read more
		read_more: function() {
			if($('.ex_btn').length > 0){
				var disableMotion = this.reduceMotion;
				var syncExpandedIntroState = function(button) {
					var currentCard = button.closest('.ex_rightside');
					$('.ex_rightside.expand-intro-on-open').not(currentCard).removeClass('intro-expanded');
					if(!currentCard.hasClass('expand-intro-on-open')){
						return;
					}
					var isOpen = button.siblings('.more_content:visible').length > 0;
					currentCard.toggleClass('intro-expanded', isOpen);
				};
				$('.ex_btn').on('click', function() {
					var button = $(this);
					if(disableMotion){
						$(".more_content").not($(this).siblings(".more_content")).hide();
						$(this).siblings('.more_content').toggle();
					}else{
						$(".more_content").not($(this).siblings(".more_content")).slideUp();
						$(this).siblings('.more_content').slideToggle();
					}
					$(".ex_btn").not(this).text("⬇️");
				  if ($(this).text() == "⬇️") {
					$(this).text("⬆️")
				  } else {
					$(this).text("⬇️")
				  }
				  if(disableMotion){
					syncExpandedIntroState(button);
				  }else{
					setTimeout(function() {
						syncExpandedIntroState(button);
					}, 260);
				  }
				});
				 $('.ex_rightside').on('click', function(e) {
					e.stopPropagation(); 
				});
			}
	},
	/*------------------------------------------------------------------*/ 
	
	};
	portfolio.init();
	
	
	
	
	
	// preloader removed — no fadeout logic needed

	// Hero interactive background: canvas dot grid with per-point proximity reaction + particle trail
	(function initHeroBackground() {
		var wrapper = document.querySelector('.port_bannerbg_wrapper.hero-stage');
		if (!wrapper) return;

		var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		var canvas = document.createElement('canvas');
		canvas.className = 'hero-bg-canvas';
		canvas.setAttribute('aria-hidden', 'true');
		wrapper.insertBefore(canvas, wrapper.firstChild);

		var ctx = canvas.getContext('2d', { alpha: true });
		if (!ctx) return;

		var dpr = Math.min(window.devicePixelRatio || 1, 2);
		var width = 0;
		var height = 0;
		var dots = [];
		var trail = [];
		var SPACING = 30;            // px between grid points
		var INFLUENCE = 200;         // cursor influence radius
		var ACCENTS = ['255,196,85', '255,81,126', '0,200,218']; // brand: yellow, pink, cyan
		var BASE_INK = '14,15,33';
		var mouseX = -9999;
		var mouseY = -9999;
		var prevMouseX = -9999;
		var prevMouseY = -9999;
		var rafId = null;
		var isAnimating = false;
		var lastTrailEmit = 0;

		function resize() {
			var rect = wrapper.getBoundingClientRect();
			width = rect.width;
			height = rect.height;
			canvas.width = Math.max(1, Math.round(width * dpr));
			canvas.height = Math.max(1, Math.round(height * dpr));
			canvas.style.width = width + 'px';
			canvas.style.height = height + 'px';
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.scale(dpr, dpr);

			dots = [];
			var cols = Math.ceil(width / SPACING) + 2;
			var rows = Math.ceil(height / SPACING) + 2;
			var offsetX = (width - (cols - 1) * SPACING) / 2;
			var offsetY = (height - (rows - 1) * SPACING) / 2;
			for (var r = 0; r < rows; r++) {
				for (var c = 0; c < cols; c++) {
					var accentIdx = (r * 7 + c * 3) % ACCENTS.length;
					dots.push({
						x: offsetX + c * SPACING,
						y: offsetY + r * SPACING,
						accent: ACCENTS[accentIdx]
					});
				}
			}
		}

		function render() {
			rafId = null;
			ctx.clearRect(0, 0, width, height);

			var anyActive = false;

			// Render dots
			for (var i = 0; i < dots.length; i++) {
				var d = dots[i];
				var dx = d.x - mouseX;
				var dy = d.y - mouseY;
				var dist = Math.sqrt(dx * dx + dy * dy);
				var t = Math.max(0, 1 - dist / INFLUENCE);
				var eased = t * t;

				if (eased > 0.01) {
					anyActive = true;
					var radius = 0.7 + eased * 2.6;
					var opacity = 0.10 + eased * 0.78;
					ctx.beginPath();
					ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
					ctx.fillStyle = 'rgba(' + d.accent + ',' + opacity + ')';
					ctx.fill();
				} else {
					ctx.beginPath();
					ctx.arc(d.x, d.y, 0.7, 0, Math.PI * 2);
					ctx.fillStyle = 'rgba(' + BASE_INK + ',0.10)';
					ctx.fill();
				}
			}

			// Render trail particles
			for (var j = trail.length - 1; j >= 0; j--) {
				var p = trail[j];
				p.life -= 0.025;
				p.x += p.vx;
				p.y += p.vy;
				p.vx *= 0.94;
				p.vy *= 0.94;
				if (p.life <= 0) {
					trail.splice(j, 1);
					continue;
				}
				anyActive = true;
				var lifeT = p.life;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.r * lifeT, 0, Math.PI * 2);
				ctx.fillStyle = 'rgba(' + p.accent + ',' + (lifeT * 0.55) + ')';
				ctx.fill();
			}

			if (anyActive && !document.hidden) {
				rafId = window.requestAnimationFrame(render);
				isAnimating = true;
			} else {
				isAnimating = false;
			}
		}

		function scheduleRender() {
			if (rafId === null && !document.hidden) {
				rafId = window.requestAnimationFrame(render);
			}
		}

		function handleMove(e) {
			var rect = wrapper.getBoundingClientRect();
			prevMouseX = mouseX;
			prevMouseY = mouseY;
			mouseX = e.clientX - rect.left;
			mouseY = e.clientY - rect.top;

			if (reduceMotion) return;

			var now = performance.now();
			if (now - lastTrailEmit > 22) {
				var dx = mouseX - prevMouseX;
				var dy = mouseY - prevMouseY;
				var speed = Math.sqrt(dx * dx + dy * dy);
				if (speed > 1 && prevMouseX > -9000) {
					var accentIdx = Math.floor(Math.random() * ACCENTS.length);
					trail.push({
						x: mouseX + (Math.random() - 0.5) * 6,
						y: mouseY + (Math.random() - 0.5) * 6,
						vx: dx * 0.04 + (Math.random() - 0.5) * 0.6,
						vy: dy * 0.04 + (Math.random() - 0.5) * 0.6,
						r: 1.4 + Math.random() * 1.8,
						life: 1.0,
						accent: ACCENTS[accentIdx]
					});
					if (trail.length > 36) trail.shift();
					lastTrailEmit = now;
				}
			}
			scheduleRender();
		}

		function handleLeave() {
			mouseX = -9999;
			mouseY = -9999;
			scheduleRender();
		}

		wrapper.addEventListener('mousemove', handleMove, { passive: true });
		wrapper.addEventListener('mouseleave', handleLeave, { passive: true });
		window.addEventListener('resize', function () {
			resize();
			scheduleRender();
		}, { passive: true });
		document.addEventListener('visibilitychange', function () {
			if (document.hidden && rafId !== null) {
				window.cancelAnimationFrame(rafId);
				rafId = null;
			} else if (!document.hidden) {
				scheduleRender();
			}
		});

		resize();
		// Initial render: paint static grid baseline
		ctx.clearRect(0, 0, width, height);
		for (var k = 0; k < dots.length; k++) {
			var dd = dots[k];
			ctx.beginPath();
			ctx.arc(dd.x, dd.y, 0.7, 0, Math.PI * 2);
			ctx.fillStyle = 'rgba(' + BASE_INK + ',0.10)';
			ctx.fill();
		}
	})();

}(jQuery));
