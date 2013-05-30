var boost = (function(){
	var Feature = function(name){
		this.name = name;
	}

	/**
	 * @param {Feature} feature
	 * @param {integer} sign +1 indicates has->like, -1 indicates !has->like
	 */
	var wClassifier = function(feature, sign){
		this.feature = feature;
		this.sign = sign;

		// List of food IDs that were misclassified
		this.misclassified_ids = [];

		// The boosting error for this classifier
		this.error = 0;
	}

	/**
	 * make a prediction
	 * @param {FoodModel} food
	 * @return {integer} +1 indicates like, -1 indicates dislike
	 */
	wClassifier.prototype.classify = function(food){
		var foodFeatureNames = getAllFeaturesFromFood(food, true);

		// +1 -> has feature, -1 -> !has feature
		var foodHasTestFeature = 
			$.inArray(this.feature.name, foodFeatureNames) !== -1 ? 1 : -1;

		var classification = this.sign*foodHasTestFeature;

		if (classification !== food.get('preference')){
			this.misclassified_ids.push(food.get('id'));
		}

		return classification;
	}

	/**
	 * get boost error (sum of food_i * weight_i for i misclassified)
	 *
	 * @param {Obj} weightTable
	 * @param {integer} error
	 */
	 wClassifier.prototype.calcError = function(weightTable){
	 	var error = 0;
	 	for(var each in this.misclassified_ids){
	 		var id = this.misclassified_ids[each];
	 		error += weightTable[id];
	 	}
	 	this.error = error;

	 	return this.error;
	 }

	/**
	 * @param {FoodModel} food
	 * @return {array[Feature]} 
	 */
	var getAllFeaturesFromFood = function(food, namesOnly){
		namesOnly = namesOnly || false; // boolean for getting features names only

		var a = food.get('cuisines');
		var b = food.get('ingredients');
		var c = food.get('mealTypes');

		var foodFeatures = a.concat(b).concat(c);

		if (namesOnly === false){
			foodFeatures = foodFeatures.map(function(name){
				return new Feature(name);
			});
		}
		
		return foodFeatures;
	}

	/**
	 * extract the features from collection of foods
	 *
	 * @param {array[FoodModel]} collection
	 * @return {array[Feature]}
	 */
	var getFeatureSetFromCollection = function(collection){
		var featureNameSet = {}; // for hashing purposes
		var featureSet = [];

		for (var i=0; i<collection.length; i++){
			var food = collection[i];
			var foodFeatures = getAllFeaturesFromFood(food);

			for (var j=0; j<foodFeatures.length; j++){
				var foodFeature = foodFeatures[j];
				if (!(foodFeature.name in featureNameSet)){
					featureNameSet[foodFeature.name] = 1;
					featureSet.push(foodFeature);
				}
			}
		}

		return featureSet;
	}

	/**
	 * build all the weak classifiers
	 *
	 * @param {array[Feature]} featureset
	 * @return {array[wClassifier]}
	 * TODO: deal with negative classification better, commented out for now
	 */
	var makeClassifiersFromFeatureSet = function(featureset){
		var classifiers = [];

		for(var i=0; i<featureset.length; i++){
			var feature = featureset[i];
			var pos_classifier = new wClassifier(feature, 1);
			//var neg_classifier = new wClassifier(feature, -1);

			classifiers.push(pos_classifier);
			//classifiers.push(neg_classifier);
		}

		return classifiers;
	}

	/**
	 * initialize the weight table that maps food id to weight
	 *
	 * @param {array[FoodModel]} foods
	 * @return {Obj} weight table
	 */
	var initializeWeights = function(foods){
		var weightTable = {}
		for (var i=0; i<foods.length; i++){
			var food_id = foods[i].get('id');
			weightTable[food_id] = 1/foods.length;
		}
		return weightTable;
	}

	/**
	 * we update weights by increasing those whose corresponding foods 
	 * were misclassified by the top classifier
	 *
	 * @param {Obj} weightTable
	 * @param {wClassifier} classifier
	 * @return {Obj}
	 */
	var updateWeights = function(weightTable, classifier){
		var misclassified = classifier.misclassified_ids;
		var error = classifier.error;
		var normalizeDenom = 0;

		for (var foodId in weightTable){
			var multiplier;

			// If food is misclassified
			if ($.inArray(parseInt(foodId), misclassified) !== -1){
				multiplier = Math.max(Math.sqrt((1-error)/error), 0.001);
			} else {
				multiplier = Math.max(Math.sqrt(error/(1-error)), 0.001);
			}

			weightTable[foodId] *= multiplier;
			normalizeDenom += weightTable[foodId];
		}

		// normalize
		var normalizer = 1/normalizeDenom;
		for (var foodId in weightTable){
			weightTable[foodId] *= normalizer;
		}

		return weightTable;
	}

	/**
	 * ranks all classifiers by their error rates and returns top subset
	 *
	 * @param {array[wClassifier]} classifiers
	 * @param {integer} topN
	 * @return {array[wClassifiers]}
	 */
	var getTopNClassifiers = function(classifiers, topN){
		var sortFunction = function(a,b){
			return a.error - b.error;
		}

		classifiers.sort(sortFunction);
		return classifiers.slice(0, Math.min(classifiers.length,topN));
	}

	/**
	 * alpha is the multiplier for the weak classifier in the expression for
	 * the strong classifier. we calculate it from the weak classifier's
	 * error rate.
	 *
	 * @param {wClassifier} classifier
	 * @result {integer}
	 */
	var getAlpha = function(classifier){
		var error = classifier.error;
		return Math.max(Math.min(0.5*Math.log((1-error)/error), 1000), 0.001);
	}

	return {
		/**
		 * main boosting function. yields a strong classifier object.
		 *
		 * @param {collection} likeCollection
		 * @param {collection} dislikeCollection
		 * @param {integer} numRounds
		 * @return {Obj} the strong classifier
		 */
		boost: function(likeCollection, dislikeCollection, numRounds){
			numRounds = numRounds || 10; // Default number of boost rounds

			var likeModels = likeCollection.models;
			var dislikeModels = dislikeCollection.models;

			var foodModelCollection = likeModels.concat(dislikeModels);
			var featureSet = getFeatureSetFromCollection(foodModelCollection);
			var classifiers = makeClassifiersFromFeatureSet(featureSet);
			var weightTable = initializeWeights(foodModelCollection);

			// Classify the foods, log misclassifications, and calculate errors!
			for (var i=0; i<classifiers.length; i++){
				var classifier = classifiers[i];

				for (var j=0; j<foodModelCollection.length; j++){
					var food = foodModelCollection[j];
					classifier.classify(food);
				}

				classifier.calcError(weightTable);
			}

			// Get the top 20 classifiers
			var classifiers_truncated = getTopNClassifiers(classifiers, 20);

			// The object we return
			var strongClassifier = {
				alphas : [],
				weakClassifiers : [],

				// In a form that can be sent back to backend
				compactify: function() {
					var obj = {}
					for (var i=0; i < this.weakClassifiers.length; i++){
						var feature = this.weakClassifiers[i].feature.name;
						var sign = this.weakClassifiers[i].sign;

						if (obj.hasOwnProperty(feature)){
							obj[feature] += this.alphas[i]*sign;
						} else {
							obj[feature] = this.alphas[i]*sign;
						}
					}
					return obj;
				}
			}

			// Boost!
			for (var round = 0; round < numRounds; round++){
				// Get the top classifier
				var topClassifier = getTopNClassifiers(classifiers_truncated, 1)[0];
				strongClassifier.weakClassifiers.push(topClassifier);

				// Calculate alpha
				var alpha = getAlpha(topClassifier);
				strongClassifier.alphas.push(Math.round(alpha*100)/100);

				// Not necessary for last round
				if (round < numRounds - 1){
					// Update weights with new top classifier
					updateWeights(weightTable, topClassifier);

					// Calculate new error rates
					for (var i=0; i<classifiers_truncated.length; i++){
						var classifier = classifiers_truncated[i];
						classifier.calcError(weightTable);
					}
				}
			}
			
			return strongClassifier;
		},
	}
})();