"use strict";

/**
 * Initialisation of Recognition App
 */
window.onload = function() {
	mt.recognize.app.run({
		width: 640,
		height: 480,
		isCalibrated: false,
		recognitionValues: {
			minH: 0.6,
			maxH: 9.0,
			minS: 0.1,
			maxS: 9.8,
			minV: 0.5,
			maxV: 2.0
		},
		debug: {
			displayCamera: false,
			displayCalibration: true,
			displayImageprocessor: false,
			displayFeature: true
		},
		hmm: mt.models
	});
};