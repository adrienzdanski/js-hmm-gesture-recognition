"use strict";
/**
 * @class imageprocessor
 */
var mt = mt || {};
mt.core = mt.core || {};
mt.core.imageprocessor = (function () {
	var instance;
	/**
	 * Initialises the imageprocessor class and returns its public methods
	 *
	 * @param {object} config - Configuration object
	 * @return {object}
	 */
	function setup(config) { // private
		var config = config;
		/* gl context */
		var gl;

		/* programs */
		var programBlurH;
		var programBlurV;
		var programSegmentate;
		var programErode;
		var programDilate;
		var programEdge;

		/* shaders */
		var vsBase;
		var fsBlurH;
		var fsBlurV;
		var fsSegmentate;
		var fsErode;
		var fsDilate;
		var fsEdge;

		/* vertex variables */
		var vertexBuffer;
		var indexBuffer;
		var textureCoordBuffer;
		var vertexPositionAttribute;
		var textureCoordAttribute;
		
		/* textures */
		var cameraTexture;

		/* framebuffer & textures */
		var segmentateFBO;
  		var segmentateTexture;
  		var blurHFBO;
  		var blurHTexture;
  		var blurVFBO;
  		var blurVTexture;
  		var erodeFBO;
  		var erodeTexture;
  		var dilateFBO;
  		var dilateTexture;
  		var edgeFBO;
  		var edgeTexture;
  		var tempFBO;
  		var tempTexture;

  		/* features */
  		var pixelValues = new Uint8Array(config.width * config.height * 4);

		/* init */
		var body = document.getElementsByTagName('body')[0];
		var width = config.width;
		var height = config.height;
		
		/* create canvas and append */
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		if(config.debug.displayImageprocessor) {
			body.appendChild(canvas);
		}
		
		/**
		 * Sets basic WebGL configurations
		 */
		var setupGLConfig = function() {
			gl.clearColor(1.0, 1.0, 1.0, 1.0);
			gl.frontFace(gl.CCW);
			gl.enable(gl.CULL_FACE);
			gl.cullFace(gl.BACK);
		};
		/**
		 * Initialises the WebGL context
		 */
		var initGl = function() {
			gl = WebGLDebugUtils.makeDebugContext(createGLContext(canvas));
			gl.disable(gl.DEPTH_TEST);
    		gl.enable(gl.BLEND);
    		gl.viewport(0,0,config.width, config.height);
		};
		/**
		 * Tries to create a WebGL context and returns it, if successfull
		 *
		 * @param {object} canvas - Configuration object
		 * @return {object}
		 */
		var createGLContext = function(canvas) {
			var names = ['webgl', 'experimental-webgl'];
			var context = null;
			for(var i = 0; i < names.length; i++) {
				try {
					context = canvas.getContext(names[i], {preserveDrawingBuffer: true});
				} catch(e) { /* error handling */ }

				if(context) { break; }
			}
			if(context) {
				context.viewportWidth = canvas.width;
				context.viewportHeight = canvas.height;
			} else {
				alert("Failed to create WebGL context!");
			}
			return context;
		};
		/**
		 * Loads a shader from the HTML DOM, creates a shader object and compiles the shader.
		 * Returns the resulting shader object. 
		 *
		 * @param {string} id - ID of the HTML DOM element holding the shader source code
		 * @return {object}
		 */
		var loadShaderFromDOM = function(id) {
			var shaderScript = document.getElementById(id);
			// exit if not found
			if(!shaderScript) { return null; }
			// loop through shader code lines
			var shaderSource = "";
			var currentChild = shaderScript.firstChild;
			while(currentChild) {
				if(currentChild.nodeType == 3) { // 3 = TEXT_NODE
					shaderSource += currentChild.textContent;
				}
				currentChild = currentChild.nextSibling;
			}

			var shader;
			if(shaderScript.type == "x-shader/x-fragment") {
				shader = gl.createShader(gl.FRAGMENT_SHADER);
			} else if(shaderScript.type == "x-shader/x-vertex") {
				shader = gl.createShader(gl.VERTEX_SHADER);
			} else {
				return null;
			}

			gl.shaderSource(shader, shaderSource);
			gl.compileShader(shader);

			if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				alert(gl.getShaderInfoLog(shader));
				return null;
			}
			return shader;
		};
		/**
		 * Initialises the different buffer objects for the vertices, indeces and texture coordinates
		 */
		var setupBuffers = function() {
			/* vertices */
			vertexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
			var vertices = [
				-1.0, -1.0, 0.0,
				1.0, -1.0, 0.0,
				1.0, 1.0, 0.0,
				-1.0, 1.0, 0.0
			];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

			/* indices */
			indexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
			var vertexIndices = [
				0, 1, 2,
				0, 2, 3
			];
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);

			/* textures */
			textureCoordBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

			var textureCoordinates = [
				0.0, 0.0,
				1.0, 0.0,
				1.0, 1.0,
				0.0, 1.0
			];
  			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
		};
		/**
		 * Setup camera texture and bind camera to created texture object
		 */
		var setupVideoTexture = function() {
			cameraTexture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, cameraTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red
		};
		/**
		 * Updates the bound camera texture
		 *
		 * @param {object} video - Video object of bound webcam or video object
		 */
		var updateVideoTexture = function(video) {
			gl.bindTexture(gl.TEXTURE_2D, cameraTexture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
			configTextureParameters();
			gl.bindTexture(gl.TEXTURE_2D, null);
		};
		/**
		 * Sets basic configuration for current bound texture object
		 */
		var configTextureParameters = function() {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		};
		/**
		 * Initialises framebuffer objects, bound texture and renderbuffer
		 *
		 * @param {object} fbo - Framebuffer object
		 * @param {object} tex - Texture
		 * @param {number} w - Width of texture
		 * @param {number} h - Height of texture
		 */
		var setupFBO = function(fbo, tex, w, h) {
			var renderbuffer = gl.createRenderbuffer();

		    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

		    gl.bindTexture(gl.TEXTURE_2D, tex);
		    configTextureParameters();
		    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);

		    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
		    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

		    gl.bindTexture(gl.TEXTURE_2D, null);
    		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		};
		/**
		 * Attaches vertex- and fragment-shader to the shader program
		 *
		 * @param {object} program - Shader program
		 * @param {object} vs - Vertex shader
		 * @param {object} fs - Fragment shader
		 * @return {object}
		 */
		var setupShader = function(program, vs, fs) {
			gl.attachShader(program, vs);
			gl.attachShader(program, fs);
			gl.linkProgram(program);

			if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				alert("Failed to setup shaders");
			}

			vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
			gl.enableVertexAttribArray(vertexPositionAttribute);

			textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
  			gl.enableVertexAttribArray(textureCoordAttribute);
		};

		/**
		 * Setup horizontal blur framebuffer object and texture
		 */
		function setupBlurHorizontalFBO() {
  			blurHFBO = gl.createFramebuffer();
  			blurHTexture = gl.createTexture();
  			setupFBO(blurHFBO, blurHTexture, width, height);
  		}
  		/**
		 * Setup vertical blur framebuffer object and texture
		 */
  		function setupBlurVerticalFBO() {
  			blurVFBO = gl.createFramebuffer();
  			blurVTexture = gl.createTexture();
  			setupFBO(blurVFBO, blurVTexture, width, height);
  		}
  		/**
		 * Setup segmentation framebuffer object and texture
		 */
		function setupSegmentateFBO() {
  			segmentateFBO = gl.createFramebuffer();
  			segmentateTexture = gl.createTexture();
  			setupFBO(segmentateFBO, segmentateTexture, width, height);
  		}
  		/**
		 * Setup erode framebuffer object and texture
		 */
  		function setupErodeFBO() {
  			erodeFBO = gl.createFramebuffer();
  			erodeTexture = gl.createTexture();
  			setupFBO(erodeFBO, erodeTexture, width, height);
  		}
  		/**
		 * Setup dilate framebuffer object and texture
		 */
  		function setupDilateFBO() {
  			dilateFBO = gl.createFramebuffer();
  			dilateTexture = gl.createTexture();
  			setupFBO(dilateFBO, dilateTexture, width, height);
  		}
  		/**
		 * Setup sobel framebuffer object and texture
		 */
  		function setupEdgeFBO() {
  			edgeFBO = gl.createFramebuffer();
  			edgeTexture = gl.createTexture();
  			setupFBO(edgeFBO, edgeTexture, width, height);
  		}
  		/**
		 * Setup temporary framebuffer object and texture
		 */
  		function setupTempFBO() {
  			tempFBO = gl.createFramebuffer();
  			tempTexture = gl.createTexture();
  			setupFBO(tempFBO, tempTexture, width, height);
  		}

  		/**
		 * Setup horizontal blur shader
		 */
  		function setupBlurHorizontalShader() {
			vsBase = loadShaderFromDOM("vs-base");
			fsBlurH = loadShaderFromDOM("fs-blurH");
			programBlurH = gl.createProgram();
			setupShader(programBlurH, vsBase, fsBlurH);
		}
		/**
		 * Setup vertical blur shader
		 */
		function setupBlurVerticalShader() {
			vsBase = loadShaderFromDOM("vs-base");
			fsBlurV = loadShaderFromDOM("fs-blurV");
			programBlurV = gl.createProgram();
			setupShader(programBlurV, vsBase, fsBlurV);
		}
		/**
		 * Setup segmentation shader
		 */
		function setupSegmentateShader() {
			vsBase = loadShaderFromDOM("vs-base");
			fsSegmentate = loadShaderFromDOM("fs-segmentate");
			programSegmentate = gl.createProgram();
			setupShader(programSegmentate, vsBase, fsSegmentate);
		}
		/**
		 * Setup erode shader
		 */
		function setupErodeShader() {
			vsBase = loadShaderFromDOM("vs-base");
			fsErode = loadShaderFromDOM("fs-erode");
			programErode = gl.createProgram();
			setupShader(programErode, vsBase, fsErode);
		}
		/**
		 * Setup dilate shader
		 */
		function setupDilateShader() {
			vsBase = loadShaderFromDOM("vs-base");
			fsDilate = loadShaderFromDOM("fs-dilate");
			programDilate = gl.createProgram();
			setupShader(programDilate, vsBase, fsDilate);
		}
		/**
		 * Setup sobel shader
		 */
		function setupEdgeShader() {
			vsBase = loadShaderFromDOM("vs-base");
			fsEdge = loadShaderFromDOM("fs-edge");
			programEdge = gl.createProgram();
			setupShader(programEdge, vsBase, fsEdge);
		}
		/**
		 * Process current bound shader program
		 *
		 * @param {object} program - Shader program
		 * @param {object} texture - Current texture to render to
		 * @param {object} fbo - Framebuffer object, if null, draw to display
		 */
		function processProgram(program, texture, fbo) { 
			/* bind fbo & set program */
			gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  			gl.useProgram(program);

  			/* clear framebuffer */
			gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
			gl.clear(gl.COLOR_BUFFER_BIT);

			/* draw vertices */
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
			gl.vertexAttribPointer(vertexPositionAttribute, 3 /* item size */, gl.FLOAT, false, 0, 0);

			/* texture coordinates */
			gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  			gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  
			/* map texture */
			gl.activeTexture(gl.TEXTURE0);
  			gl.bindTexture(gl.TEXTURE_2D, texture);
  			gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
  			gl.uniform2fv(gl.getUniformLocation(program, "invScreenSize"), [1.0/width, 1.0/height]);

			/* draw plane */
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
		}
		/**
		 * Process the configured shader pipeline
		 */
		function draw() {
			processProgram(programBlurH, cameraTexture, blurHFBO);			
			processProgram(programBlurV, blurHTexture, blurVFBO);

			/* segmentation */
			processProgram(programSegmentate, blurVTexture, segmentateFBO);
			gl.uniform1f(gl.getUniformLocation(programSegmentate, "uMinH"), config.recognitionValues.minH);
			gl.uniform1f(gl.getUniformLocation(programSegmentate, "uMaxH"), config.recognitionValues.maxH);
			gl.uniform1f(gl.getUniformLocation(programSegmentate, "uMinS"), config.recognitionValues.minS);
			gl.uniform1f(gl.getUniformLocation(programSegmentate, "uMaxS"), config.recognitionValues.maxS);
			gl.uniform1f(gl.getUniformLocation(programSegmentate, "uMinV"), config.recognitionValues.minV);
			gl.uniform1f(gl.getUniformLocation(programSegmentate, "uMaxV"), config.recognitionValues.maxV);

  			/* erode and dilate */
  			processProgram(programErode, segmentateTexture, erodeFBO);
  			processProgram(programDilate, erodeTexture, dilateFBO);

  			/* edge detection */
  			processProgram(programEdge, dilateTexture, null);
		}

		return { // public
			/**
			 * Initialise graphics pipeline (FBOs, Shader)
			 *
			 * @param {object} video - Current video object of webcam or video file
			 */
			setup: function(video) {
				initGl();

				/* init framebuffers */
				setupBlurHorizontalFBO();
				setupBlurVerticalFBO();
				setupSegmentateFBO();
				setupErodeFBO();
				setupDilateFBO();
				setupEdgeFBO();
				setupTempFBO();

				/* init shaders */
				setupBlurHorizontalShader();
				setupBlurVerticalShader();
				setupSegmentateShader();
				setupErodeShader();
				setupDilateShader();
				setupEdgeShader();

				/* init buffers */
				setupBuffers();
				setupVideoTexture();
				
				/* set gl options */
				setupGLConfig();
			},
			/**
			 * Process current video frame
			 *
			 * @param {object} video - Current video object of webcam or video file
			 */
			process: function(video) {
				updateVideoTexture(video);
				draw();
			},
			/**
			 * Return the RGBA values of the current frame
			 *
			 * @return {object}
			 */
			getPixels: function() {
  				gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixelValues);
				return pixelValues;
			}
		};
	};
 
	return {
		/**
		 * Initialises and returns the instance of the imageprocessor singleton class
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