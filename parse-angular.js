angular.module('parse-angular', [])
.service('PatchParseAngular', function($q, $window){


	// Process only if Parse exist on the global window, do nothing otherwise
	if (!angular.isUndefined($window.Parse) && angular.isObject($window.Parse)) {

		// Keep a handy local reference
		var Parse = $window.Parse;

		//-------------------------------------
		// Let's patch prototypes first
		//-------------------------------------

		var protoMethodsToUpdate ={
			"Object": ['save', 'fetch', 'destroy'],
			"Collection": ['fetch', 'remove']
		};


		for (var k in protoMethodsToUpdate) {

			var currentMethods = protoMethodsToUpdate[k];
			var currentClass = k;

			currentMethods.forEach(function(method){

				var origMethod = Parse[currentClass].prototype[method];

				// Overwrite original function by wrapping it with $q
				Parse[currentClass].prototype[method] = function() {

					var defer = $q.defer();

					origMethod.apply(this, arguments)
					.then(defer.resolve, defer.reject);

					return defer.promise;

				}


			});

		}

	}

});