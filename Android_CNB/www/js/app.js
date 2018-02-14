// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','starter.controllers','factory','chart.js','ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
                       
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

.state('login',{
url:'/login',
cache:false,
abstract:false,
templateUrl: function(){
            return 'templates/iPhone/login.html';
          },
controller:'LoginCtrl'
})

.state('app', {
    url: '/app',
    cache:true,
    abstract:false,
    templateUrl: function(){
                return 'templates/menu.html';
              },
    controller: 'AppCtrl'
})

  .state('app.analytics', {
    url: '/analytics',
    cache:true,
    abstract:false,
    views: {
      'menuContent': {
      templateUrl: function(){
                  return 'templates/analytics.html';
                }
      }
    }
  })
  
    .state('app.landing', {
      url: '/landing',
      cache:true,
      abstract:false,
      views: {
        'menuContent': {
          templateUrl: function(){
            return 'templates/iPhone/landing.html';
          },
          controller: 'LandingCtrl'
        }
      }
    })

  .state('app.settings', {
      url: '/settings',
      cache:true,
      abstract:false,
      views: {
        'menuContent': {
        templateUrl: function(){
                    return 'templates/settings.html';
                  },
          controller: 'settingsCtrl'
        }
      }
    })

   .state('app.summary', {
        cache: true,
         url: '/summary',
         views: {
           'menuContent': {
             templateUrl: function(){
                     return'templates/iPhone/summary.html';
             },
             controller: 'SummaryCtrl'
            }
         }
       })

  .state('app.metrics', {
      url: '/metrics',
      cache:true,
      abstract:false,
      views: {
        'menuContent': {
        templateUrl: function(){
                    return 'templates/iPhone/metrics.html';
                  },
          controller: 'SignoffCtrl'
         }
      }
    })

  .state('app.attestation', {
      url: '/attestation',
      cache:true,
      abstract:false,
      views: {
        'menuContent': {
        templateUrl: function(){
                    return 'templates/iPhone/attestation.html';
                  },
        controller: 'attestationCtrl'
         }
      }
    })
  
  .state('app.details', {
    url: '/details',
    cache:true,
    abstract:false,
    views: {
      'menuContent': { //s/:playlistId
      templateUrl: function(){
                  return 'templates/iPhone/details.html';
                },
          controller: 'DetailsCtrl'
      }
    }
  })
  .state('app.smAttestation', {
          url: '/smAttestation',
          views: {
            'menuContent': {
              templateUrl: 'templates/iPhone/smAttestation.html',
              controller:'SMAttestation'
            }
          }
        })
  .state('app.smEscalation', {  //Added by Aditya
          url: '/smEscalation',
          views: {
            'menuContent': {
              templateUrl: 'templates/iPhone/smEscalations.html',
              controller:'smEscalation'
            }
          },
           params:{
              'deskName': null,
               'pdfFileName': null
             }
        });;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});





