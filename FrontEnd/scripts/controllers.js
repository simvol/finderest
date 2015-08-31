/*
	Authors: 
    - Evgeny Makarov 
    - Kimar Arakaki Neves
    CPSC 2261 - Web Technology (Term Project/Summer 2015)
    Last modified: 05 AUG 2015
*/

// Login / Registration
myApp.controller('loginController',function($scope,$rootScope,$http,$location,$state,Authentication){
	//
	$scope.user = {};

  $scope.init = function(){

  		//TODO work only after the second try??? 
  		//create new user with email and password
    	$scope.registration = function() {

    		//if no email show error message
	    	if (!$scope.user.email){
	    		$scope.emailError = true;	

	    	//if no password or passwords don't match show error message
	    	} else if ( $scope.user.password == undefined || $scope.user.password != $scope.password2 ){
	  			$scope.passwordError = true;	

	  		//otherwise create user 
	  		} else {
	  			// TODO need backend function to retrieve whole information about groups of a user, not only ids
			    $http({
					url: $rootScope.DURL + '/create/users',
					method: 'PUT',
					dataType: 'json',
					data: angular.toJson($scope.user)
			    }).success(function (data, status, headers, config) {
			    	//console.log("yeap");
   					$location.path('/user/user/settings');
			    }).error(function(data,status){
			    	console.log("status:" + status);
			    	console.log("error: " + data);
			    });

			}
  		} //end scope.registration

    	//function on submit doesn't work after I click login submit
		$scope.onSubmit = function() {
			console.log(Authentication.login($scope.user));
		}

    }
});

// Controller for /user page. Gets users information
myApp.controller('userController',function($scope,$rootScope,$http){
  //console.log("rootscope.logged its: " + $rootScope.logged);

  //Get user from session - This must put in scope by the login controller. 
  $scope.email=sessionStorage.getItem("email");
 
  //change logged email
  $scope.init = function() {
		$http({
		  url: $rootScope.DURL + '/user/'+$scope.email,
		  method: 'GET',
		  dataType: 'json',
		  data: '',
		}).success(function (data, status, headers, config) {

		  // If data exists then display variables
		  if (data) {
		  	console.log("data: " + JSON.stringify(data));
			var user = data;
			$scope.name = user.name;
			// $scope.interests = user.interests;
			// $scope.skills = user.skills;
			// $scope.locations = user.locations;
			// $scope.image = user.image;	
			
			$scope.interests = (angular.isArray(user.interests)) ? user.interests : user.interests.split(",");
			$scope.skills = (angular.isArray(user.skills)) ? user.skills : user.skills.split(",");
			$scope.locations = (angular.isArray(user.locations)) ? user.locations : user.locations.split(",");

			//store group ids
			var groupIds = user.memberships;

			//store group names
			var groups = $scope.groups = [];

			// after we got all group ids of groups user belongs to, we retrieve group name for each group id
			// and store it into groups($scope.groups) array

			if (groupIds){
				for (i = 0 ; i < groupIds.length; i++ ){
					$http({
					url: $rootScope.DURL + '/group/'+groupIds[i]+'/name',
					method: 'GET',
					dataType: 'json',
					data: '',
					}).success(function (data, status, headers, config) {
						//console.log(data.group_name);
						//add current group name to the array
						groups.push(data.group_name);
					}).error(function (data){
						console.log("error: " + data);
					});

				}
			} //if groupIds.length 
			else{
				groups.push("No groups yet");

			}
			
		  }
		}).error(function (data){

			// In case of an error display the message in console
			console.log("error: " + data);

		});

    }
});

// Controller for /group page. Gets users information

myApp.controller('groupsController',function($scope,$http,$rootScope){

  //Get user from session
  $scope.email=sessionStorage.getItem("email");

  $scope.init = function() {
    $http({
      url: $rootScope.DURL + '/group',
      method: 'GET',
      dataType: 'json',
      data: '',
    }).success(function (data, status, headers, config) {

      // If data exists then display variables
      if (data) {

        var groups = data;

      }

    }).error(function (data){

        // In case of an error display the message in console
        console.log("error: " + data);

    });

  }
});

