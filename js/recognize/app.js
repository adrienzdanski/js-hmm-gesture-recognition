"use strict";
/**
 * @class Recognition App
 */
var mt = mt || {};
mt.recognize = mt.recognize || {};
mt.recognize.app = (function () {
	var instance;
	/**
	 * Initialises the recognition application and returns its public methods
	 *
	 * @param {object} cfg - Configuration object
	 * @return {object}
	 */
	function initialize(cfg) { // private
		/* initialize members */
		var useLog = true;
		var config = cfg;
		var hmm = config.hmm;

		/* singleton instances */
		var camera = mt.core.camera.getInstance(config);
		var calibration = mt.core.calibration.getInstance(config);
		var imageProcessor = mt.core.imageprocessor.getInstance(config);
		var featureGenerator = mt.feature.feature.getInstance(config);
		var viterbi = mt.recognize.viterbi.getInstance();

		var noOfSamples = 8; //15.0;
		var intervalTime = 200.0 / noOfSamples;
		var observations = [];
		var probabilities = [];


		var result = document.getElementById("result");
		var vectors = document.getElementById("vectors");
		var vectorsStr = "";

		/**
		 * Displays hint for begin of gesture execution
		 */
		var displayHint = function() {
			vectors.style.borderLeft = "15px solid green";
		};
		/**
		 * Resets hint for gesture execution
		 */
		var removeHint = function() {
			vectors.style.borderLeft = "15px solid red";
		};
		/**
		 * Transforms vector to string and displays vector in textarea
		 *
		 * @param {array} vec - vector
		 */
		var pushVectorsStr = function(vec) {
			vectorsStr += vec.toString();
			vectorsStr += "<br/>";
			vectors.innerHTML = vectorsStr;
		};
		/**
		 * Resets vector display
		 */
		var clearVectorsStr = function() {
			vectorsStr = "";
			vectors.innerHTML = vectorsStr;
		};
		/**
		 * Processes the current observed feature vectors and calculates the most probable model with the viterbi algorithm
		 *
		 * @param {array} obs - One observed feature vector
		 */
		var processObservation = function(obs) {
			displayHint();
			pushVectorsStr(obs);
			observations.push(obs);
			if(observations.length === noOfSamples) {
				/* calculate probability for each HMM-model */
				for(var i = 0; i < hmm.length; i++) {
					probabilities.push(viterbi.recognize(observations, hmm[i], useLog));
				}
				
				/* output gesture and probability */
				var output = document.getElementById("debug");
				var outputText = '<div class="row">';
				var maxProb = 0;

				if(useLog) {
					maxProb = -Number.MAX_VALUE;
				}
				var label = 'none';
				var callback;

				for(var j = 0; j < probabilities.length; j++) {
					outputText += '<div style="float: left; width: 20%;">' + probabilities[j].label + '</div>'
					outputText += '<div style="float: left; width: 20%;">' + probabilities[j].probability + "</div>";
					outputText += '<div style="clear:both;"></div>';

					/* check if value is infinity and set probability to lowest possible number */
					if (probabilities[j].probability == Number.POSITIVE_INFINITY || probabilities[j].probability == Number.NEGATIVE_INFINITY) {
					    probabilities[j].probability = Number.MIN_VALUE;
					}
					if(probabilities[j].probability > maxProb) {
						maxProb = probabilities[j].probability;
						callback = probabilities[j].callback;
						label = probabilities[j].label;
					}
				}
				outputText += "</div>";
				output.innerHTML = outputText;
				result.innerHTML = label + " ( " + maxProb + " ) ";

				/* call registered callback */
				if(callback) {
					callback();
				}

				/* reset observations & probabilities */
				observations = [];
				probabilities = [];

				/* clear display */
				removeHint();
				clearVectorsStr();
			}
		}

		/* members for FPS-calculation */
		var filterStrength = 20;
		var frameTime = 0;
		var lastLoop = new Date
		var thisLoop;
		var fpsDisplay = document.getElementById('fps');

		/**
		 * Starts the capturing of the webcam and the gesture recognition
		 */
		camera.capture();
		imageProcessor.setup(camera.getVideo());
		camera.loop(function() {
			/* calculate fps */
			var thisFrameTime = (thisLoop=new Date) - lastLoop;
  			frameTime+= (thisFrameTime - frameTime) / filterStrength;
  			lastLoop = thisLoop;

    		/* display calibration window */
			if(!config.isCalibrated) {
				calibration.displayCalibration(camera.getVideo());
			}

			/* process features */
			imageProcessor.process(camera.getVideo());
			var observation = featureGenerator.process(imageProcessor.getPixels());
			
			var timeout = setTimeout(function() {
				processObservation(observation);
			}, intervalTime);
		});

		/* fps output */
		var fpsOut = document.getElementById('fps');
		setInterval(function(){
			fpsOut.innerHTML = (1000/frameTime).toFixed(1) + " fps";
		},1000);

		return { // public
			
		};
	};
 
	return {
		/**
		 * Initialises the Recognition App and returns its instance
		 *
		 * @param {object} config - Configuration object
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