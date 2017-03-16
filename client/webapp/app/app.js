// var freepc = angular.module('freepc', ['ngRoute'])
// 			.config(['$routeProvider', '$locationProvider', '$interpolateProvider'], function ($routeProvider, $locationProvider, $interpolateProvider) {
//                 // $interpolateProvider.startSymbol('{a');
//                 // $interpolateProvider.endSymbol('a}');
// 				$routeProvider
// 				.when('/', {
// 					templateUrl: 'templates/index.html',
// 					controller: 'mainCtrl'
// 				});

//                 $locationProvider.html5Mode(true);
// 			}])


// freepc.config(['$interpolateProvider', function($interpolateProvider) {
//   $interpolateProvider.startSymbol('{a');
//   $interpolateProvider.endSymbol('a}');
// }]);


var freepc = angular.module('freepc', ['ngSanitize', 'ngAnimate', 'ui.bootstrap']);

    /*.config(['$interpolateProvider', function($interpolateProvider) {
        $interpolateProvider.startSymbol('{a');
        $interpolateProvider.endSymbol('a}');
	*/