"use strict";
/**
 * @class video
 */
var mt = mt || {};
mt.core = mt.core || {};
mt.core.video = (function () {
	var instance;
	function setup(config) { // private
		/* members */
		var body = document.getElementsByTagName('body')[0];
		var streaming = false;
		var callback = null;
		var finishedCallback = null;

		var duration = 0;
		var video = document.createElement('video');
		if(config.debug.displayCamera) {
			body.appendChild(video);
		}
		/* event listener for video ended */
		video.onended = function(e) {
			streaming = false;
			if(finishedCallback !== null) {
				finishedCallback();
			}
	    };
		/**
		 * Processes next captured frame and call bound callback function
		 */
		var processNextFrame = function() {
			if(callback !== null) {
				callback();
			}
			if(streaming) {
				requestAnimationFrame(processNextFrame);
			}
		};

		return { // public
			/**
			 * Set the video source and start processing loop
			 *
			 * @param {object} src - Source of the video element
			 * @param {function} callback - Callback function 
			 */
			setSource: function(src, callback) {
				video.src = src;
				/* delay start of video until metadata is loaded (duration) */
				var interval = setInterval(function(){
					if (video.readyState > 0) {
						duration = video.duration;
						clearInterval(interval);
						callback();
					}
				},500);
			},
			/**
			 * Play video and start streaming
			 */
			start: function() {
				video.play();
				streaming = true;
			},
			/**
			 * Return current video element
			 * 
			 * @return {object}
			 */
			getVideo: function() {
				return video;
			}, 
			/**
			 * Get the current playtime of the video element
			 *
			 * @return {object}
			 */
			getCurrentTime: function() {
				return video.currentTime;
			},
			/**
			 * Return the video duration
			 *
			 * @return {number}
			 */
			getDuration: function() {
				return duration;
			},
			/**
			 * Return the streaming state
			 * 
			 * @return {boolean}
			 */
			isStreaming: function() {
				return streaming;
			},
			/**
			 * Sets the callback functions for the processing and starts the processing loop
			 *
			 * @param {function} cb - Callback function for each loop iteration
			 * @param {function} fcb - Callback function after loop was terminated
			 */
			loop: function(cb, fcb) {
				callback = cb;
				finishedCallback = fcb;
				processNextFrame();
			}
		};
	};
 
	return {
		/**
		 * Initialises and returns the instance of the video singleton class
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