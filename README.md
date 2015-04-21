# js-hmm-gesture-recognition
=============================
Trainable Gesture-Recognition based on Hidden Markov Models using JavaScript, WebGL and WebRTC. 

System-Requirements: 
- Latest Google Chrome
- WebGL and WebRTC support
- Connected webcam

1. Training (train.html)
========================
To train the HMMs, videos of sample gestures are used (videos/**/tXX.m4v). For the prototype the corresponding videos are located in the videos folder. The result is a HMM representing the equivalent gesture. The training configuration is found in the "js/train.js" file.

2. Recognition (recognize.html)
===============================
The recognition process is based on the trained models which are configured in "js/models.js". To calibrate your skin tone hover your hand in front of your webcam filling the rectangular area in the live preview. A click on the canvas of the live preview recalculates the HSV values of your skin. Better results are achived under different lighting conditions. 

3. Validation (validate.html)
=============================
The validation process uses independent validation samples and calculates matches between the underlying models and validation videos (videos/**/vXX.m4v).

About
-----
* Author:            Adrien Zdanski
* Web Site:          http://pixelsmithy.de
* Github Repo:       http://github.com/adrienzdanski/js-hmm-gesture-recognition
