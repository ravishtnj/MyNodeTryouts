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

                       
    /*if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
                       
    if(window.GoodDynamics)
        {
                       
        }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }*/

    
                       
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

.state('login',{
url:'/login',
abstract:false,
templateUrl: function(){
              if(!ionic.Platform.isIPad()){
                return'templates/iPhone/login.html';
              } else{
                return'templates/login.html ';
              }
        },
controller:'LoginCtrl'
})

.state('app', {
    url: '/app',
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
})

  .state('app.analytics', {
    url: '/analytics',
    views: {
      'menuContent': {
        templateUrl: 'templates/analytics.html'
      }
    }
  })

  .state('app.misdashboard', {
      url: '/misdashboard',
      views: {
        'menuContent': {
          templateUrl: 'templates/misdashboard.html',
          controller: 'LandingCtrl'
        }
      }
    })
    .state('app.landing', {
      url: '/landing',
      views: {
        'menuContent': {
          templateUrl: function(){
              if(!ionic.Platform.isIPad()){
                return'templates/iPhone/landing.html';
              } else{
                return'templates/landing.html';
              }
        },
          controller: 'LandingCtrl'
        }
      }
    })

  .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'templates/settings.html',
          controller: 'settingsCtrl'
        }
      }
    })  

  .state('app.metrics', {
      url: '/metrics',
      views: {
        'menuContent': {
          templateUrl: function(){
                if(!ionic.Platform.isIPad()){
                  return'templates/iPhone/metrics.html';
                } else{
                  return'templates/metrics.html';
                }
          },
          controller: 'SignoffCtrl'
         }
      }
    })
  .state('app.summary', {
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

  .state('app.attestation', {
      url: '/attestation',
      views: {
        'menuContent': {
          templateUrl: function(){
              if(!ionic.Platform.isIPad()){
                return'templates/iPhone/attestation.html';
              } else{
                return'templates/attestation.html';
              }
        },
          controller: 'attestationCtrl'
         }
      }
    })
  
  .state('app.details', {
    url: '/details',
    views: {
      'menuContent': {
        templateUrl: function(){
              if(!ionic.Platform.isIPad()){
                return'templates/iPhone/details.html';
              } else{
                return'templates/details.html';
              }
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
    })
  .state('app.notifications', {
       url: '/notifications',
       views: {
       'menuContent': {
         templateUrl: 'templates/iPhone/notifications.html',
         controller:'Notifications'
       }
     }
   })
  .state('app.notifySettings', {
       url: '/notifySettings',
       views: {
       'menuContent': {
       templateUrl: 'templates/iPhone/notifySettings.html',
       controller:'notificationSetting'
       }
     }
   })
  .state('app.deskMapping', {
               url: '/deskMapping',
               views: {
               'menuContent': {
               templateUrl: 'templates/iPhone/deskMapping.html',
               controller:'deskMapping'
               }
               }
               })
        
  .state('app.SpikeItems', {
               url: '/SpikeItems',
               views: {
               'menuContent': {
               templateUrl: 'templates/iPhone/SpikeItems.html',
               controller:'SpikeItems'
               }
               }
               })
        
        ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});





