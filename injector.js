console.log('Adding Chromecast injector');

var code = function() {
	// Listen for the event where the ID is sent to this injected
	// script, and store it for when the Chromecast extension is
	// initialized.
	var injectedId = null;
	window.addEventListener('message', function(evt) {
		if(evt.data.injectedChromecastAppId) {
			injectedId = evt.data.injectedChromecastAppId;
		}
	}, false);

	// Set a "dynamic" property on the window to override the API available
	// function for Chromecast.
	// 
	// Essentially, we wrap the old function to inject our new ID instead of whatever
	// was actually supposed to be passed. This allows us to override Plex's
	// app ID and use our own.
    Object.defineProperty(window, '__onGCastApiAvailable', {
		get: function() {
			chrome.cast.SessionRequest = (function($parent) {
				var SessionRequest = function() {
					if(injectedId != null || injectedId.trim() == '') {
						console.log('Injecting the new APP-ID for Chromecast (Old: ' + 
							arguments[0] + ', New: ' + injectedId + ')');

						arguments[0] = injectedId;
					} else {
						alert('The Chromecast APP-ID was not injected for high bitrate playback or it was not configured.');
					}

					$parent.constructor.apply(this, arguments);
				};

				SessionRequest.prototype = $parent;

				return SessionRequest;
			})(chrome.cast.SessionRequest.prototype);

			return window.____onGCastApiAvailable;
		},

		set: function(a) {
			window.____onGCastApiAvailable = a;
		}
	});
};

// Inject the script into the page so that we have access to the same window
// as the Plex web application
var script = document.createElement('script');
script.textContent = '(' + code + ')()';
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

// Retrieve the local settings and post the message to the injected
// script
chrome.storage.sync.get({
	injectedChromecastId: null
}, function(items) {
	window.postMessage({
		injectedChromecastAppId: items.injectedChromecastId
	}, "*");
});