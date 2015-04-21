"use strict";
/**
 * @class feature
 */
var mt = mt || {};
mt.feature = mt.feature || {};
mt.feature.feature = (function () {
	var instance;
	/**
	 * Initialises the feature singleton and returns public methods
	 *
	 * @param {object} config - Configuration object
	 * @return {object}
	 */
	function setup(config) { // private
		/* members */
		var body = document.getElementsByTagName('body')[0];
		var canvas = document.createElement('canvas');
		canvas.width = config.width;
		canvas.height = config.height;
		body.appendChild(canvas);
		var featureVectorSize = 10;
		var scaleFactor = 100.0;
		var stepFactor = 20.0;
		var widthCanvasFeature = featureVectorSize * stepFactor; //110;
		var heightCanvasFeature = scaleFactor;
		var canvasFeature = document.createElement('canvas');
		canvasFeature.width = widthCanvasFeature;
		canvasFeature.height = heightCanvasFeature;
		canvasFeature.id = 'canvasFeature';
		body.appendChild(canvasFeature);
		var context = canvas.getContext("2d");
		var contextFeature = canvasFeature.getContext("2d");
		var background = context.createImageData(config.width, config.height);
		var convexHullUtil = mt.feature.convexHull.getInstance(config);
		var featureVector = [];

		/**
		 * Initialises the feature vector
		 */
		var initFeatureVector = function() {
			for(var i = 0; i < featureVectorSize; i++) {
				featureVector.push(0);
			}
		};
		initFeatureVector();


		/**
		 * Resets and returns the feature vector
		 * 
		 * @return {object}
		 */
		var resetFeatureVector = function() {
			var arr = [];
			for(var i = 0; i < featureVectorSize; i++) {
				arr.push(0);
			}
			return arr;
		}
		/**
		 * Set the background of the canvas context
		 *
		 * @param {string} data - Data attribute string
		 */
		var setBackground = function(data) {
    		background.data.set(data);
    		context.putImageData(background, 0, 0);
		};
		/**
		 * Calculate and return the bounding box of given points
		 *
		 * @param {array} arr - Array of points
		 * @param {object} boundingBox - Bounding box of convex hull
		 * @return {object}
		 */
		var calculateBound = function(arr, boundingBox) {
			var minX = canvas.width; 
			var maxX = 0; 
			var minY = canvas.height;
			var maxY = 0;

			for(var i = 0; i < arr.length; i++) {
				if(arr[i].x < minX) {
					minX = arr[i].x;
				}
				if(arr[i].x > maxX) {
					maxX = arr[i].x;
				}
				if(arr[i].y < minY) {
					minY = arr[i].y;
				}
				if(arr[i].y > maxY) {
					maxY = arr[i].y;
				}
			}

			var minPoint = normalize({x: minX, y: minY}, boundingBox);
			var maxPoint = normalize({x: maxX, y: maxY}, boundingBox);

			return {
				minX : minPoint.x,
				maxX : maxPoint.x, 
				minY : minPoint.y,
				maxY : maxPoint.y
			};
		};
		/**
		 * Calculate and return the median point
		 *
		 * @param {array} arr - Array of points
		 * @return {object}
		 */
		var calculateMedianPoint = function(arr) {
			var medianX = 0;
			var medianY = 0;
			for(var i = 0; i < arr.length; i++) {
				medianX += arr[i].x;
				medianY += arr[i].y;
			}
			return { 
				x: medianX / arr.length,
				y: medianY / arr.length
			};
		};
		/**
		 * Normalize the x- and y-coordinates of the given point based on the bounding box
		 *
		 * @param {object} point - Point object
		 * @param {objejct} boundingBox - Corresponding bounding box
		 * @return {object}
		 */
		var normalize = function(point, boundingBox) {
			var minX = boundingBox.rectX;
			var maxX = boundingBox.rectX + boundingBox.size;
			var minY = boundingBox.rectY;
			var maxY = boundingBox.rectY + boundingBox.size;

			var normX = (point.x - minX) / (maxX - minX);
			var normY = (point.y - minY) / (maxY - minY);
			return {
				x: normX,
				y: normY
			};
		};
		/**
		 * Draw a barchart visualization of the feature vector
		 */
		var drawFeatureVector = function() {
			contextFeature.beginPath();
			contextFeature.rect(0, 0, widthCanvasFeature, heightCanvasFeature);
			contextFeature.fillStyle = 'white';
			contextFeature.fill();
			for(var i = 0; i < featureVector.length; i++) {
				contextFeature.beginPath();
				var x = i * stepFactor;
				var y = heightCanvasFeature - (featureVector[i] * scaleFactor); //0;
				var w = stepFactor;
				var h = heightCanvasFeature; //featureVector[i] * scaleFactor;
				contextFeature.rect(x, y, w, h);
				contextFeature.fillStyle = 'rgb(' + Math.floor(50 + 5 * i).toString() + ',0,0)';
				contextFeature.fill();

				/* debug */
				if(i == 2 || i == 4 || i == 6 || i == 8 || i == 10 || i == 14 || i == 16 || i == 17 || i == 21 || i == 25) {
					contextFeature.beginPath();
					contextFeature.rect(i * stepFactor, 0, 1, heightCanvasFeature);
					contextFeature.fillStyle = 'gray';
					contextFeature.fill();
				}
				/* 
				console.log('#####################')
				console.log('DEPTH       median (x,y): ', featureVector[0], featureVector[1]);
				console.log('START       median (x,y): ', featureVector[2], featureVector[3]);
				console.log('END         median (x,y): ', featureVector[4], featureVector[5]);
				console.log('CONTOUR     median (x,y): ', featureVector[6], featureVector[7]);
				console.log('HULL        median (x,y): ', featureVector[8], featureVector[9]);
				console.log('OUTER BOUND min/max(x,y): ', featureVector[10], featureVector[11], featureVector[12], featureVector[13]);
				console.log('OUTER BOUND    diff(x,y): ', featureVector[14], featureVector[15]);
				console.log('OUTER BOUND    	 area: ', featureVector[16]);
				console.log('DEPTH       min/max(x,y): ', featureVector[17], featureVector[18], featureVector[19], featureVector[20]);
				console.log('START       min/max(x,y): ', featureVector[21], featureVector[22], featureVector[23], featureVector[24]);
				console.log('END         min/max(x,y): ', featureVector[25], featureVector[26], featureVector[27], featureVector[28]);
				/* debug */
			}
		};

		return { // public
			/**
			 * Return the feature canvas
			 *
			 * @return {object}
			 */
			getFeatureCanvas: function() {
				return canvasFeature;
			},
			/**
			 * Generate features and return feature vector
			 *
			 * @param {string} data - Data attribute string
			 * @return {array}
			 */
			process: function(data) {
				context.clearRect(0, 0, config.width, config.height);
				setBackground(data);

				/* features consist of:
					boundingBox: r, x, y, rectX, rectY, size
					contour: x, y
					hull: x, y
					defects: depth, depthPoint(x,y), end(x,y), start(x,y)
				*/
				var features = convexHullUtil.calculateCandidate(data);

				if(features) {
					/* defect features */
					var defectDepthPoints = [];
					var defectStartPoints = [];
					var defectEndPoints = [];
					var depthSum = 0;
					for(var i = 0; i < features.defects.length; i++) {
						defectDepthPoints.push(features.defects[i].depthPoint);
						defectStartPoints.push(features.defects[i].start);
						defectEndPoints.push(features.defects[i].end);
						depthSum += features.defects[i].depth;
					}
					depthSum /= features.defects.length;
					depthSum = normalize(depthSum, features.boundingBox);

					var medianPointDepthPoints = normalize(calculateMedianPoint(defectDepthPoints), features.boundingBox);
					var medianPointStartPoints = normalize(calculateMedianPoint(defectStartPoints), features.boundingBox);
					var medianPointEndPoints = normalize(calculateMedianPoint(defectEndPoints), features.boundingBox);
					var minMaxDepthPoints = calculateBound(defectDepthPoints, features.boundingBox);
					var minMaxStartPoints = calculateBound(defectStartPoints, features.boundingBox);
					var minMaxEndPoints = calculateBound(defectEndPoints, features.boundingBox);
					var medianPointContour = normalize(calculateMedianPoint(features.contour), features.boundingBox);
					var medianPointHull = normalize(calculateMedianPoint(features.hull), features.boundingBox);
					var outerBound = calculateBound(features.contour, features.boundingBox);

					featureVector = [
						//depthSum,
						medianPointDepthPoints.x,
						medianPointDepthPoints.y,
						//0, //medianPointStartPoints.x,
						//0, //medianPointStartPoints.y,
						//0, //medianPointEndPoints.x,
						//0, //medianPointEndPoints.y,
						medianPointContour.x,
						medianPointContour.y,
						medianPointHull.x,
						medianPointHull.y,
						//0, //outerBound.minX,
						//0, //outerBound.maxX,
						//0, //outerBound.minY,
						//0, //outerBound.maxY,
						outerBound.maxX - outerBound.minX,
						outerBound.maxY - outerBound.minY,
						(outerBound.maxX - outerBound.minX) * (outerBound.maxY - outerBound.minY),
						//0, //minMaxDepthPoints.minX,
						//0, //minMaxDepthPoints.maxX,
						//0, //minMaxDepthPoints.minY,
						(minMaxDepthPoints.maxX - minMaxDepthPoints.minX) * (minMaxDepthPoints.maxY - minMaxDepthPoints.minY), //minMaxDepthPoints.maxY,
						//0, //minMaxStartPoints.minX,
						//0, //minMaxStartPoints.maxX,
						//0, //minMaxStartPoints.minY,
						//0, //minMaxStartPoints.maxY,
						//0, //minMaxEndPoints.minX,
						//0, //minMaxEndPoints.maxX,
						//0, //minMaxEndPoints.minY,
						//(minMaxDepthPoints.maxX - minMaxDepthPoints.minX) * (minMaxDepthPoints.maxY - minMaxDepthPoints.minY) //minMaxEndPoints.maxY
					];					
				} else {
					featureVector = resetFeatureVector();
				}
				
				/* debug */
				convexHullUtil.drawBoundingBox(context);
				convexHullUtil.drawContour(context);			
				convexHullUtil.drawHull(context);
				convexHullUtil.drawDefects(context);
				drawFeatureVector();	

				return featureVector;
			}
		};
	};
 
	return {
		/**
		 * Initialises and returns the instance of the feature singleton class
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