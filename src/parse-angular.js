var module = angular.module('parse-angular', []);

module.run(['$q', '$window', function($q, $window){


	// Process only if Parse exist on the global window, do nothing otherwise
	if (!angular.isUndefined($window.Parse) && angular.isObject($window.Parse)) {

		// Keep a handy local reference
		var Parse = $window.Parse;

		//-------------------------------------
		// Structured object of what we need to update
		//-------------------------------------

		var methodsToUpdate = {
			"Object": {
				prototype: ['save', 'fetch', 'destroy'],
				static: ['saveAll', 'destroyAll']
			},
			"Collection": {
				prototype: ['fetch', 'remove'],
				static: [],
			},
			"Query": {
				prototype: ['find', 'first', 'count'],
				static: []
			},
			"Cloud": {
				prototype: [],
				static: ['run']
			}
		};

		//// Let's loop over Parse objects
		for (var k in methodsToUpdate) {

			var currentClass = k;	
			var currentObject = methodsToUpdate[k];

			var currentProtoMethods = currentObject.prototype;
			var currentStaticMethods = currentObject.static;


			/// Patching prototypes
			currentProtoMethods.forEach(function(method){

				var origMethod = Parse[currentClass].prototype[method];

				// Overwrite original function by wrapping it with $q
				Parse[currentClass].prototype[method] = function() {

					var defer = $q.defer();

					origMethod.apply(this, arguments)
					.then(defer.resolve, defer.reject);

					return defer.promise;

				};

			});


			///Patching static methods too
			currentStaticMethods.forEach(function(method){

				var origMethod = Parse[currentClass][method];

				// Overwrite original function by wrapping it with $q
				Parse[currentClass][method] = function() {

					var defer = $q.defer();

					origMethod.apply(null, arguments)
					.then(defer.resolve, defer.reject);

					return defer.promise;

				};

			});


		}
	}

}]);



angular.module('parse-angular.enhance', ['parse-angular'])
.run(['$q', '$window', function($q, $window){


	if (!angular.isUndefined($window.Parse) && angular.isObject($window.Parse)) {

		var Parse = $window.Parse;

		/// Create a method to easily access our object
		/// Because Parse.Object("xxxx") is actually creating an object and we can't access static methods

		Parse.Object.getClass = function(className) {
			return Parse.Object._className[className];
		};



		/// Enhance Collection
		Parse.Collection.prototype = angular.extend(Parse.Collection.prototype, {
			// Simple paginator
			loadMore: function(opts) {

				if (!angular.isUndefined(this.query)) {

					// Default Parse limit is 100
					var currentLimit = this.query._limit == -1 ? 100 : this.query._limit;
					var currentSkip = this.query._skip;

					currentSkip += currentLimit;

					this.query.skip(currentSkip);

					var _this = this;

					return this.fetch()
					.then(function(newModels){
						if (!opts || opts.add !== false) _this.add(newModels);
						return newModels;
					});

				}

			}

		});

	}

}]);