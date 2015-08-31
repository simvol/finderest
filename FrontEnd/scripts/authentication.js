/*
	Authors: 
    - Evgeny Makarov 
    - Kimar Arakaki Neves
    CPSC 2261 - Web Technology (Term Project/Summer 2015)
    Last modified: 05 AUG 2015
*/
'use strict';

// angular.module('myApp')
angular.module('myApp').factory('Authentication', function Authentication($http, $rootScope, $location, MySession){

	var loggedStatus = false;
<<<<<<< HEAD
	$rootScope.DURL = 'http://52.24.4.41:8080';
=======

>>>>>>> 4533c5d60a7e6fbeb1202bc20609af534113380a
	return {

		//login method
		login: function(user){

<<<<<<< HEAD
			var $promise = $http.post($rootScope.DURL + "/user/login",user);

			$promise.then(function(response){
				if (response.data["success"]== "ok") {

=======
			var $promise = $http.post("http://finderest.kweb.j43.ca:8080/user/login",user);

			$promise.then(function(response){
				if (response.data["success"]== "ok") {
>>>>>>> 4533c5d60a7e6fbeb1202bc20609af534113380a
					MySession.set('email', user.email);
					MySession.set('token', response.data["token"]);
					loggedStatus = true;		
					$location.path('/user');

				} else {
					console.log('Invalid credentials.');
					$location.path('/login');
				}
			});

		}, 
		logout: function(){
			var session ={
				"token" : MySession.get('token')
			};
<<<<<<< HEAD
			var $promise = $http.post($rootScope.DURL + "/user/logout",session);
=======
			var $promise = $http.post("http://finderest.kweb.j43.ca:8080/user/logout",session);
>>>>>>> 4533c5d60a7e6fbeb1202bc20609af534113380a

			$promise.then(function(response){
				if (response.data["success"]== "ok") {
					MySession.destroy('email');
					MySession.destroy('token');
					$location.path('/login');
				}
			});
			
		}, 
		isLogged: function(){

			var session ={
				"email" : MySession.get('email'),
				"token" : MySession.get('token')
			};

<<<<<<< HEAD
			var $promise = $http.post($rootScope.DURL + "/user/session/validate",session);
=======
			var $promise = $http.post("http://finderest.kweb.j43.ca:8080/user/session/validate",session);
>>>>>>> 4533c5d60a7e6fbeb1202bc20609af534113380a

			$promise.then(function(response){
				if (response.data["success"]== "ok") {
					loggedStatus = true;
				} else {
					loggedStatus = false;
				}
			});

			return loggedStatus;
		}
	}
});

angular.module('myApp').factory('MySession', [ '$http','$rootScope', function Authentication($http,$rootScope){
	var authenticatedUser = null;

	return {
		set: function(key, value){
			return sessionStorage.setItem(key,value);
		},
		get: function(key){
			return sessionStorage.getItem(key);
		},
		destroy: function(key){
			return sessionStorage.removeItem(key);
		}
	}
}]);
