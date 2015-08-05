/*
  Authors: 
    - Evgeny Makarov 
    - Kimar Arakaki Neves
    CPSC 2261 - Web Technology (Term Project/Summer 2015)
    Last modified: 05 AUG 2015
*/

// Controller for /group page. Gets users information
myApp.controller('groupsController',function($scope,$rootScope,$http){

  $scope.myArray = [];

  $scope.init = function() {

    $http({
      url: 'http://finderest.kweb.j43.ca:8080/groups',
      method: 'GET',
      dataType: 'json',
      data: '',
    }).success(function (data, status, headers, config) {

      // If data exists then display variables
      if (data) {

        $scope.groups = data;

      }

    }).error(function (data){

        // In case of an error display the message in console
        console.log("error: " + data);

    });
  }

  $scope.initCreateGroups = function() {
    $scope.newgroup = {
      members: [],
      category: [],
      meeting_time: []
    };

  }
  
  $scope.initEditGroups = function() {
  console.log($rootScope.selectedGroup );
    
    $http({
      url: 'http://finderest.kweb.j43.ca:8080/group/'+parseInt($rootScope.selectedGroup),
      method: 'GET',
      dataType: 'json'
    }).success(function (data, status, headers, config) {

      // If data exists then display variables
      if (data) {

        $scope.newgroup = data[0];

      }

    }).error(function (data){

        // In case of an error display the message in console
        console.log("error: " + data);

    });

  }

  $scope.createGroup = function(){
    console.log($scope.newgroup);

    $scope.newgroup.created = new Date();
    $scope.newgroup.owner = sessionStorage.getItem("email");
	$scope.newgroup.members = [ sessionStorage.getItem("email") ];

    $http({
      url: 'http://finderest.kweb.j43.ca:8080/create/groups',
      method: 'PUT',
      dataType: 'json',
      data: $scope.newgroup,
    }).success(function (data, status, headers, config) {

      console.log(data);

    }).error(function (data){

        // In case of an error display the message in console
        console.log("error: " + data);

    });

  }  

  $scope.editGroup = function(){
    console.log($scope.newgroup);

    $http({
      url: 'http://finderest.kweb.j43.ca:8080/update/group/'+$scope.newgroup.group_id,
      method: 'POST',
      dataType: 'json',
      data: $scope.newgroup,
    }).success(function (data, status, headers, config) {

      console.log(data);

    }).error(function (data){

        // In case of an error display the message in console
        console.log("error: " + data);

    });

  }
  
  $scope.addMember = function (){
      if( $scope.newgroup.members.indexOf(this.member) <0)
        $scope.newgroup.members.push(this.member);
      else
        alert('Cannot entry a duplicated value');
  }

  $scope.removeMember = function (){
    // console.log("Removed "+this.$index);
    $scope.newgroup.members.splice(this.$index,1); 
  }

  $scope.addCategory = function (){
      if( $scope.newgroup.category.indexOf(this.newCategory) <0)
        $scope.newgroup.category.push(this.newCategory);
      else
        alert('Cannot entry a duplicated value');
  }

  $scope.removeCategory = function (){
    // console.log("Removed "+this.$index);
    $scope.newgroup.category.splice(this.$index,1); 
  }

  $scope.addMeeting = function (){
      if( $scope.newgroup.meeting_time.indexOf(this.newMeeting) <0)
        $scope.newgroup.meeting_time.push(JSON.parse(JSON.stringify(this.newMeeting)));
      else
        alert('This meeting time has already been added.');
  }

  $scope.removeMeeting = function (){
    // console.log("Removed "+this.$index);
    $scope.newgroup.meeting_time.splice(this.$index,1); 
  }

  $scope.uploadImage = function(){
    $scope.newgroup.image = $scope.newgroup.image;
  }

  $scope.setGroupId = function(){
    $rootScope.selectedGroup = this.group.group_id;
    // group_id = this.group.group_id;
    // console.log($stateParams.group_id);
  }

  $scope.loadGroupDetails = function(){
    console.log($rootScope.selectedGroup );

    
    $http({
      url: 'http://finderest.kweb.j43.ca:8080/group/'+parseInt($rootScope.selectedGroup),
      method: 'GET',
      dataType: 'json'
    }).success(function (data, status, headers, config) {

      // If data exists then display variables
      if (data) {

        $scope.group = data[0];

      }

    }).error(function (data){

        // In case of an error display the message in console
        console.log("error: " + data);

    });
  }
  
  $scope.isOwner = function(){
	if($scope.group.owner == sessionStorage.getItem("email"))
		return true;
	else
		return false;
  }
  
  $scope.isOwner = function(){
    if($scope.group){
    	if($scope.group.owner == sessionStorage.getItem("email"))
    		return true;
    	else
    		return false;
    } else {
      return false;
    }
	}
  
   $scope.isNotMember = function(){
		if($scope.group){
      if($scope.group.members.indexOf(sessionStorage.getItem("email")) < 0){
  			return true;
  		} else {
  			return false;
  		}
    } else {
      return false;
    }
	}

  $scope.joinGroup = function(){
    $http({
      url: 'http://finderest.kweb.j43.ca:8080/request_entry/'+$scope.group.group_id,
      method: 'POST',
      dataType: 'json',
      data: {"email": sessionStorage.getItem("email")},
    }).success(function (data, status, headers, config) {

      // If data exists then display variables
      if (data) {

        alert("Request sent. Wait for approval.");

      }

    }).error(function (data){

        // In case of an error display the message in console
        alert("Error: Unable to request your entrance. Please try again later.");

    });
  }


  $scope.approveReq = function(){
    $http({ // POST -- /group/:group_id/approve_request
      url: 'http://finderest.kweb.j43.ca:8080/group/'+$scope.newgroup.group_id+"/approve_request",
      method: 'POST',
      dataType: 'json',
      data: {"email": this.entry_req},
    }).success(function (data, status, headers, config) {

      // If data exists then display variables
      if (data) {
        $scope.newgroup.members.push(data.member);
        $scope.newgroup.entry_reqs.splice($scope.newgroup.entry_reqs.indexOf(data.member),1);
        alert("Request approved successfully.");

      }

    }).error(function (data){

        // In case of an error display the message in console
        alert("Error: Fail to update the request entry.");

    });
  }
  
  $scope.rejectReq = function(){
    $http({ // POST -- /group/:group_id/reject_rquest
      url: 'http://finderest.kweb.j43.ca:8080/group/'+$scope.newgroup.group_id+"/reject_rquest",
      method: 'POST',
      dataType: 'json',
      data: {"email": this.entry_req},
    }).success(function (data, status, headers, config) {

      // If data exists then display variables
      if (data) {
        $scope.newgroup.entry_reqs.splice($scope.newgroup.entry_reqs.indexOf(this.entry_req),1);
        alert("Request removed successfully.");

      }

    }).error(function (data){

        // In case of an error display the message in console
        alert("Error: Fail to update the request entries.");

    });
  }

	$scope.getClass = function(path) {
		if ($location.path().substr(0, path.length) == path) {
		  return "active"
		} else {
		  return ""
		}
	}

  $scope.initOwnGroups = function() {
    $http({
      url: 'http://finderest.kweb.j43.ca:8080/group/by_owner/'+sessionStorage.getItem("email"),
      method: 'GET',
      dataType: 'json',
      data: '',
    }).success(function (data, status, headers, config) {

      // If data exists then display variables
      if (data) {

        $scope.groups = data;

      }

    }).error(function (data){

        // In case of an error display the message in console
        console.log("error: " + data);

    });
  }

});





