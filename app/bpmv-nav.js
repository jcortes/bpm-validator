angular.module('bpmvNav', [])

.value('bpmvNavData', {
    current: null
})

.controller('NavCtrl', ['$scope', 'bpmvNavData', function($scope, bpmvNavData){
    $scope.nav = bpmvNavData;
}])