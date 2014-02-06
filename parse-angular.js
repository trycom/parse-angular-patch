angular.module('parse-angular', [])
.service('PatchParseAngular', function($q, $window){


	// Process only if Parse exist on the global window, do nothing otherwise
	if ($window.Parse) {

		// Keep a handy local reference
		var Parse = $window.Parse;

		//-------------------------------------
		// Let's patch Parse.Object first
		//-------------------------------------

		var protoMethodsToUpdate ={
			"Object": ['save', 'fetch', 'destroy']
		}
		// var staticMethodsToReplace = ['saveAll', 'destroyAll'];


		for (var k in protoMethodsToUpdate) {

			var currentMethods = protoMethodsToUpdate[k];
			var currentClass = k;

			protoMethodsToUpdate.forEach(function(method){

				var origMethod = Parse[currentClass].prototype[method];

				// Overwrite original function by wrapping it with $q
				Parse[currentClass].prototype[method] = function() {

					var defer = $q.defer();

					origMethod.call(this, arguments)
					.then(function(data){
						defer.resolve(data);
					},
					function(err){
						defer.reject(err);
					})

					return defer.promise;

				}


			});

		}






	}

});