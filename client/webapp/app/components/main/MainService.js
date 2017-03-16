freepc.factory("MainService", [ '$http', function ($http) {


		function getSensorData() {
			return $http.get('/static/app/components/main/sensor_data.json');
			console.log("we are here");
		}

		return {
			getSensorData: getSensorData
		}
		
		/*get: function() {
			console.log("inside factory service");
			return $http.get('/static/app/components/main/sensor_data.json');
		}*/
	
}]);