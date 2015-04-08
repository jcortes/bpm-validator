angular.module('bpmvApp', ['bpmvAppViews', 'ngRoute', 'ngAnimate'])

.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({
        redirectTo : '/'
    });
}])

.run(['$rootScope', '$timeout', 'bpmvNavData', function($rootScope, $timeout, bpmvNavData){
    $rootScope.$on('$routeChangeSuccess', function(e, current, pre){
        bpmvNavData.current = current.$$route.originalPath;
    });
}])