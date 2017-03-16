"use strict";

var express = require('express')
var app = express()

var path = require('path')
var moment = require('moment');

var roomsList = ['E1-04201', 'E1-05204', 'E1-05300', 'E1-053L0', 'E1-053V0', 'E1-05402', 'E1-06101', 'E1-06102', 'E1-06103', 'E1-061V2', 'E1-07403', 'E1-07404', 'E1-07405', 'E1-07406', 'E1-08409','E1-09405', 'E1-10104', 'E1-11300', 'E1-11302', 'E1-11403', 'E1-B1100', 'E1-B1102', 'E1-B1103', 'E1-B11V2', 'E1-B11V3', 'E1-B1203', 'E1-B1204', 'E1-B1400', 'E1-B1401', 'E1-B1402', 'E1-B1403', 'E1-B14V0', 'E1-B14V1', 'E1-B14V2', 'E1-B14V3'];
var dbRooms = 
 {
    "E1-07404": {"capacity": 21},
    "E1-11403": {"capacity": 28},
    "E1-07406": {"capacity": 29},
    "E1-07403": {"capacity": 21},
    "E1-B1204": {"capacity": 31},
    "E1-B1400": {"capacity": 36},
    "E1-B1401": {"capacity": 43},
    "E1-B1402": {"capacity": 47},
    "E1-B1403": {"capacity": 47},
    "E1-B14V2": {"capacity": 47},
    "E1-B14V3": {"capacity": 46},
    "E1-061V2": {"capacity": 27},
    "E1-B14V1": {"capacity": 44},
    "E1-05402": {"capacity": 4},
    "E1-10104": {"capacity": 33},
    "E1-07405": {"capacity": 29},
    "E1-B14V0": {"capacity": 34},
    "E1-04201": {"capacity": 7},
    "E1-B1203": {"capacity": 31},
    "E1-B1100": {"capacity": 36},
    "E1-B1103": {"capacity": 31},
    "E1-B1102": {"capacity": 30},
    "E1-053L0": {"capacity": 6},
    "E1-05204": {"capacity": 4},
    "E1-09405": {"capacity": 51},
    "E1-08409": {"capacity": 39},
    "E1-053V0": {"capacity": 10},
    "E1-06102": {"capacity": 31},
    "E1-06103": {"capacity": 15},
    "E1-06101": {"capacity": 25},
    "E1-B11V3": {"capacity": 29},
    "E1-B11V2": {"capacity": 27},
    "E1-11300": {"capacity": 11},
    "E1-05300": {"capacity": 22},
    "E1-11302": {"capacity": 15}
};

var dbLevels = {};

var getCurrPcLogin = function(dbRooms, rooms_list){
	//Get time now, and time half an hour ago, and transform it into the correct format
	var toDate = getTimeNow();
	var fromDate = getTimeHalfHourAgo();


	// Debugging time formats
	// console.log(toDate);
	// console.log(fromDate);


	//For every room in the predefined array, retrieve the json from the specfic url
	for(let room of rooms_list){

		var request = require('request');
		var url = "https://eif-research.feit.uts.edu.au/api/json/?rFromDate="+ fromDate +"&rToDate="+ toDate +"&rFamily=logins&rSensor=" + room

		console.log(room);
		//Line added to deal with the authorisation request from the uts api. 
		//(note: it is not the best practice and not very secure, but till an alternative is found, this is the solution)
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

		//Debugging
		console.log("Sending request");
		request(url , function (error, response, body) {
			//Debugging
			console.log("got response");

			//Alternative fix to the authorisation problem, still in progress (slows down everything)
			//require('ssl-root-cas').inject();

			if (!error && response.statusCode == 200) {
			 	//Gets the body response from the request call and formats it to json
			 	//Adds information to dbRooms
				addInfoTodbRooms(body, room);
	 
			}else{
			  	console.log(error);

			}
		})
	}
}


