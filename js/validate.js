"use strict";
/**
 * Initialisation of the Validation App with configured validation samples
 */
window.onload = function() {
	var samplesAll = [
		{ label: "pinch", file: "videos/pinch/v1.m4v" },
		{ label: "pinch", file: "videos/pinch/v2.m4v" },
		{ label: "pinch", file: "videos/pinch/v3.m4v" },
		{ label: "pinch", file: "videos/pinch/v4.m4v" },
		{ label: "pinch", file: "videos/pinch/v5.m4v" },
		{ label: "pinch", file: "videos/pinch/v6.m4v" },
		{ label: "pinch", file: "videos/pinch/v7.m4v" },
		{ label: "pinch", file: "videos/pinch/v8.m4v" },

		{ label: "zoom", file: "videos/zoom/v1.m4v" },
		{ label: "zoom", file: "videos/zoom/v2.m4v" },
		{ label: "zoom", file: "videos/zoom/v3.m4v" },
		{ label: "zoom", file: "videos/zoom/v4.m4v" },
		{ label: "zoom", file: "videos/zoom/v5.m4v" },
		{ label: "zoom", file: "videos/zoom/v6.m4v" },
		{ label: "zoom", file: "videos/zoom/v7.m4v" },
		{ label: "zoom", file: "videos/zoom/v8.m4v" },

		{ label: "rotateCW", file: "videos/rotateCW/v1.m4v" },
		{ label: "rotateCW", file: "videos/rotateCW/v2.m4v" },
		{ label: "rotateCW", file: "videos/rotateCW/v3.m4v" },
		{ label: "rotateCW", file: "videos/rotateCW/v4.m4v" },
		{ label: "rotateCW", file: "videos/rotateCW/v5.m4v" },
		{ label: "rotateCW", file: "videos/rotateCW/v6.m4v" },
		{ label: "rotateCW", file: "videos/rotateCW/v7.m4v" },
		{ label: "rotateCW", file: "videos/rotateCW/v8.m4v" },

		{ label: "rotateCCW", file: "videos/rotateCCW/v1.m4v" },
		{ label: "rotateCCW", file: "videos/rotateCCW/v2.m4v" },
		{ label: "rotateCCW", file: "videos/rotateCCW/v3.m4v" },
		{ label: "rotateCCW", file: "videos/rotateCCW/v4.m4v" },
		{ label: "rotateCCW", file: "videos/rotateCCW/v5.m4v" },
		{ label: "rotateCCW", file: "videos/rotateCCW/v6.m4v" },
		{ label: "rotateCCW", file: "videos/rotateCCW/v7.m4v" },
		{ label: "rotateCCW", file: "videos/rotateCCW/v8.m4v" },

		{ label: "swipeDown", file: "videos/swipeDown/v1.m4v" },
		{ label: "swipeDown", file: "videos/swipeDown/v2.m4v" },
		{ label: "swipeDown", file: "videos/swipeDown/v3.m4v" },
		{ label: "swipeDown", file: "videos/swipeDown/v4.m4v" },
		{ label: "swipeDown", file: "videos/swipeDown/v5.m4v" },
		{ label: "swipeDown", file: "videos/swipeDown/v6.m4v" },
		{ label: "swipeDown", file: "videos/swipeDown/v7.m4v" },
		{ label: "swipeDown", file: "videos/swipeDown/v8.m4v" },

		{ label: "swipeUp", file: "videos/swipeUp/v1.m4v" },
		{ label: "swipeUp", file: "videos/swipeUp/v2.m4v" },
		{ label: "swipeUp", file: "videos/swipeUp/v3.m4v" },
		{ label: "swipeUp", file: "videos/swipeUp/v4.m4v" },
		{ label: "swipeUp", file: "videos/swipeUp/v5.m4v" },
		{ label: "swipeUp", file: "videos/swipeUp/v6.m4v" },
		{ label: "swipeUp", file: "videos/swipeUp/v7.m4v" },
		{ label: "swipeUp", file: "videos/swipeUp/v8.m4v" },

		{ label: "swipeLeft", file: "videos/swipeLeft/v1.m4v" },
		{ label: "swipeLeft", file: "videos/swipeLeft/v2.m4v" },
		{ label: "swipeLeft", file: "videos/swipeLeft/v3.m4v" },
		{ label: "swipeLeft", file: "videos/swipeLeft/v4.m4v" },
		{ label: "swipeLeft", file: "videos/swipeLeft/v5.m4v" },
		{ label: "swipeLeft", file: "videos/swipeLeft/v6.m4v" },
		{ label: "swipeLeft", file: "videos/swipeLeft/v7.m4v" },
		{ label: "swipeLeft", file: "videos/swipeLeft/v8.m4v" },

		{ label: "swipeRight", file: "videos/swipeRight/v1.m4v" },
		{ label: "swipeRight", file: "videos/swipeRight/v2.m4v" },
		{ label: "swipeRight", file: "videos/swipeRight/v3.m4v" },
		{ label: "swipeRight", file: "videos/swipeRight/v4.m4v" },
		{ label: "swipeRight", file: "videos/swipeRight/v5.m4v" },
		{ label: "swipeRight", file: "videos/swipeRight/v6.m4v" },
		{ label: "swipeRight", file: "videos/swipeRight/v7.m4v" },
		{ label: "swipeRight", file: "videos/swipeRight/v8.m4v" }
	];
	var samplesReduced = [
		{ label: "pinch", file: "videos/pinch/v1.m4v" },
		{ label: "pinch", file: "videos/pinch/v2.m4v" },
		{ label: "pinch", file: "videos/pinch/v3.m4v" },
		{ label: "pinch", file: "videos/pinch/v4.m4v" },
		{ label: "pinch", file: "videos/pinch/v5.m4v" },
		{ label: "pinch", file: "videos/pinch/v6.m4v" },
		{ label: "pinch", file: "videos/pinch/v7.m4v" },
		{ label: "pinch", file: "videos/pinch/v8.m4v" },

		{ label: "rotateCW", file: "videos/rotateCW/v1.m4v" },
		{ label: "rotateCW", file: "videos/rotateCW/v2.m4v" },
		{ label: "rotateCW", file: "videos/rotateCW/v3.m4v" },
		{ label: "rotateCW", file: "videos/rotateCW/v4.m4v" },
		{ label: "rotateCW", file: "videos/rotateCW/v5.m4v" },
		{ label: "rotateCW", file: "videos/rotateCW/v6.m4v" },
		{ label: "rotateCW", file: "videos/rotateCW/v7.m4v" },
		{ label: "rotateCW", file: "videos/rotateCW/v8.m4v" },

		{ label: "swipeUp", file: "videos/swipeUp/v1.m4v" },
		{ label: "swipeUp", file: "videos/swipeUp/v2.m4v" },
		{ label: "swipeUp", file: "videos/swipeUp/v3.m4v" },
		{ label: "swipeUp", file: "videos/swipeUp/v4.m4v" },
		{ label: "swipeUp", file: "videos/swipeUp/v5.m4v" },
		{ label: "swipeUp", file: "videos/swipeUp/v6.m4v" },
		{ label: "swipeUp", file: "videos/swipeUp/v7.m4v" },
		{ label: "swipeUp", file: "videos/swipeUp/v8.m4v" },

		{ label: "swipeLeft", file: "videos/swipeLeft/v1.m4v" },
		{ label: "swipeLeft", file: "videos/swipeLeft/v2.m4v" },
		{ label: "swipeLeft", file: "videos/swipeLeft/v3.m4v" },
		{ label: "swipeLeft", file: "videos/swipeLeft/v4.m4v" },
		{ label: "swipeLeft", file: "videos/swipeLeft/v5.m4v" },
		{ label: "swipeLeft", file: "videos/swipeLeft/v6.m4v" },
		{ label: "swipeLeft", file: "videos/swipeLeft/v7.m4v" },
		{ label: "swipeLeft", file: "videos/swipeLeft/v8.m4v" },
	];
	mt.validate.app.run(
		{
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
			hmm: mt.models,
			samples: samplesReduced
		}
	);

};