/*
 * jQuery memorable - 4/7/2012
 * 
 * Remembers position and size of elements (elements presumed to be movable and/or resizable
 * via methods such as jquery-ui's draggable and resizable
 *
 * This plugin uses HTML5 persistence or cookies, as available.  Do not use unless you expect
 * your users to allow the use of the same.
 * 
 * If using size remembering, you MUST include the jquery-throttle-debounce plugin
 * (https://github.com/cowboy/jquery-throttle-debounce) prior to including this plug-in.  Otherwise,
 * in many browsers, resize event (and resultant disk access) will occur many more times than is
 * while the element is being resized.  This plugin uses debounce to ensure that this happens only
 * once (after the user has finished resizing).
 *
 * @author Mark E. Fraser
 * @copyright Copyright (c) 2012 Mark E. Fraser
 * @license Dual licensed under the MIT and GPL licenses.
 * @version v0.5
 */
(function($){
	$.fn.memorable = function(options) {
		var defaults = {
			rememberPosition : true,
			rememberSize : true,
			expiry : 30,
			dataPrefix : "",
			cookiePath : "/",
			forceCookies : false,
			debug : false
		},
		
		settings = $.extend({}, defaults, options);

		if (settings.rememberSize && !$.isFunction($.debounce))
		{
			if (window.console)
			{
				console.log("FATAL: The jquery-memorable plugin size memory requires the debounce plugin " +
					"available at https://github.com/cowboy/jquery-throttle-debounce");
				return this;
			}
		}
		this.each(function() {
			var $this = $(this);
			var debug = window.console && settings.debug;
			var useCookies = settings.forceCookies || (!localStorage);
			
			if (debug) {
				console.log("memorable instantiated on item '#" + this.id + "' using " + ((useCookies) ? "cookie " : "localStorage ") + " mechanism");
			}
			//data prefix - it is recommended to either set the prefix for each element or give each one a unique id
			var datap = (settings.dataPrefix.length > 0) ? settings.dataPrefix : (this.id || "mmb");
			//restoration variables - We always restore regardless of the remember* settings, as there
			//would presumably be no reason to call the memorable method if doing neither
			var storedTop, storedLeft, storedWidth, storedHeight;
			//we're only restoring in pairs
			var tKey = datap + "_top";
			var lKey = datap + "_left";
			var hKey = datap + "_height";
			var wKey = datap + "_width";
			
			//restoration
			storedTop = (useCookies) ? $.cookie(tKey) : localStorage[tKey];
			if (storedTop) {
				storedLeft = (useCookies) ? $.cookie(lKey) : localStorage[lKey];
				if (storedLeft) {
					$this.offset({ top: storedTop, left: storedLeft});
					if (debug) {
						console.log("restored position of item '#" + this.id + "' to top: " + storedTop + " left: " + storedLeft);
					}
				}
			}
			else {
				if (debug) {
					console.log("no memory of position found for item '#" + this.id + "'");
				}
			}
			storedWidth = (useCookies) ? $.cookie(wKey) : localStorage[wKey];
			if (storedWidth) {
				storedHeight = (useCookies) ? $.cookie(hKey) : localStorage[hKey];
				if (storedHeight) {
					$this.width(storedWidth);
					$this.height(storedHeight);
				}
				if (debug) {
					console.log("restored size of item '#" + this.id + "' to width: " + storedWidth + " height: " + storedHeight);
				}
			}
			
			//storage
			if (settings.rememberPosition) {
				$this.bind("dragstop", function() {
					if (useCookies) {
						cookieOptions = { expires: settings.expiry, path: settings.cookiePath };
						$.cookie(tKey, $this.position().top, cookieOptions);
						$.cookie(lKey, $this.position().left, cookieOptions);
					}
					else {
						localStorage[tKey] = $this.position().top;
						localStorage[lKey] = $this.position().left;
					}
					if (debug) {
						console.log("stored position of item '#" + this.id + "' top: " + $this.position().top + " left: " + $this.position().left);
					}
				});
			}
			
			if (settings.rememberSize) {
				$this.resize( $.debounce( 500, function () {
					if (useCookies) {
						cookieOptions = { expires: settings.expiry, path: settings.cookiePath };
						$.cookie(wKey, $this.width(), cookieOptions);
						$.cookie(hKey, $this.height(), cookieOptions);
					}
					else {
						localStorage[wKey] = $this.width();
						localStorage[hKey] = $this.height();
					}
					if (debug) {
						console.log("stored size of item '#" + this.id + "' width: " + $this.width() + " height: " + $this.height());
					}
				}));
			}
		});
		return this;
	}
}) (jQuery);