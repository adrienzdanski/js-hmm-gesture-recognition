"use strict";
/**
 * @class Trainings App
 */
var mt = mt || {};
mt.train = mt.train || {};
mt.train.app = (function () {
	var instance;
	/**
	 * Initialises the trainings routine and returns object of public methods
	 *
	 * @param {object} cfg - Configuration for training
	 * @param {object} hmmCfg - Configured HMM for reestimation process
	 * @param {object} videoSrc - List of training files
	 * @return {object}
	 */
	function initialize(cfg, hmmCfg, videoSrc) { // private
		/* initialize members */
		var config = cfg;
		var configHMM = hmmCfg;
		var source = videoSrc;

		/* references to singleton classes */
		var video = mt.core.video.getInstance(config);
		var calibration = mt.core.calibration.getInstance(config);
		var imageProcessor = mt.core.imageprocessor.getInstance(config);
		var featureGenerator = mt.feature.feature.getInstance(config);

		/* variables for capturing training features */
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

		/* output */
		var textareaVector = document.getElementById("vector");

		/**
		 * Displays the calibration canvas
		 */
		var displayCalibrationCanvas = function() {
			if(!config.isCalibrated) {
				calibration.displayCalibration(video.getVideo());
			}
		};

		/**
		 * Calibrates the HSV-Values of the current trainings video
		 */
		var calibrate = function() {
			if(calibrated === false && video.getCurrentTime() >= calibrationStartTime) {
				textareaVector.value += "-> Calibration of Video " + videoNumber + "\n";
				calibration.calibrate();
				calibrated = true;
			}
		};
		/**
		 * Generates and stores the features of the current video file
		 *
		 * @param {object} features - stores the generated features 
		 */
		var pushFeature = function(features) { /* by reference */
			if(calibrated && video.getCurrentTime() >= nextSampleTime && features.length < numberOfSamples) {
				nextSampleTime += sampleInterval;
				imageProcessor.process(video.getVideo());
				var feature = featureGenerator.process(imageProcessor.getPixels());
				features.push(feature);

				/* sample output */
				textareaVector.value += JSON.stringify(feature);
			}		
		};
		/**
		 * Writes generated observations to the HMM config
		 *
		 * @param {object} features - observed features of current video
		 */
		var saveSampledFeaturesOfCurrentVideo = function(features) {
			textareaVector.value += "\n-> End of Video " + videoNumber;
			textareaVector.value += "\n#############################\n";
			configHMM.O.push(features);
		}
		/**
		 * Starts the video processing loop and trains HMM after all training videos were processed
		 */
		var processVideo = function() {
			var features = [];
			imageProcessor.setup(video.getVideo());
			video.loop(function() {
				displayCalibrationCanvas();
				calibrate();
				pushFeature(features);
			}, function() {
				saveSampledFeaturesOfCurrentVideo(features);
				trainHMM();
			});
		};
		/**
		 * Calculates the different intervals for the video processing
		 */
		var calculateSampleTime = function() {
			videoDuration = video.getDuration();
			videoDuration -= calibrationDuration;
			sampleInterval = videoDuration / numberOfSamples;
			nextSampleTime = sampleStartTime;
		};
		/**
		 * Starts the training of the HMM and prints the model to the console
		 */
		var trainHMM = function() {
			if(configHMM.O.length === source.length) {
				var hmm = mt.train.hmm.getInstance(configHMM);
				hmm.train();
				hmm.getModel();
			}
		};

		/**
		 * Start of the trainings process
		 */
		interval = setInterval(function() {
			if(videoNumber < source.length) {
				var isStreaming = video.isStreaming();
				if(isStreaming == false) {
					calibrated = false;
					video.setSource(
						source[videoNumber++],
						function() {
							textareaVector.value += "\n### Features of Sample " + videoNumber + " ###\n"
							calculateSampleTime();
							video.start();
							processVideo();
						}
					);
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
		 * Initializes the trainings routine and returns a reference to the singleton
		 *
		 * @param {object} config - Configuration for training
		 * @param {object} hmmConfig - Configured HMM for reestimation process
		 * @param {object} videoSource - List of training files
		 * @return {object}
		 */
		run: function (config, hmmConfig, videoSource) {
			if (!instance) {
				instance = initialize(config, hmmConfig, videoSource);
			}
			return instance;
		}
	};
})();