//Adds information to dbRooms, and also calls populate levels
//The function"Populate levels" is being called in here to 
//avoid js asynchronus execution
var addInfoTodbRooms = function(body, room){
	var jsonBody = JSON.parse(body);
	for(var attributename in jsonBody){

    	dbRooms[room]["PCLogins"] = jsonBody[attributename][1];
    	dbRooms[room]["freePCs"] = dbRooms[room]["capacity"] - dbRooms[room]["PCLogins"];
    	dbRooms[room]["name"] = room.substring(3, 5) + "." + room.substring(5, 8);
    	dbRooms[room]["level"] = room.substring(3, 5);

	}

	populateLevels(roomsList, room);
}

//Populates dbLevels with information
var populateLevels = function(rooms_list, room){
		var levelNum =  room.substring(3, 5);
		if(levelNum in dbLevels){
			dbLevels[levelNum]["rooms"].push(dbRooms[room]);
		}
		else{
			dbLevels[levelNum] = {
				"name" : levelNum,
				"capacity" : 0,
				"usedPCs" : 0,
				"freePCs" : 0,
				"rooms" : [dbRooms[room]]
			}
		}

		dbLevels[levelNum]['capacity'] += dbRooms[room]['capacity'];
		//console.log("This is the capacity " + dbLevels[levelNum]['capacity']);

		dbLevels[levelNum]['usedPCs'] += dbRooms[room]['PCLogins'];
		//console.log("This is the used PCs " + dbLevels[levelNum]['usedPCs']);

		dbLevels[levelNum]['freePCs'] += dbRooms[room]['capacity'] - dbRooms[room]['PCLogins'];
		//console.log("This is the freePCs " + dbLevels[levelNum]['freePCs'] );


		//Caluclates the percetage of the occupied pcs
		var percentage = 100 * ((dbLevels[levelNum]['freePCs']) / (dbLevels[levelNum]['capacity']));
		dbLevels[levelNum]['percentage'] = percentage;
		//console.log("Printing percentagw: " + percentage);
		var lvlType;
		if (percentage <= 15){
			lvlType = "danger";
		}
		else if( percentage > 15 && percentage <= 30){
			lvlType = "warning";
		}
		else{
			lvlType = "success";
		}

		dbLevels[levelNum]['type'] = lvlType;
		//console.log("Printing level type " + lvlType);


}



//function turns time into the correct format to put in the url for the api retrieval
//eg of the correct format 
//2017-03-01T09%3A31%3A44
var getTimeNow = function(){
	var now = moment().format();
	var timenow = now.toString().split("+");
	var timeSplit = timenow[0].toString().split(":");
	var finalNow = timeSplit[0] + "%3A" + timeSplit[1] + "%3A" + timeSplit[2];

	return finalNow;

}

//Similar role to the function above, but instead of returning the time now, 
//returns the time 30 minutes ago from now, in the correct format
//for url
var getTimeHalfHourAgo = function(){
	var now = moment().format();
	var halfHourAgo = moment(now).subtract("30", "minutes").format();
	var timenow = halfHourAgo.toString().split("+");
	var timeSplit = timenow[0].toString().split(":");
	var finalNow = timeSplit[0] + "%3A" + timeSplit[1] + "%3A" + timeSplit[2];

	return finalNow;

}

//Calls to function
getCurrPcLogin(dbRooms, roomsList);




//Express code


//set paths for the libraries and dependencies to be imported
app.use(express.static(path.join(__dirname, "../client", "/webapp/assets")))
app.use(express.static(path.join(__dirname, "../client", "/webapp/app")))


//Serves the index.html page
app.get('/', function (req, res) {
  
  res.sendFile(path.join(__dirname, "../client", "/webapp/index.html"))
})


//Sends to data to angular to process
app.get('/data', function (req, res) {
	var jsnLevels = JSON.stringify(dbLevels)
  	res.send(jsnLevels)
})

//Debugging
app.listen(3000, function () {
  console.log('Applistening on port 3000!')
})