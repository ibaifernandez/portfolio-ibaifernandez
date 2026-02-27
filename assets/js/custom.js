/*--------------------- Copyright (c) 2019 -----------------------
[Master Javascript]

Project: Portfolio Responsive HTML Template
Version: 1.0.6
Assigned to: ThemeForest
------------------------------------------------------------------


------------------------------------------------------------------*/

(function ($) {
	"use strict";
	var portfolio = {
		initialised: false,
		version: 1.0,
		mobile: false,
		reduceMotion: false,
		scriptLoaders: {},
		stylesheetLoaders: {},
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
			if(typeof $.fn.mCustomScrollbar === 'function' && document.querySelector('link[href="assets/css/scrollbar.css"]')){
				initScrollbar();
				return;
			}
			var scriptLoader = typeof $.fn.mCustomScrollbar === 'function'
				? Promise.resolve()
				: _this.load_script('assets/js/scrollbar.js');
			Promise.all([
				_this.load_style('assets/css/scrollbar.css'),
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

	// right side image
	rightside_onload: function() {
		var disableMotion = this.reduceMotion;
		if($('.banner_svg_box').length > 0){
			$(window).on('load', function(){
			setTimeout(function() {
				$('.banner_svg_box').addClass('mbanner_svg_box');
				}, disableMotion ? 0 : 1500);
			});
		}
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
		if(this.reduceMotion){
			return;
		}
		var _this = this;
		var typingTarget = $('.banner_typingtext');
		if(typingTarget.length > 0){
			var initTyping = function() {
				if(typingTarget.data('textillate-ready') || typeof $.fn.textillate !== 'function'){
					return;
				}
				typingTarget.textillate({
					loop: true,
					minDisplayTime: 2e3,
					initialDelay: 0,
					autoStart: true,
					"in": {
						effect: "bounceIn",
						// effect: "bounceInDown",
						delayScale: 2.5,
						delay: 50,
						sync: false,
						shuffle: false,
						reverse: false
					},
					out: {
						effect: "bounceOut",
						// effect: "bounceOut",
						delayScale: 2.5,
						delay: 0,
						sync: false,
						shuffle: false,
						reverse: false
					}
				});
				typingTarget.data('textillate-ready', true);
			};
			var bootTyping = function() {
				if(typeof $.fn.textillate === 'function'){
					initTyping();
					return;
				}
				var loadTextillate = typeof $.fn.lettering === 'function'
					? _this.load_script('assets/js/cvtext1.js')
					: _this.load_script('assets/js/cvtext2.js').then(function() {
						return _this.load_script('assets/js/cvtext1.js');
					});
				loadTextillate
					.then(initTyping)
					.catch(function() {
						typingTarget.data('textillate-failed', true);
					});
			};
			_this.when_in_view(typingTarget.get(0), bootTyping, { rootMargin: '150px 0px' });
		}
	},
	/*------------------------------------------------------------------*/ 
	
	//about open details 
	about_opendetails: function() {
		if($('.icon').length > 0){
			$('.icon').on('click', function() {
				$('.about_leftsection').toggleClass('open_details');
			});
		}
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
				_this.load_script('assets/js/circle-progress.js')
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
				if(typeof mapContainer.vectorMap === 'function' && document.querySelector('link[href="assets/css/jquery-jvectormap-2.0.3.css"]')){
					return Promise.resolve();
				}
				var mapScriptLoader = typeof mapContainer.vectorMap === 'function'
					? Promise.resolve()
					: _this.load_script('assets/js/jquery-jvectormap.min.js')
						.then(function() {
							return _this.load_script('assets/js/jquery-jvectormap-world-mill.js');
						});
				return Promise.all([
					_this.load_style('assets/css/jquery-jvectormap-2.0.3.css'),
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
			var messages = {
				missingFields: 'Please complete the required fields.',
				waitBeforeSubmit: 'Please wait a moment and try again.',
				completeCaptcha: 'Please complete the security check.',
				captchaUnavailable: 'Security verification is temporarily unavailable. Please try again later.',
				genericError: 'Something went wrong. Please try again later.',
				success: 'Mail has been sent successfully.',
				invalidRule: 'Validation rule is not configured.'
			};
			var captchaScriptSrc = {
				recaptcha: 'https://www.google.com/recaptcha/api.js?render=explicit',
				hcaptcha: 'https://js.hcaptcha.com/1/api.js?render=explicit'
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
				return null;
			}
			function createCaptchaState(targetForm){
				var runtimeCaptcha = getRuntimeCaptchaConfig();
				var provider = (targetForm.attr('data-captcha-provider') || runtimeCaptcha.provider || '').toLowerCase().trim();
				var siteKey = (targetForm.attr('data-captcha-site-key') || runtimeCaptcha.siteKey || '').trim();
				var enabled = (provider === 'hcaptcha' || provider === 'recaptcha') && siteKey !== '';
				return {
					enabled: enabled,
					provider: provider,
					siteKey: siteKey,
					widgetId: null,
					readyPromise: null
				};
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
			function resetCaptcha(targetForm){
				var state = ensureCaptchaState(targetForm);
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
					widgetContainer.show();
					setCaptchaProvider(targetForm, state.provider);
					setCaptchaToken(targetForm, '');
					state.widgetId = api.render(widgetContainer[0], {
						sitekey: state.siteKey,
						callback: function(token){
							setCaptchaToken(targetForm, token);
						},
						'expired-callback': function(){
							setCaptchaToken(targetForm, '');
						},
						'error-callback': function(){
							setCaptchaToken(targetForm, '');
						}
					});
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
						widgetContainer.hide().empty();
					}
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
					});
				return state.readyPromise;
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
				ensureCaptchaReady(targetForm).catch(function(){
					var state = ensureCaptchaState(targetForm);
					state.enabled = false;
					targetForm.find('.contact_captcha_widget').hide().empty();
					setCaptchaProvider(targetForm, '');
					setCaptchaToken(targetForm, '');
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
						var token = getCaptchaToken(targetForm, captchaState);
						if(captchaState.enabled && token === ''){
							portfolio.track_event('contact_submit_blocked', {
								reason: 'captcha_missing'
							});
							setResponse(errroTarget, messages.completeCaptcha, 'error');
							_this.prop('disabled', false).removeAttr('aria-busy');
							return;
						}

						var formDetail = new FormData(targetForm[0]);
	    						formDetail.append('form_type' , _this.attr('data-type'));
						if(captchaState.enabled){
							formDetail.set('captcha_provider', captchaState.provider);
							formDetail.set('captcha_token', token);
						}
						portfolio.track_event('contact_submit_attempt', {
							captcha_enabled: captchaState.enabled ? '1' : '0'
						});

						$.ajax({
							method : 'post',
							url : 'ajax.php',
							data:formDetail,
							cache:false,
							contentType: false,
							processData: false
						}).done(function(resp){
							if(resp == 1){
								targetForm.find('input:not([type="hidden"])').val('');
								targetForm.find('textarea').val('');
								targetForm.find('input[name="website"]').val('');
								targetForm.find('.form-control').attr('aria-invalid', 'false');
								refreshStartTimestamp(targetForm);
								resetCaptcha(targetForm);
								setResponse(errroTarget, messages.success, 'success');
								portfolio.track_event('contact_submit_success', {
									captcha_enabled: captchaState.enabled ? '1' : '0'
								});
							}else{
								setResponse(errroTarget, messages.genericError, 'error');
								refreshStartTimestamp(targetForm);
								resetCaptcha(targetForm);
								portfolio.track_event('contact_submit_failure', {
									reason: 'server_rejected'
								});
							}
						}).fail(function(){
							setResponse(errroTarget, messages.genericError, 'error');
							refreshStartTimestamp(targetForm);
							resetCaptcha(targetForm);
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
	
	
	
	
	
	$(window).on('load', function() {
		if(portfolio.reduceMotion){
			$(".status").hide();
			$(".preloader").hide();
			return;
		}
		$(".status").fadeOut(1800);
		$(".preloader").delay(1000).fadeOut("slow");
	});
		
}(jQuery));	
