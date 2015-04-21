"use strict";
/**
 * Initialisation of Trainings App with configured file paths for the training samples
 */
window.onload = function() {
	/* training samples */
	var pinch = [
			"videos/pinch/t1.m4v",
			"videos/pinch/t2.m4v",
			"videos/pinch/t3.m4v",
			"videos/pinch/t4.m4v",
			"videos/pinch/t5.m4v",
			"videos/pinch/t6.m4v",
			"videos/pinch/t7.m4v",
			"videos/pinch/t8.m4v"
	];
	var zoom = [
			"videos/zoom/t1.m4v",
			"videos/zoom/t2.m4v",
			"videos/zoom/t3.m4v",
			"videos/zoom/t4.m4v",
			"videos/zoom/t5.m4v",
			"videos/zoom/t6.m4v",
			"videos/zoom/t7.m4v",
			"videos/zoom/t8.m4v",
			"videos/zoom/t9.m4v"
	];
	var rotateCW = [
			"videos/rotateCW/t1.m4v",
			"videos/rotateCW/t2.m4v",
			"videos/rotateCW/t3.m4v",
			"videos/rotateCW/t4.m4v",
			"videos/rotateCW/t5.m4v",
			"videos/rotateCW/t6.m4v",
			"videos/rotateCW/t7.m4v",
			"videos/rotateCW/t8.m4v",
			"videos/rotateCW/t9.m4v"
	];
	var rotateCCW = [
			"videos/rotateCCW/t1.m4v",
			"videos/rotateCCW/t2.m4v",
			"videos/rotateCCW/t3.m4v",
			"videos/rotateCCW/t4.m4v",
			"videos/rotateCCW/t5.m4v",
			"videos/rotateCCW/t6.m4v",
			"videos/rotateCCW/t7.m4v",
			"videos/rotateCCW/t8.m4v",
			"videos/rotateCCW/t9.m4v"
	];
	var swipeL = [
			"videos/swipeLeft/t1.m4v",
			"videos/swipeLeft/t2.m4v",
			"videos/swipeLeft/t3.m4v",
			"videos/swipeLeft/t4.m4v",
			"videos/swipeLeft/t5.m4v",
			"videos/swipeLeft/t6.m4v"
	];
	var swipeR = [
			"videos/swipeRight/t1.m4v",
			"videos/swipeRight/t2.m4v",
			"videos/swipeRight/t3.m4v",
			"videos/swipeRight/t4.m4v",
			"videos/swipeRight/t5.m4v",
			"videos/swipeRight/t6.m4v",
			"videos/swipeRight/t7.m4v"
	];
	var swipeU = [
			"videos/swipeUp/t1.m4v",
			"videos/swipeUp/t2.m4v",
			"videos/swipeUp/t3.m4v",
			"videos/swipeUp/t4.m4v",
			"videos/swipeUp/t5.m4v",
			"videos/swipeUp/t6.m4v",
			"videos/swipeUp/t7.m4v",
			"videos/swipeUp/t8.m4v",
			"videos/swipeUp/t9.m4v",
			"videos/swipeUp/t10.m4v",
			"videos/swipeUp/t11.m4v"
	];
	var swipeD = [
			"videos/swipeDown/t1.m4v",
			"videos/swipeDown/t2.m4v",
			"videos/swipeDown/t3.m4v",
			"videos/swipeDown/t4.m4v",
			"videos/swipeDown/t5.m4v",
			"videos/swipeDown/t6.m4v",
			"videos/swipeDown/t7.m4v",
			"videos/swipeDown/t8.m4v"
	];

	/* app */
	mt.train.app.run(
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
			}
		}, 
		{
			maxIterations : 3,
			numberOfMixtures : 1,
			calculateDiagonalCovariance : true,
			pi : [0.4, 0.3, 0.2, 0.1],
			a : [
					[0.34, 0.33, 0.33, 0.00],
					[0.00, 0.34, 0.33, 0.33],
					[0.00, 0.00, 0.50, 0.50],
					[0.00, 0.00, 0.00, 1.00]
				],
			b : [
					[0.25, 0.25, 0.25, 0.25],
					[0.25, 0.25, 0.25, 0.25],
					[0.25, 0.25, 0.25, 0.25],
					[0.25, 0.25, 0.25, 0.25]
				],
			mu : [],
			U : [],
			O : []
		},
		pinch
		//zoom
		//rotateCW
		//rotateCCW
		//swipeD
		//swipeU
		//swipeL
		//swipeR
	);

};