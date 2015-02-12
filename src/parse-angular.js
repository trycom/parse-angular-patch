(function(window, undef){

	var angular = window.angular;

	if (angular !== undef) {

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
						prototype: ['fetch'],
						static: []
					},
					"Query": {
						prototype: ['find', 'first', 'count', 'get'],
						static: []
					},
					"Cloud": {
						prototype: [],
						static: ['run']
					},
					"User": {
						prototype: ['signUp'],
						static: ['requestPasswordReset', 'logIn']
					},
					"FacebookUtils": {
						prototype: [],
						static: ['logIn', 'link', 'unlink']
					},
					"Config": {
						prototype: [],
						static: ['get']
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

							return origMethod.apply(this, arguments)
							.then(function(data){
								var defer = $q.defer();
								defer.resolve(data);
								return defer.promise;
							}, function(err){
								var defer = $q.defer();
								defer.reject(err);
								return defer.promise;
							});


						};

					});


					///Patching static methods too
					currentStaticMethods.forEach(function(method){

						var origMethod = Parse[currentClass][method];

						// Overwrite original function by wrapping it with $q
						Parse[currentClass][method] = function() {

							return origMethod.apply(this, arguments)
							.then(function(data){
								var defer = $q.defer();
								defer.resolve(data);
								return defer.promise;
							}, function(err){
								var defer = $q.defer();
								defer.reject(err);
								return defer.promise;
							});

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
					return Parse.Object._classMap[className];
				};

				///// CamelCaseIsh Helper
				function capitaliseFirstLetter(string) {
		        return string.charAt(0).toUpperCase() + string.slice(1);
		    }


				///// Override orig extend
				var origObjectExtend = Parse.Object.extend;

				Parse.Object.extend = function(protoProps) {

					var newClass = origObjectExtend.apply(this, arguments);

					if (Parse._.isObject(protoProps) && Parse._.isArray(protoProps.attrs)) {
						var attrs = protoProps.attrs;
						/// Generate setters & getters
						Parse._.each(attrs, function(currentAttr){

							var field = capitaliseFirstLetter(currentAttr);

							// Don't override if we set a custom setters or getters
							if(!newClass.prototype['get' + field]) {
								newClass.prototype['get' + field] = function() {
									return this.get(currentAttr);
								};
							}
							if(!newClass.prototype['set' + field]) {
								newClass.prototype['set' + field] = function(data) {
									this.set(currentAttr, data);
									return this;
								}
							}

						});
					}


					return newClass;
				}



				/// Keep references & init collection class map
				Parse.Collection._classMap = {};

				var origExtend = Parse.Collection.extend;

				/// Enhance Collection 'extend' to store their subclass in a map
				Parse.Collection.extend = function(opts) {

					var extended = origExtend.apply(this, arguments);

					if (opts && opts.className) {
						Parse.Collection._classMap[opts.className] = extended;
					}

					return extended;

				};


				Parse.Collection.getClass = function(className) {
					return Parse.Collection._classMap[className];
				}


				/// Enhance Collection prototype
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

							return this.query.find()
							.then(function(newModels){
								if (!opts || opts.add !== false) _this.add(newModels)
								if (newModels.length < currentLimit) _this.hasMoreToLoad = false;
								return newModels;
							});

						}

					}

				});

			}

		}]);



	}

})(this);
