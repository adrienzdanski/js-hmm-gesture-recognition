"use strict";
/**
 * @class camera
 */
var mt = mt || {};
mt.core = mt.core || {};
mt.core.camera = (function () {
	var instance;
	/**
	 * Initialises the camera singleton and return its public methods
	 *
	 * @param {object} config - Configuration object
	 * @return {object}
	 */
	function setup(config) { // private
		/* member */
		var body = document.getElementsByTagName('body')[0];
		var streaming = false;
		var callback = null;

		var video = document.createElement('video');
		if(config.debug.displayCamera) {
			body.appendChild(video);
		}
		
		/**
		 * Retrieves and returns the UserMedia object based on the current browser
		 * 
		 * @return {object}
		 */
		var findBrowsersGetUserMedia = function() {
			return (
				navigator.getUserMedia ||
				navigator.webkitGetUserMedia ||
            	navigator.mozGetUserMedia ||
            	navigator.msGetUserMedia
            );
		};

		/**
		 * Processes the next camera frame and calls a registered callback
		 */
		var processNextFrame = function() {
			if(callback !== null) {
				callback();
			}
			requestAnimationFrame(processNextFrame);
		};

		navigator.getMedia = findBrowsersGetUserMedia();

		return { // public
			/**
			 * Starts the webcam capturing
			 */
			capture: function() {
				navigator.getMedia({ 
					video: true, 
					audio: false 
				}, function(stream) {
					if (navigator.mozGetUserMedia) { 
						video.mozSrcObject = stream;
					} else {
						var vendorURL = window.URL || window.webkitURL;
						video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
					}
					video.play();
					streaming = true;
				}, function(err) {
					console.log("ERROR: mt.core.camera - getMedia - " + err);
				});
			},
			/**
			 * Returns the current video object holding the webcam stream
			 * 
			 * @return {object}
			 */
			getVideo: function() {
				return video;
			}, 
			/**
			 * Returns the steaming state 
			 *
			 * @return {boolean}
			 */
			isStreaming: function() {
				return streaming;
			},
			/**
			 * Starts the webcam capturing loop
			 *
			 * @param {function} cb - Callback function
			 */
			loop: function(cb) {
				callback = cb;
				processNextFrame();
			}
		};
	};
 
	return {
		/**
		 * Initialises the camera singleton and returns its instance
		 *
		 * @param {object} config - Configuration object
		 * @return {object}
		 */
		getInstance: function (config) {
			if (!instance) {
				instance = setup(config);
			}
			return instance;
		}
	};
})();