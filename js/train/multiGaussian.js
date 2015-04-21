"use strict";
/**
 * @class multiGaussian
 */
var mt = mt || {};
mt.train = mt.train || {};
mt.train.multiGaussian = (function () {
	var instance;
	/**
	 * Initialises the multivariate gaussian distribution and returns public methods
	 *
	 * @param {object} config - Configuration object
	 * @return {object}
	 */
	function setup(config) { // private
		var epsilon = 0.0001;

		/**
		 * Calculates the probability based on the observed feature and the corresponding mean value vector and covarianz matrix.
		 * Returns the calculated probability.
		 *
		 * @param {object} O - Observed feature
		 * @param {object} mu - Mean value vector
		 * @param {object} U - Covarianz matrix
		 * @return {number}
		 */
		var probabilityDensityFunction = function(O, mu, U) {
			var D = O.length;
			var covariance = U._data;
			var covarianceInverse = numeric.inv(covariance);
			var OMinusMu = numeric.sub(O, mu);

			var exponent = numeric.dot(covarianceInverse, OMinusMu);
			exponent = numeric.dot(OMinusMu, exponent);
			exponent = numeric.mul(exponent, -0.5);
			exponent = Math.exp(exponent);

			var denom = Math.pow(2.0 * Math.PI, D / 2.0) * Math.pow(numeric.det(covariance), 0.5);
			var result = exponent / denom;

			return result;
		};

		return { // public
			/**
			 * Calculates the probability based on the observed feature and the corresponding mean value vector and covarianz matrix.
			 * Returns the calculated probability.
			 *
			 * @param {object} O - Observed feature
			 * @param {object} mu - Mean value vector
			 * @param {object} U - Covarianz matrix
			 * @return {number}
			 */
			pdf: function(O, mu, U) {
				return probabilityDensityFunction(O, mu, U);
			},
		
			/**
			 * Calculates the probability for all defined mixtures and returns the summed probability.
			 *
			 * @param {number} j - Index of current state
			 * @param {number} t - Index of current position in time
			 * @param {number} K - Number of mixtures
			 * @param {object} O - Observed feature
			 * @param {object} mu - Mean value vector
			 * @param {object} U - Covarianz matrix
			 * @return {number}
			 */
			bOfO: function(j, t, K, O, mu, U) {
				var prob = 0; 
				for(var m = 0; m <= K - 1; m++) {
					prob = prob + probabilityDensityFunction(O[t], mu[j][m], U[j][m]);
				}
				return prob;
			}
		};
	};
 
	return {
		/**
		 * Initialises and returns the instance of the multiGaussian singleton class
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