"use strict";
/**
 * @class Validation App
 */
var mt = mt || {};
mt.validate = mt.validate || {};
mt.validate.app = (function () {
	var instance;
	/**
	 * Initialises Validation App and returns defined public methods
	 *
	 * @param {object} cfg - Configuration for validation
	 * @return {object}
	 */
	function initialize(cfg) { // private
		/* variables for configuration */
		var useLog = true;
		var config = cfg;
		var hmm = config.hmm;
		var samples = config.samples;

		/* validation */
		var matchingTable = {};
		var confusionMatrix = [];
		var results = [];
		var beforeProcess = true;
		var actualPredictedComparision = [];

		/* references to singleton classes */
		var video = mt.core.video.getInstance(config);
		var calibration = mt.core.calibration.getInstance(config);
		var imageProcessor = mt.core.imageprocessor.getInstance(config);
		var featureGenerator = mt.feature.feature.getInstance(config);
		var viterbi = mt.recognize.viterbi.getInstance();

		/* variables for feature extraction */
		var calibrated = false;
		var interval;
		var intervalDuration = 1000;
		var calibrationStartTime = 1.0;
		var sampleStartTime = 4.0;
		var nextSampleTime = 0;
		var calibrationDuration = 4.0;
		var videoDuration = 0;
		var videoNumber = 0;
		var sampleInterval = 0;
		var numberOfSamples = 8; //15;

		/* variables for canvas object and drawing */
		var pos = 0;
		var pad = 10;
		var destCanvas = document.createElement('canvas');
		var destContext = destCanvas.getContext('2d');
		var srcCanvas = featureGenerator.getFeatureCanvas();
		var dist = srcCanvas.width;
		destCanvas.width = (dist + pad) * numberOfSamples;
		destCanvas.height = srcCanvas.height;
		var canvasList = [];

		/* validation output */
		var out = document.getElementById("validation");

		/**
		 * Clones a canvas object
		 *
		 * @param {object} src - canvas object
		 * @return {canvas object}
		 */
		var cloneCanvas = function(src) {
			var c = document.createElement('canvas');
			c.width = src.width;
			c.height = src.height;
			var ctx = c.getContext('2d');
			ctx.scale(0.5, 0.5);
			ctx.drawImage(src, 0, 0);

			return c;
		};
		/**
		 * Draws the confusion matrix
		 *
		 * @param {array[][]} m - Confusion matrix
		 */
		var drawConfusionTable = function(m) {
			var container = document.getElementById('validation');

			var tbl = document.createElement('table');
			tbl.style.width = '100%';
			tbl.style.border = '1px solid black';
			tbl.style.borderCollapse = "collapse";
			tbl.setAttribute('border','0');
			var tbdy = document.createElement('tbody');

			for(var i = 0; i < m.length; i++) {
				/* add first row */
				if(i == 0) {
					var trHeader = document.createElement('tr');
					trHeader.style.fontWeight = 'bold';
					for (var x = 0; x < m.length + 1; x++) {
						var td = document.createElement('td');
						td.style.border = '1px solid black';
						if(x == 0) {
							td.appendChild(document.createTextNode("(v) actual / predicted (>)"));
						} else {
							td.appendChild(document.createTextNode(hmm[x - 1].label));
						}
						trHeader.appendChild(td);
					}
					tbdy.appendChild(trHeader);
				} 
				/* add second row to N */
			    var tr = document.createElement('tr');
			    for(var j = 0; j < m[i].length; j++) {
			    	var tdFirst = document.createElement('td');
			    	tdFirst.style.border = '1px solid black';
			    	tdFirst.style.fontWeight = 'bold';
			    	if(j == 0) {
			    		tdFirst.appendChild(document.createTextNode(hmm[i].label));
			    		tr.appendChild(tdFirst);
			    	} 
			    	var td = document.createElement('td');
			    	td.style.border = '1px solid black';
			    	if(i === j) {
			    		td.style.fontWeight = 'bold';
			    		td.style.color = 'blue';
			    	}
			    	td.appendChild(document.createTextNode(m[i][j]));
			        tr.appendChild(td);
			    }
			    tbdy.appendChild(tr);
			}
			tbl.appendChild(tbdy);

			var headline = document.createElement('h5');
			headline.appendChild(document.createTextNode("Confusion Matrix"));
			container.appendChild(headline);
			container.appendChild(tbl);
		};
		/**
		 * Draws precision and recall table
		 *
		 * @param {array[][]} m - Confusion matrix
		 */
		var drawPrecisionRecallTable = function(m) {
			var container = document.getElementById('validation');

			var tbl = document.createElement('table');
			tbl.style.width = '100%';
			tbl.style.border = '1px solid black';
			tbl.style.borderCollapse = "collapse";
			tbl.setAttribute('border','0');
			var tbdy = document.createElement('tbody');

			for(var i = 0; i < m.length; i++) {
				/* add first row */
				if(i == 0) {
					var trHeader = document.createElement('tr');
					trHeader.style.fontWeight = 'bold';
					var td1 = document.createElement('td');
					td1.style.border = '1px solid black';
					td1.appendChild(document.createTextNode(""));
					trHeader.appendChild(td1);
					var td2 = document.createElement('td');
					td2.style.border = '1px solid black';
					td2.appendChild(document.createTextNode("Precision"));
					trHeader.appendChild(td2);
					var td3 = document.createElement('td');
					td3.style.border = '1px solid black';
					td3.appendChild(document.createTextNode("Recall"));
					trHeader.appendChild(td3);
					tbdy.appendChild(trHeader);
				}

				/* calculate precision and recall */
				var index = i;
				var truePositive = m[index][index];
				var conditionPositive = 0;
				var testOutcomePositive = 0;

				/* calculate conditionPositive */
				for(var x = 0; x < m.length; x++) {
					for(var y = 0; y < m[x].length; y++) {
						if(x == index) {
							conditionPositive += m[x][y];
						}
					}
				}

				/* calculate testOutcomePositive */
				for(var x = 0; x < m.length; x++) {
					for(var y = 0; y < m[x].length; y++) {
						if(y == index) {
							testOutcomePositive += m[x][y];
						}
					}
				}

				/* calculate precision */
				var precision = 0;
				if(testOutcomePositive !== 0) {
					precision = truePositive / testOutcomePositive;
				}

				/* calculate recall */
				var recall = 0;
				if(conditionPositive !== 0) {
					recall = truePositive / conditionPositive;
				}

				/* add second row to N */
			    var tr = document.createElement('tr');
			    var tdFirst = document.createElement('td');
			    tdFirst.style.border = '1px solid black';
			    tdFirst.style.fontWeight = 'bold';
			    tdFirst.appendChild(document.createTextNode(hmm[i].label));
			    tr.appendChild(tdFirst);

			    var tdPrecision = document.createElement('td');
			    tdPrecision.style.border = '1px solid black';
			    tdPrecision.appendChild(document.createTextNode(precision));
			    tr.appendChild(tdPrecision);
			    var tdRecall = document.createElement('td');
			    tdRecall.style.border = '1px solid black';
			    tdRecall.appendChild(document.createTextNode(recall));
			    tr.appendChild(tdRecall);
			    
			    tbdy.appendChild(tr);
			}
			tbl.appendChild(tbdy);

			var headline = document.createElement('h5');
			headline.appendChild(document.createTextNode("Precision and Recall"));
			container.appendChild(headline);
			container.appendChild(tbl);
		};
		/**
		 * Draws the list of extracted samples of video files
		 */
		var drawSampleList = function() {
			var list = document.getElementById('sample-list');
			if(list) {
				list.parentNode.removeChild(list);
			}
			
			var container = document.getElementById('list');
			
			var ol = document.createElement('ol');
			ol.id = "sample-list";
			for(var i = 0; i < results.length; i++) {
				var li = document.createElement('li');

				var ul = document.createElement('ul');
				var li2 = document.createElement('li');
				li2.style.fontWeight = 'bold';
				var result = document.createTextNode(results[i].label + " -> " + results[i].match + " ( " + results[i].probability + " ) ");
				li2.appendChild(result);
				ul.appendChild(li2);

				/* add feature canvas to list */
				if(canvasList[i]) {
					var liCanvas = document.createElement('li');
					liCanvas.style.fontWeight = 'bold';
					liCanvas.appendChild(canvasList[i]);
					ul.appendChild(liCanvas);
				}
				
				if(actualPredictedComparision[i]) {
					for(var y = 0; y < actualPredictedComparision[i].length; y++) {
						var li3 = document.createElement('li');
						var item = document.createTextNode("--- " + actualPredictedComparision[i][y].predicted + " : " + actualPredictedComparision[i][y].probability);
						li3.appendChild(item);
						ul.appendChild(li3);
					}
				}
				
				li.appendChild(ul);
				ol.appendChild(li);
			}

			container.appendChild(ol);
		};
		/**
		 * Initialises the matching table and the confusion matrix
		 */
		var initVars = function() {
			for(var i = 0; i < hmm.length; i++) {
				var label = hmm[i].label;
				matchingTable[label] = i;
			}

			for(var x = 0; x < hmm.length; x++) {
				confusionMatrix[x] = [];
				for(var y = 0; y < hmm.length; y++) {
					confusionMatrix[x][y] = 0;
				}
			}
			drawConfusionTable(confusionMatrix);
			drawPrecisionRecallTable(confusionMatrix);
		};
		initVars();

		/**
		 * Displays the calibration canvas
		 */
		var displayCalibrationCanvas = function() {
			if(!config.isCalibrated) {
				calibration.displayCalibration(video.getVideo());
			}
		};

		/**
		 * Calibrates the HSV-Values based on the current input video
		 */
		var calibrate = function() {
			if(calibrated === false && video.getCurrentTime() >= calibrationStartTime) {
				calibration.calibrate();
				calibrated = true;
			}
		};
		/**
		 * Draws feature vector and calculates new offset
		 */
		var updateFeatureCanvas = function() {
			destContext.drawImage(srcCanvas, pos, 0);
			pos = pos + dist + pad;
		};
		/**
		 * Resets the feature canvas and drawing position
		 */
		var resetFeatureCanvas = function() {
			destContext.clearRect (0, 0, destCanvas.width, destCanvas.height);
			pos = 0;
		}
		/**
		 * Calculates and stores extracted features of current validation video
		 *
		 * @param {object} features - stores extracted features
		 */
		var pushFeature = function(features) { /* by reference */
			if(calibrated && video.getCurrentTime() >= nextSampleTime && features.length < numberOfSamples) {
				nextSampleTime += sampleInterval;
				imageProcessor.process(video.getVideo());
				var feature = featureGenerator.process(imageProcessor.getPixels());
				features.push(feature);
				updateFeatureCanvas();
			} 
		};
		/**
		 * Starts the processing loop
		 *
		 * @param {object} label - Label of current validation sample
		 */
		var processVideo = function(label) {
			results.push({label: label, match: "", probability: 0 });
			var features = [];
			imageProcessor.setup(video.getVideo());
			video.loop(function() {
				/* print video list without results */
				drawSampleList();
				/* process */
				displayCalibrationCanvas();
				calibrate();
				pushFeature(features);
			}, function() {
				validateObservations(label, features);
			});
		};
		/**
		 * Calculates the different durations and intervals of the video file
		 */
		var calculateSampleTime = function() {
			videoDuration = video.getDuration();
			videoDuration -= calibrationDuration;
			sampleInterval = videoDuration / numberOfSamples;
			nextSampleTime = sampleStartTime;
		};
		/**
		 * Calculates the model with the highest probability and updates the confusion matrix
		 *
		 * @param {object} filelabel - Label of current validation video
		 * @param {object} features - Extracted feature vectors of current validation video
		 */
		var validateObservations = function(filelabel, features) {
			/* calculate probabilities for current sample */
			var probabilities = [];
			for(var i = 0; i < hmm.length; i++) {
				probabilities.push(viterbi.recognize(features, hmm[i], useLog));
			}

			/* find best fitting model */
			var maxProb = 0;

			if(useLog) {
				maxProb = -Number.MAX_VALUE;
			}
			var label = "none";
			var allObservations = [];
			for(var j = 0; j < probabilities.length; j++) {
				allObservations.push({
					actual: filelabel, 
					predicted: probabilities[j].label, 
					probability: probabilities[j].probability
				});

				/* check if value is infinity and set probability to lowest possible number */
				if (probabilities[j].probability == Number.POSITIVE_INFINITY || probabilities[j].probability == Number.NEGATIVE_INFINITY) {
				    probabilities[j].probability = Number.MIN_VALUE;
				}
				if(probabilities[j].probability > maxProb) {
					maxProb = probabilities[j].probability;
					label = probabilities[j].label;
				}
			}
			actualPredictedComparision.push(allObservations);
			/* compare given label of current video with calculated label of best fitting model */
			confusionMatrix[matchingTable[filelabel]][matchingTable[label]] += 1;
			updateConfusionMatrix(confusionMatrix);

			/* print video list with result */
			results[results.length - 1].match = label;
			results[results.length - 1].probability = maxProb;

			canvasList.push(cloneCanvas(destCanvas));
			drawSampleList();
			resetFeatureCanvas();
		};
		/**
		 * Updates confusion matrix and precision / recall table
		 *
		 * @param {object} cm - Confusion matrix
		 */
		var updateConfusionMatrix = function(cm) {
			document.getElementById('validation').innerHTML = "";
			drawConfusionTable(cm);
			drawPrecisionRecallTable(cm);
		};

		/**
		 * Start of the validation process
		 */
		interval = setInterval(function() {
			if(videoNumber < samples.length) {
				var isStreaming = video.isStreaming();
				if(isStreaming == false) {
					calibrated = false;
					var currentVideo = samples[videoNumber].file
					var currentLabel = samples[videoNumber].label
					video.setSource(
						currentVideo,
						function() {
							calculateSampleTime();
							video.start();
							processVideo(currentLabel);
						}
					);
					videoNumber++;
				}
			} else {
				clearInterval(interval);
			}
		}, intervalDuration);
		

		return { // public
			
		};
	};
 
	return {
		/**
		 * Initialises the validation routine and returns a reference to the singleton
		 *
		 * @param {object} config - Configuration for validation
		 * @return {object}
		 */
		run: function (config) {
			if (!instance) {
				instance = initialize(config);
			}
			return instance;
		}
	};
})();