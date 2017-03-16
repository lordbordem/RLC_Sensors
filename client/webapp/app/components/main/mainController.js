freepc.controller('mainCtrl', ['$scope','$http',  function ($scope, $http) {

	$scope.oneAtATime = false;

	this.test = "Tester 123";

    $scope.mytest = "test2";
    console.log("this.test");

    // this.data = dbRooms ;
    // console.log(this.data);

    $scope.getData = function() {
        $http({
            method: 'GET',
            url: '/data',

        }).then(function(response) {
            console.log('called getData');
            console.log('response');
            console.log(response);
            $scope.angularLevels = [];
            $scope.angularLevels.push(response.data['B1']);
            $scope.angularLevels.push(response.data['04']);
            $scope.angularLevels.push(response.data['05']);
            $scope.angularLevels.push(response.data['06']);
            $scope.angularLevels.push(response.data['07']);
            $scope.angularLevels.push(response.data['08']);
            $scope.angularLevels.push(response.data['09']);
            $scope.angularLevels.push(response.data['10']);
            $scope.angularLevels.push(response.data['11']);
            console.log('mm', $scope.angularLevels);
        }, function(error) {
            console.log(error);
        });
    };

    $scope.getData();
    console.log('$scope.angularLevels should be an array: ');
    console.log($scope.angularLevels);
}]);