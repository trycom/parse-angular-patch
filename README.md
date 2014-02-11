Parse Angular Patch
=========

Brought to you by the [BRANDiD](https://www.getbrandid.com) team

  - Seamless Parse integration with AngularJS, using promises ($q)
  - Never worry about $scope digests again
  - Additional (and optional) module to enhance Parse Objects and Collections



How to use
----

1. [Grab the latest version of the patch here](https://raw2.github.com/brandid/parse-angular-patch/master/dist/parse-angular.js)
2. Include the module in your project
```javascript
angular.module('myApp', ['ngAnimate', 'parse-angular'])
```
3. That's it. How hard was that?! You can now do ANYWHERE in your angular app things such as :
```javascript
// Queries
var query = new Parse.Query("Monsters");
query.equalTo("name", "Frankeistein");
query.first()
.then(function(result){
        $scope.monsters = result;
});
// Cloud Code is patched too!
Parse.Cloud.run("myCloudCodeFunction", function(results) {
    $scope.data = results;
});
```

  And your scope will always be updated.
  

Wanna build a large Parse+Angular app?
----

Wait no more and check our [parse-angular-demo](https://github.com/brandid/parse-angular-demo) project


BRANDiD <3 Developers
----
You'd rather be coding than shopping? We get the feeling. Let our team hook you up with the easiest online shopping experience for men.

[Let's do that](https://www.getbrandid.com)



License
----

MIT
  
    