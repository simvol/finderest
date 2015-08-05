/*
  Authors: 
    - Evgeny Makarov 
    - Kimar Arakaki Neves
    CPSC 2261 - Web Technology (Term Project/Summer 2015)
    Last modified: 05 AUG 2015
*/

var myApp = angular.module('myApp',['ui.router']);

myApp.config(function($stateProvider, $urlRouterProvider) {


  //TODO switch to 404 page here
  $urlRouterProvider.otherwise("/login");

    $stateProvider
      .state('login', {
        url: '/login',
        views: {
          'login': {
            templateUrl: "views/login.html"
          }
        }
      })
      .state('user', {
        url: '/user', 
        views: {
          'main': {
            templateUrl: "views/user.html"
          },
          'header': {
            templateUrl: "views/header.html"
          },
          'sidebar': {
            templateUrl: "views/nav.html"
          }
        }
      })
     .state('user.groups', {
        url: '/user/mygroups',
        views: {
          'main@': {
            templateUrl: "views/mygroups.html"
          },
          'header': {
            templateUrl: "views/header.html"
          },
          'sidebar': {
            templateUrl: "views/nav.html"
          }
        }
      })
	  
	  //COPY
	  //settings page
	 .state('user.settings', {
        url: '/user/settings',
        views: {
          'main@': {
            templateUrl: "views/settings.html"
          },
          'header': {
            templateUrl: "views/header.html"
          },
          'sidebar': {
            templateUrl: "views/nav.html"
          }
        }
      })
	  // _COPY
	  
     .state('groups', {
        url: '/groups',
        views: {
          'main': {
            templateUrl: "views/groups/groups.html"
          },
          'header': {
            templateUrl: "views/header.html"
          },
          'sidebar': {
            templateUrl: "views/groups/nav.html"
          }
        }
      })
     .state('groups.create', {
        url: '/groups/create',
        views: {
          'main@': {
            templateUrl: "views/groups/createGroup.html"
          },
          'header': {
            templateUrl: "views/header.html"
          },
          'sidebar': {
            templateUrl: "views/groups/nav.html"
          }
        }
      })
     .state('groups.edit', {
        url: '/groups/edit',
        views: {
          'main@': {
            templateUrl: "views/groups/editGroup.html"
          },
          'header': {
            templateUrl: "views/header.html"
          },
          'sidebar': {
            templateUrl: "views/groups/nav.html"
          }
        }
      })
     .state('groups.details', {
        url: '/groups/details',
        views: {
          'main@': {
            templateUrl: "views/groups/groupDetails.html"
          },
          'header': {
            templateUrl: "views/header.html"
          },
          'sidebar': {
            templateUrl: "views/groups/nav.html"
          }
        }
      })
     .state('groups.owned', {
        url: '/groups/owned',
        views: {
          'main@': {
            templateUrl: "views/groups/groupsOwned.html"
          },
          'header': {
            templateUrl: "views/header.html"
          },
          'sidebar': {
            templateUrl: "views/groups/nav.html"
          }
        }
      })


//  $stateProvider
//    .state('login', {
//      url: "/login",
//      templateUrl: "views/login.html",
//    })
//    .state('user', {
//      url: "/user",
//      templateUrl: "views/user.html",
//      controller: 'userController'
//    })
}).run(function($rootScope, $location, Authentication){
  var publicAccess = ['/login'];

  $rootScope.$watch(function() { 
    return $location.path(); 
  },
  function(url){  
    if(publicAccess.indexOf(url) > -1 || !Authentication.isLogged())
      $location.path('/login');
  });
    
  
});


