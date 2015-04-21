"use strict";
/**
 * @class hmm
 *
 * Hidden Markov Model implementation based on the work of: 
 * - Lawrence R. Rabiner: A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition
 *   http://ieeexplore.ieee.org/xpl/login.jsp?tp=&arnumber=18626&url=http%3A%2F%2Fieeexplore.ieee.org%2Fiel5%2F5%2F698%2F00018626
 * - Mark Stamp: A Revealing Introduction to Hidden Markov Models
 *   https://www.cs.sjsu.edu/~stamp/RUA/HMM.pdf
 */
var mt = mt || {};
mt.train = mt.train || {};
mt.train.hmm = (function () {
	var instance;
	/**
	 * Initialises the hmm singleton and returns public methods
	 *
	 * @param {object} config - Configuration object
	 * @return {object}
	 */
	function setup(config) { // private
		/* members */
		var debug = false;
		var iterations = 0;
		var maxIterations = config.maxIterations || 2;
		var calculateDiagonalCovariance = config.calculateDiagonalCovariance;

		/* set configured or default model */
		var pi = config.pi || [0.4, 0.3, 0.2, 0.1];
		var a = config.a || [
								[0.34, 0.33, 0.33, 0.00],
								[0.00, 0.34, 0.33, 0.33],
								[0.00, 0.00, 0.50, 0.50],
								[0.00, 0.00, 0.00, 1.00]
							];
		var b = config.b || [
								[0.25, 0.25, 0.25, 0.25],
								[0.25, 0.25, 0.25, 0.25],
								[0.25, 0.25, 0.25, 0.25],
								[0.25, 0.25, 0.25, 0.25],
							];
		/* variables for observations */
		var OList = config.O;
		var O;
		var vectorSize = OList[0][0].length;

		/* model and matrix dimensions */
		var T = OList[0].length;
		var N = a.length;
		var M = b[0].length;
		var K = config.numberOfMixtures;

		/* variables for the differend passes */
		var c = [];			// Tx1 : scaling
		var alpha = []; 	// TxN 
		var beta = [];		// TxN 
		var gamma2d = [];	// TxN
		var gamma3d = [];	// TxNxN
		var omega = []; 	// TxNxK (K = number of mixtures)
		var cMix = []; 		// NxK (mixture coefficient of K mixtures)
		var mu = []; 		// NxK (mean vectors of K mixtures)
		if(config.mu.length > 0) {
			mu = config.mu;
		}
		var U = [];			// NxK (covariance matrices of K mixtures)
		if(config.U.length > 0) {
			U = config.U;
		}

		/* multivariate gaussian distribution functions */
		var mg = mt.train.multiGaussian.getInstance();

		/**
		 * Initialises the scaling array
		 */
		var initC = function() {
			for(var t = 0; t < T; t++) {
				c.push(0);
			}
		};
		/**
		 * Initialises the alpha matrix
		 */
		var initAlpha = function() {
			for(var t = 0; t < T; t++) {
				alpha[t] = [];
				for(var i = 0; i < N; i++) {
					alpha[t][i] = 1.0 / N;
				}
			}
		};
		/**
		 * Initialises the beta matrix
		 */
		var initBeta = function() {
			for(var t = 0; t < T; t++) {
				beta[t] = [];
				for(var i = 0; i < N; i++) {
					beta[t][i] = 1.0 / N;
				}
			}
		};
		/**
		 * Initialises the gamma matrices
		 */
		var initGamma = function() {
			for(var t = 0; t < T; t++) {
				gamma2d[t] = [];
				gamma3d[t] = [];
				for(var i = 0; i < N; i++) {
					gamma2d[t][i] = 1.0 / N;
					gamma3d[t][i] = [];
					for(var j = 0; j < N; j++) {
						gamma3d[t][i][j] = 1.0 / N;
					}
				}
			}
		};
		/**
		 * Initialises the omega matrix
		 */
		var initOmega = function() {
			for(var t = 0; t < T; t++) {
				omega[t] = [];
				for(var i = 0; i < N; i++) {
					omega[t][i] = [];
					for(var k = 0; k < K; k++) {
						omega[t][i][k] = 1.0 / K;
					}
				}
			}
		};
		/**
		 * Initialises the mixture coefficients (not used right now)
		 */
		var initCMix = function() {
			for(var n = 0; n < N; n++) {
				cMix[n] = [];
				for(var k = 0; k < K; k++) {
					cMix[n][k] = 1.0 / K;
				}
			}
		};
		/**
		 * Initialises the mean vectors is none are configured
		 */
		var initMu = function() {
			if(mu.length === 0) {
				for(var n = 0; n < N; n++) {
					mu[n] = [];
					for(var k = 0; k < K; k++) {
						mu[n][k] = math.ones([vectorSize]);
					}
				}
			}
		};
		/**
		 * Initialises the covariance matrix if none is configured
		 */
		var initU = function() {
			if(U.length === 0) {
				for(var n = 0; n < N; n++) {
					U[n] = [];
					for(var k = 0; k < K; k++) {
						U[n][k] = math.eye(vectorSize, vectorSize);
					}
				}
			}
		};

		/**
		 * Calculation of the forward variable (alpha)
		 */
		var alphaPass = function() {
			// compute alpha_0(i)
			c[0] = 0;
			for(var i = 0; i <= N - 1; i++) {
				alpha[0][i] = pi[i] * mg.bOfO(i, 0, K, O, mu, U); 
				c[0] = c[0] + alpha[0][i];
			}
			// scale alpha_0(i)
			c[0] = 1.0 / c[0];
			for(var i = 0; i <= N - 1; i++) {
				alpha[0][i] = c[0] * alpha[0][i];
			}
			// compute alpha_t(i)
			for(var t = 1; t <= T - 1; t++) {
				c[t] = 0;
				for(var i = 0; i <= N - 1; i++) {
					alpha[t][i] = 0;
					for(var j = 0; j <= N - 1; j++) {
						alpha[t][i] = alpha[t][i] + alpha[t - 1][j] * alpha[j][i];
					}
					alpha[t][i] = alpha[t][i] * mg.bOfO(i, t, K, O, mu, U);
					c[t] = c[t] + alpha[t][i];
				}
				//scale alpha[t][i]
				c[t] = 1.0 / c[t];
				for(var i = 0; i <= N - 1; i++) {
					alpha[t][i] = c[t] * alpha[t][i];
				}
			}
			if(debug) {
				print2d("alpha", iterations, alpha);
			}
		};
		/**
		 * Calculation of the backward variable (beta)
		 */
		var	betaPass = function() {
			// Let beta_T-1(i) = 1 scaled by c_T-1
			for(var i = 0; i <= N - 1; i++) {
				beta[T - 1][i] = c[T - 1];
			}
			// beta-pass
			for(var t = T - 2; t >= 0; t--) {
				for(var i = 0; i <= N - 1; i++) {
					beta[t][i] = 0;
					for(var j = 0; j <= N - 1; j++) {
						beta[t][i] = beta[t][i] + a[i][j] * mg.bOfO(j, t + 1, K, O, mu, U) * beta[t + 1][j];
					}
					// scale beta_t(i) with same scale factor as alpha_t(i)
					beta[t][i] = c[t] * beta[t][i];
				}
			}
			if(debug) {
				print2d("beta", iterations, beta);
			}
		};
		/**
		 * Calculation of being in state Si at time t and in state Sj at time t+1
		 */
		var gammaPass = function() {
			for(var t = 0; t <= T - 2; t++) {
				var denom = 0;
				for(var i = 0; i <= N - 1; i++) {
					for(var j = 0; j <= N - 1; j++) {
						denom = denom + alpha[t][i] * a[i][j] * mg.bOfO(j, t + 1, K, O, mu, U) * beta[t + 1][j];
					}
				}
				for(var i = 0; i <= N - 1; i++) {
					gamma2d[t][i] = 0;
					for(var j = 0; j <= N - 1; j++) {
						gamma3d[t][i][j] = (alpha[t][i] * a[i][j] * mg.bOfO(j, t + 1, K, O, mu, U) * beta[t + 1][j]) / denom;
						gamma2d[t][i] = gamma2d[t][i] + gamma3d[t][i][j];
					}
				}
			}
			if(debug) {
				print2d("gamma2d", iterations, gamma2d);
				console.log("gamma3d(" + iterations + ")", gamma3d);
			}
		};

		/**
		 * Reestimation of the start probabilities (pi)
		 */
		var reestimatePi = function() {
			for(var i = 0; i <= N - 1; i++) {
				pi[i] = gamma2d[0][i];
			}
			if(debug) {
				print1d("pi", iterations, pi);
			}
		};
		/**
		 * Reestimation of the transition probabilities (A-Matrix)
		 */
		var	reestimateA = function() {
			for(var i = 0; i <= N - 1; i++) {
				for(var j = 0; j <= N - 1; j++) {
					var numer = 0;
					var denom = 0;
					for(var t = 0; t <= T - 2; t++) {
						numer = numer + gamma3d[t][i][j];
						denom = denom + gamma2d[t][i];
					}
					a[i][j] = numer / denom;
				}
			}
			if(debug) {
				print2d("a", iterations, a);
			}
		};
		/**
		 * Reestimation of the mean vector values and the covariance matrices
		 */
		var	reestimateB = function() {
			// calculate cMix
			for(var j = 0; j <= N - 1; j++) {
				for(var k = 0; k <= K - 1; k++) {
					var numer = 0;
					var denom = 0;
					for(var t = 0; t <= T - 1; t++) {
						numer = numer + omega[t][j][0];
						denom = denom + omega[t][j][k];
					}
					cMix[j][k] = numer / denom;
				}
			}
			if(debug) {
				console.log("cMix(" + iterations + ")", cMix);
			}
			
			// calculate mu
			for(var j = 0; j <= N - 1; j++) {
				for(var k = 0; k <= K - 1; k++) {
					var numer = math.zeros([vectorSize]);
					var denom = 0;
					for(var t = 0; t <= T - 1; t++) {
						var temp = math.multiply(O[t], omega[t][j][k]);
						numer = math.add(numer, temp);
						denom = denom + omega[t][j][k];
					}
					mu[j][k] = math.divide(numer, denom);
				}
			}
			if(debug) {
				console.log("mu(" + iterations + ")", mu);
			}

			// calculate U
			for(var j = 0; j <= N - 1; j++) {
				for(var k = 0; k <= K - 1; k++) {
					var numer = math.zeros(vectorSize, vectorSize);
					var denom = 0;
					for(var t = 0; t <= T - 1; t++) {
						var OtMinusMu = math.subtract(O[t], mu[j][k]);
						var OtMinusMuTranspose = math.transpose(OtMinusMu);

						var mat = math.zeros(OtMinusMu.length, OtMinusMu.length);
						for(var x = 0; x < vectorSize; x++) {
							for(var y = 0; y < vectorSize; y++) {
								mat._data[x][y] = OtMinusMu[x] * OtMinusMu[y];
							}
						}

						var product = math.multiply(mat, omega[t][j][k]);

						numer = math.add(numer, product);
						denom = denom + omega[t][j][k];
					}
					U[j][k] = math.divide(numer, denom);
				}
			}

			/* transform to diagonal U matrix */
			if(calculateDiagonalCovariance) {
				for(var z = 0; z < U.length; z++) {
					for(var x = 0; x < U[z][0]._data.length; x++) {
						for(var y = 0; y < U[z][0]._data[x].length; y++) {
							if(x !== y) {
								U[z][0]._data[x][y] = 0;
							}
						}
					}
				}
			}
			
			if(debug) {
				console.log("U(" + iterations + ")", U);
			}

			// calculate omega
			for(var t = 0; t <= T - 1; t++) {
				var term1 = 0;
				for(var j = 0; j <= N - 1; j++) {
					term1 = gamma2d[t][j];
					for(var k = 0; k <= K - 1; k++) {
						var numer = cMix[j][k] * mg.pdf(O[t], mu[j][k], U[j][k]);
						var denom = 0;
						for(var m = 0; m <= K - 1; m++) {
							denom = denom + cMix[j][m] * mg.pdf(O[t], mu[j][m], U[j][m]);
						}
						var term2 = numer / denom;
						omega[t][j][k] = term1 * term2;
					}
				}
			}
			if(debug) {
				console.log("omega(" + iterations + ")", omega);
			}
		};

		/**
		 * Plot array to console
		 */
		var print1d = function(label, i, data) {
			var log = label + " (iteration" + i + ") \n [";
			for(var j = 0; j < data.length; j++) {
				log += (data[j] + ", ");
			}
			log += " ]";
			console.log(log);
		};
		/**
		 * Plot twodimensional array to console
		 */
		var print2d = function(label, i, data) {
			var log = label + " (iteration" + i + ")";
			for(var i = 0; i < data.length; i++) {
				log += "\n[ ";
				for(var j = 0; j < data[i].length; j++) {
					log += (data[i][j] + ", ");
				}
				log += " ]";
			}
			console.log(log);
		};

		return { // public
			/**
			 * Start the training process
			 */
			train: function() {
				/* init */
				initC();
				initAlpha();
				initBeta();
				initGamma();
				initOmega();
				initCMix();
				initMu();
				initU();

				/* for each observations of one video file */
				for(var i = 0; i < OList.length; i++) {
					/* set current observation list */
					O = OList[i];
					/* train hmm on current observation list */
					for(iterations; iterations < maxIterations; iterations++) {
						/* pass */
						alphaPass();
						betaPass();
						gammaPass();

						/* reestimate */
						reestimatePi();
						reestimateA();
						reestimateB();
					}
				}
			},

			/**
			 * Returns the trained HMM
			 * @return {object}
			 */
			getModel: function() {
				var model = {
					pi : pi,
					a  : a,
					//b  : b,
					cMix : cMix,
					mu : mu,
					U  : U
				};
				var output = document.getElementById("output");
				output.value = "### Trained HMM ###\n\n";
				output.value += JSON.stringify(model);
				return model;
			}
		};
	};
 
	return {
		/**
		 * Initialises the hmm singleton and return its instance
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