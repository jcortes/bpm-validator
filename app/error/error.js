viewsModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when("/error", {
        controller: "ErrorCtrl",
        template: "<h2>Error Loading Countries, Try Again</h2>"
    });
}]);

viewsModule.controller('ErrorCtrl', ['$rootScope',function($rootScope) {
    $rootScope.isLoading = false;
}]);