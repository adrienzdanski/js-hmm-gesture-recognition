"use strict";
/**
 * @class viterbi
 */
var mt = mt || {};
mt.recognize = mt.recognize || {};
mt.recognize.viterbi = (function () {
        var instance;
        /**
         * Initialises the viterbi algorithm and returns public methods
         *
         * @return {object}
         */
        function setup() { // private
            var epsilon = 0.0001;
            var useLog = true;

            /* reference to multiGaussian singleton */
            var mg = mt.train.multiGaussian.getInstance();

            /* members */
            var delta = [];         // double[][]
            var psy = [];           // int[][]
            var stateSequence = []; // int[]
            var maxProbability;     // double
            var label;
            var callback;
            var noOfStates;
            var pi = [];
            var a = [];
            var mu = [];
            var U = [];
            var K;

             /**
             * Computes the most likely state sequence matching an observation
             * sequence given an HMM.
             * Based on the following viterbi implementation: 
             * https://code.google.com/p/jahmm/source/browse/trunk/src/main/java/be/ac/ulg/montefiore/run/jahmm/ViterbiCalculator.java
             *
             * @param {array} oseq - An observations sequence.
             * @param {object} hmm - A Hidden Markov Model.
             */
             var viterbiCalculator = function(oseq, hmm) {
                if(oseq.length <= 0) {
                    throw new Error("Observation sequence is empty");
                }
                
                /* initialize delta & psy (t == 0) */
                for (var t = 0; t < oseq.length; t++) {
                    delta[t] = [];
                    psy[t] = [];

                    
                    for(var i = 0; i < noOfStates; i++) {
                        delta[t][i] = 0.0;
                        psy[t][i] = 0;
                        /* calculate delta & psy for t = 0 */
                        if(t === 0) {
                            /* delta[0][i] = start probability (pi[i]) * emissive prob (bOfO[i]O[0]) */
                            var prob = mg.bOfO(i, t, K, oseq, mu, U);
                            var pi_i = pi[i];

                            if(useLog) {
                                delta[t][i] = math.log(pi_i) + math.log(prob);
                            } else {
                                delta[t][i] = pi_i * prob;
                            }
                            
                            psy[t][i] = 0; 
                        }
                    }
                }

                /* calculate delta[t][j] & psy[t][j] (t > 0) */
                for(var t = 1; t <= oseq.length - 1; t++) {
                    for(var j = 0; j < noOfStates; j++) {
                        var maxDelta = Number.MIN_VALUE;
                        var maxPsy = 0;
                        var curDelta = 0;

                        for(var i = 0; i < noOfStates; i++) {
                            if(useLog) {
                                if(a[i][j] === 0) {
                                    a[i][j] = 1;
                                }
                                curDelta = delta[t-1][i] + math.log(a[i][j]);
                            } else {
                                curDelta = delta[t-1][i] * a[i][j];
                            }                            

                            if(curDelta > maxDelta) {
                                maxDelta = curDelta;
                                maxPsy = i;
                            }
                        }
                        var prob = mg.bOfO(j, t, K, oseq, mu, U);

                        if(useLog) {
                            delta[t][j] = maxDelta + math.log(prob);
                        } else {
                            delta[t][j] = maxDelta * prob;
                        }
                        
                        psy[t][j] = maxPsy;
                    }
                }

                /* calculate max probability & stateSequence */
                if(useLog) {
                    maxProbability = -Number.MAX_VALUE;           
                } else {
                    maxProbability = Number.MIN_VALUE;
                }

                for(var i = 0; i < noOfStates; i++) {
                    var curProbability = delta[oseq.length - 1][i];

                    if(curProbability > maxProbability) {
                        maxProbability = curProbability;
                        stateSequence[oseq.length - 1] = i;
                    }
                }

                for(var t2 = oseq.length - 2; t2 >= 0; t2--) {
                    stateSequence[t2] = psy[t2+1][stateSequence[t2+1]];
                }
            };
            
            /**
             * Initialises all needed member variables
             *
             * @param {object} hmm - Configured HMM
             * @param {boolean} useLog - If true, use logarithms for probability calculations
             */
            var initVars = function(hmm, useLog) {
                useLog = useLog;
                pi = [];
                a = [];
                U = [];
                mu = [];

                label = hmm.label;
                callback = hmm.callback;
                noOfStates = hmm.model.pi.length;
                K = hmm.model.cMix[0].length;
                pi = hmm.model.pi;
                a = hmm.model.a;
                mu = hmm.model.mu;

                var N = hmm.model.a.length;

                for(var n = 0; n < N; n++) {
                    U[n] = [];
                    for(var k = 0; k < K; k++) {
                        U[n][k] = math.matrix(hmm.model.U[n][k]._data);
                    }
                }
            };

            return { // public
                /**
                 * Start the viterbi calculation and return the model with the highest probability
                 *
                 * @param {object} observations - Observation sequence
                 * @param {object} hmm - hmm
                 * @param {boolean} useLog - If true, use logarithms for probability calculations
                 * @return {object}
                 */
                recognize: function(observations, hmm, useLog) {
                    initVars(hmm, useLog);
                    viterbiCalculator(observations, hmm);
                    return {
                        label: label,
                        callback: callback,
                        probability: maxProbability
                    };
                }
            };
        };
 
        return {
            /**
             * Initialises the viterbi algorithm and returns its instance
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