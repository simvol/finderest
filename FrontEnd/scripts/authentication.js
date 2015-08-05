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

	return {

		//login method
		login: function(user){

			var $promise = $http.post("http://finderest.kweb.j43.ca:8080/user/login",user);

			$promise.then(function(response){
				if (response.data["success"]== "ok") {
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
			var $promise = $http.post("http://finderest.kweb.j43.ca:8080/user/logout",session);

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

			var $promise = $http.post("http://finderest.kweb.j43.ca:8080/user/session/validate",session);

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