// Controller for /user/mygroups page. Gets users groups information
myApp.controller('userGroupsController',function($scope,$http,$rootScope){
	//create object user to store all information
	$scope.user = {};

	//Get user from session - This must put in scope by the login controller. 
	$scope.user.email = sessionStorage.getItem("email");
	
	
  $scope.init = function() {

    // TODO need backend function to retrieve whole information about groups of a user, not only ids
    $http({
      url: $rootScope.DURL + '/user/'+$scope.user.email+'/groups',
      method: 'GET',
      dataType: 'json',
      data: '',
    }).success(function (data, status, headers, config) {
      // If data exists then display variables
      if (data) {

      	//store group ids
      	var groupIds = data;

		//store group names
        var groups = $scope.groups = [];
     

        // after we got all group ids of groups user belongs to, we retrieve group name for each group id
        // and store it into groups($scope.groups) array
	  	for (i = 0 ; i < groupIds.length; i++ ){
	  		    $http({
			      url: $rootScope.DURL + '/group/'+groupIds[i]+'/name',
			      method: 'GET',
			      dataType: 'json',
			      data: '',
			    }).success(function (data, status, headers, config) {
			    	//add current group name to the array
			    	groups.push(data);
			    }).error(function (data){
			    	console.log("error: " + data);
			    });

	  	}

	  	//TODO display group details of the selected group (select from the list by mouse click)
		$scope.display = true; //display div with group details
      } else {
		$scope.groups = [" No groups... yet."];
	  }

    }).error(function (data){

        // In case of an error display the message in console
        console.log("error: " + data);

    }); 

  }

  $scope.loadGroup  = function(){

  	$http({
      url: $rootScope.DURL + '/group/'+this.group.group_id,
      method: 'GET',
      dataType: 'json'
    }).success(function (data, status, headers, config) {

      // If data exists then display variables
      if (data) {

      		//store address separately
      		var wholeAddress = data[0].address;
      		var street = wholeAddress.address;
      		var city = wholeAddress.city;
      		var state = wholeAddress.state;
      		var country = wholeAddress.country;
      		var postal_code = wholeAddress.postal_code;

        $scope.groupName = data[0].group_name;
        $scope.categories = data[0].category;
        $scope.members = data[0].members;
        $scope.address = street + " " + city + ", " + state,
        $scope.info = data[0].info;

      }

    }).error(function (data){

        // In case of an error display the message in console
        console.log("error: " + data);

    });
  }
});

// Controller for settings. Change the profile info: name, skills, interets and update the data on the server 

myApp.controller('settingsController',function($scope,$http,$rootScope){

	//create object user to store all information
	$scope.user = {};

	//Get user from session - This must put in scope by the login controller. 
	$scope.user.email = sessionStorage.getItem("email");
	

	console.log("Heres update url : " + $rootScope.DURL + '/user/' + $scope.user.email);
	$scope.init = function() {

		$http({
		  url: $rootScope.DURL + '/user/'+$scope.user.email,
		  method: 'GET',
		  dataType: 'json',
		  data: '',
		}).success(function (data, status, headers, config) {

		  // If data exists then display variables
		  if (data) {
			
			//TODO getters/setters/validation
			$scope.user = {
				name : data.name,
				currentEmail : data.email, //save original email
				email : data.email,
				interests : data.interests,   // ".join(', ')" adds space between elements
				skills : data.skills, 	// not sure if it will make troubles to send data back
				locations : data.locations, 	// to the server
				image : data.image
			}

		  }

		}).error(function (data){
			// In case of an error display the message in console
			console.log("error: " + data);
		});
		
		// Take all date and send it to the server
		// TODO there's no update user end point? create new will serve this functional?
		$scope.updateProfile = function () {
			$http({
				//use currentEmail to access the original profile if user is changing email
				url: $rootScope.DURL + '/update/user/'+$scope.user.currentEmail, 
				method: 'POST',
				dataType: 'json',
				data: angular.toJson($scope.user)
			}).success(function (data, status, headers, config) {
				$scope.saved = true
			}).error(function(data){
				console.log("error: " + data)
			});
		}

		// $scope.uploadFile = function(files) {
			// var fd = new FormData();
//			Take the first selected file
			// fd.append("file", files[0]);

			// $http.post(uploadUrl, fd, {
				// withCredentials: true,
				// headers: {'Content-Type': undefined },
				// transformRequest: angular.identity
			// }).success( ...all right!... ).error( ..damn!... );
			
		// }; //end uploadFile
	
	} //end scope.init
});

//make left navbar buttons active

myApp.controller('navController',function($scope,$http,$location,$rootScope){
	$scope.init = function() {
		// change navigation bar to active class
		$scope.getClass = function(path) {
			var patt = new RegExp(path + "$");
			if ( patt.test($location.path())) {
			  return "active";
			} else {
			  return "";
			}
		}
	}
});

//make header navbar buttons active
myApp.controller('headerController',function($scope,$http,$location, Authentication){
	$scope.init = function() {
		// change header hav bar to active class
		$scope.getClass = function(path) {
			if (path == '/user'){
				var patt = new RegExp("^/u.+");
				if ( patt.test($location.path())) {
				  return "active";
				} else {
				  return "";
				}
			} else {
				var patt = new RegExp("^/u.+");
				if ( !patt.test($location.path())) {
				  return "active";
				} else {
				  return "";
				}
			}
		}
	}

	$scope.logout = function(){
		Authentication.logout();
	}

});

