"use strict";
/**
 * @class convexHull
 * 
 * Algorithms for convex hulls, convex defects and contours are based on:
 * https://code.google.com/hosting/moved?project=js-handtracking
 */
var mt = mt || {};
mt.feature = mt.feature || {};
mt.feature.convexHull = (function () {
	var instance;
	/**
	 * Initialises the convexHull singleton and returns its public methods
	 *
	 * @param {object} config - Configuration object
	 * @return {object}
	 */
	function setup(config) { // private
		var tracker = new HT.Tracker(config.width, config.height);
		var candidate;
		var boundingBox;

		/**
		 * Convert RGBA to binary and returns binary image
		 *
		 * @param {object} data - RGBA values
		 * @return {object}
		 */
		var channel4To1 = function(data) {
			var binary = [];
			for(var i = 0; i < data.length; i += 4) {
				if(data[i] >= 255 && data[i + 1] >= 255 && data[i + 2] >= 255) {
					binary.push(255);
				} else {
					binary.push(0);
				}
			}
			return binary;
		};
		/**
		 * Calculate the bounding box of the given candidate and return the bounding box
		 *
		 * @param {object} cand - Candidate, tracked object
		 * @return {object}
		 */
		var calculateBoundingBox = function(cand) {
			if(cand) {
				var boundingBox = makeCircle(cand.contour);
				boundingBox.rectX = boundingBox.x - boundingBox.r;
				boundingBox.rectY = boundingBox.y - boundingBox.r;
				boundingBox.size = boundingBox.r + boundingBox.r;
				return boundingBox;
			} else {
				return null;
			}
		};

		return { // public
			/**
			 * Calculate the candidate (object) from binary image and return the candidate
			 *
			 * @param {object} data - RGBA data of the canvas object
			 * @return {object}
			 */
			calculateCandidate: function(data) {
				var binary = channel4To1(data);
				candidate = tracker.detect(binary);
				boundingBox = calculateBoundingBox(candidate);
				if(candidate) {
					return {
						boundingBox: boundingBox,	// r, x, y, rectX, rectY, size
						contour: candidate.contour, // x, y
						hull: candidate.hull,		// x, y
						defects: candidate.defects  // depth, depthPoint(x,y), end(x,y), start(x,y)
					}
				} else {
					return null;
				}
			},
			/**
			 * Draw the bounding box of the candidate to given canvas context
			 *
			 * @param {object} context - Drawing context of a canvas object
			 */
			drawBoundingBox: function(context) {
				if(boundingBox) {
					var x = boundingBox.x - boundingBox.r;
					var y = boundingBox.y - boundingBox.r;
					var size = boundingBox.r + boundingBox.r;
					context.beginPath();
					context.rect(x, y, size, size);
					context.strokeStyle = 'yellow';
					context.stroke();
				}
			},
			/**
			 * Draw the contour of the candidate to given canvas context
			 *
			 * @param {object} context - Drawing context of a canvas object
			 */
			drawContour: function(context) {
				if(candidate) {
					var lastContourPoint = candidate.contour[0];
					for(var i = 1; i < candidate.contour.length; i++) {
						var point = candidate.contour[i]; 

						context.beginPath();
						context.moveTo(lastContourPoint.x, lastContourPoint.y);
						context.lineTo(point.x, point.y);
						context.strokeStyle = 'blue';
						context.stroke();

						lastContourPoint = point;
					}
				}
			},
			/**
			 * Draw the convex hull of the candidate to given canvas context
			 *
			 * @param {object} context - Drawing context of a canvas object
			 */
			drawHull: function(context) {
				if(candidate) {
					var lastHullPoint = candidate.hull[0];
					for(var i = 1; i < candidate.hull.length; i++) {
						var point = candidate.hull[i]; 

						context.beginPath();
						context.moveTo(lastHullPoint.x, lastHullPoint.y);
						context.lineTo(point.x, point.y);
						context.strokeStyle = 'red';
						context.stroke();

						lastHullPoint = point;
					}
				}
			},
			/**
			 * Draw the convex defects of the candidate to given canvas context
			 *
			 * @param {object} context - Drawing context of a canvas object
			 */
			drawDefects: function(context) {
				if(candidate) {
					for(var i = 0; i < candidate.defects.length; i++) {
						var defect = candidate.defects[i];

						context.beginPath();
						context.rect(defect.depthPoint.x, defect.depthPoint.y, 15, 15);
						context.fillStyle = 'red';
						context.fill();

						context.beginPath();
						context.rect(defect.start.x, defect.start.y, 15, 15);
						context.fillStyle = 'blue';
						context.fill();

						context.beginPath();
						context.rect(defect.end.x, defect.end.y, 15, 15);
						context.fillStyle = 'green';
						context.fill();
					}
				}
			}
		};
	};
 
	return {
		/**
		 * Initialises and returns the instance of the convexHull singleton class
		 *
		 * @param {object} config - Configuration object
		 * @return {number}
		 */
		getInstance: function (config) {
			if (!instance) {
				instance = setup(config);
			}
			return instance;
		}
	};
})();