"use strict";
/**
 * @class calibration
 */
var mt = mt || {};
mt.core = mt.core || {};
mt.core.calibration = (function () {
	var instance;
	/**
	 * Initialises the calibration singleton and returns its public methods
	 *
	 * @param {object} config - Configuration object
	 * @return {object}
	 */
	function setup(config) { // private
		/* members */
		var HUDEnabled = true;

		var size = 100;
		var originX = config.width / 2.0;
		var originY = config.height / 2.0;
		var calibRectX = originX - size / 2.0;
		var calibRectY = originY - size / 2.0;
		var roi;

		var minValue = 0;
		var maxValue = 1;
		var minH = maxValue;
		var maxH = minValue;
		var minS = maxValue;
		var maxS = minValue;
		var minV = maxValue;
		var maxV = minValue;

		var hsvArr = [];

		var body = document.getElementsByTagName('body')[0];

		var canvas = document.createElement('canvas');
		canvas.width = config.width;
		canvas.height = config.height;
		var context = canvas.getContext('2d');
		
		/**
		 * Displays calibration canvas if enabled
		 *
		 * @param {object} element - Destination element to add the calibration canvas to
		 * @param {object} elementToAdd - The calibration canvas to add
		 * @param {boolean} displayCalibration - If true, calibration canvas is displayed
		 * @return {object}
		 */
		var displayCalibrationCanvas = function(element, elementToAdd, displayCalibration) {
			if(displayCalibration) {
				element.appendChild(elementToAdd);
			}
		};

		/**
		 * Resets HSV values
		 */
		var resetHSV = function() {
			minH = maxValue;
			maxH = minValue;
			minS = maxValue;
			maxS = minValue;
			minV = maxValue;
			maxV = minValue;
		};
		/**
		 * Convert RGB to HSV and return HSV object.
		 * Based on: http://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript
		 *
		 * @param {object} arguments - RGB value
		 * @return {object}
		 */
		var rgb2hsv = function() {
		    var rr, gg, bb,
		        r = arguments[0] / 255,
		        g = arguments[1] / 255,
		        b = arguments[2] / 255,
		        h, s,
		        v = Math.max(r, g, b),
		        diff = v - Math.min(r, g, b),
		        diffc = function(c){
		            return (v - c) / 6 / diff + 1 / 2;
		        };

		    if (diff == 0) {
		        h = s = 0;
		    } else {
		        s = diff / v;
		        rr = diffc(r);
		        gg = diffc(g);
		        bb = diffc(b);

		        if (r === v) {
		            h = bb - gg;
		        }else if (g === v) {
		            h = (1 / 3) + rr - bb;
		        }else if (b === v) {
		            h = (2 / 3) + gg - rr;
		        }
		        if (h < 0) {
		            h += 1;
		        }else if (h > 1) {
		            h -= 1;
		        }
		    }
		    return {
		        h: h, //Math.round(h * 360),
		        s: s, //Math.round(s * 100),
		        v: v //Math.round(v * 100)
		    };
		};
		/**
		 * Calibrate the HSV values of the current frame and store the result in the configuration
		 */
		var calibrate = function() {
			resetHSV();

			hsvArr = [];
			for(var i = 0; i < roi.data.length; i+=4) {
				var r = roi.data[i];
				var g = roi.data[i + 1];
				var b = roi.data[i + 2];
				var a = roi.data[i + 3];
				hsvArr.push(rgb2hsv(r, g, b));
			}

			for(var i = 0; i < hsvArr.length; i++) {
				var h = hsvArr[i].h;
				var s = hsvArr[i].s;
				var v = hsvArr[i].v;

				if(h < minH) {
					minH = h;
				}
				if(h > maxH) {
					maxH = h;
				}
				if(s < minS) {
					minS = s;
				}
				if(s > maxS) {
					maxS = s;
				}
				if(v < minV) {
					minV = v;
				}
				if(v > maxV) {
					maxV = v;
				}
			}

			config.recognitionValues = {
				minH: minH,
				maxH: maxH,
				minS: minS,
				maxS: maxS,
				minV: minV,
				maxV: maxV
			};
		};
		/**
		 * Add click event listener for manual calibration purposes
	 	 */
		canvas.addEventListener ('click', calibrate);

		/* init calibration canvas */
		displayCalibrationCanvas(body, canvas, config.debug.displayCalibration);

		return { // public
			/**
			 * Display calibration canvas with current calibrated HSV values
			 *
			 * @param {object} video - Current video frame
			 */
			displayCalibration: function(video) {
				context.drawImage(video, 0, 0, config.width, config.height);

				/* draw calibration rectangle */
				if(HUDEnabled) {
					context.rect(calibRectX - 1, calibRectY - 1, size + 2, size + 2);
					context.stroke();
				}

				roi = context.getImageData(calibRectX, calibRectY, size, size);

				/* write values to canvas */
				if(HUDEnabled) {
					context.font="10px Arial";
					context.fillText("Click canvas for calibration.", 10, 10);
					context.fillText("minH: " + minH, 10, 20);
					context.fillText("maxH: " + maxH, 10, 30);
					context.fillText("minS: " + minS, 10, 40);
					context.fillText("maxS: " + maxS, 10, 50);
					context.fillText("minV: " + minV, 10, 60);
					context.fillText("maxV: " + maxV, 10, 70);
				}
			},
			/**
			 * Toggle the HUD of the calibration canvas
			 */
			toggleHUD: function() {
				HUDEnabled = !HUDEnabled;
			},
			/**
			 * Calibrate HSV values for current frame
			 */
			calibrate: function() {
				calibrate();
			}
		};
	};
 
	return {
		/**
		 * Initialises the calibration singleton class and return its instance
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