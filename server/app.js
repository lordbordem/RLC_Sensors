"use strict";

var express = require('express')
var app = express()

var path = require('path')
var moment = require('moment');

var locationList = ['']


var peopleCounterLocationList = ['PCB101-LevelB1CenterPCLabs1', 'PCB102-LevelB1WesternPCLabs1', 'PC0005-WattleStreetWest1,' 'PC0006-WattleStreetWest2', 'PC0007-WattleStB10Entrance', 'PC0008-BroadwayWest2Stairs', 'PC0009-BroadwayWest1', 'PC0111-CafeWest', 'PC0112-StairsToLevel2', 'PC0113-PennyLaneExit', 'PC0214-BroadwayEastEntrance', 'PC0215-DataArena', 'PC0216-JonesStEntrance', 'PC0420-Classroom400', 'PC0522-Level5StairsDown', 'PC0523-Classroom200', 'PC0825-CHTArea', 'PC0926-CassArea', 'PC0927-Level9StairsUp', 'PC0928-Level9StairsDown', 'PC0929-StaffCommonRoom', 'PC1030-Level10BridgeEast', 'PC1131-Level11BridgeEast', 'PC1132-SchoolOfCivil', 'PC1133-Level11StairsUp'];

var dbPeopleCounterList =
  {
    "PCB101-LevelB1CenterPCLabs1": {},
    "PCB102-LevelB1WesternPCLabs1": {},
    "PC0005-WattleStreetWest1": {},
    "PC0006-WattleStreetWest2": {},
    "PC0007-WattleStB10Entrance": {},
    "PC0008-BroadwayWest2Stairs": {},
    "PC0009-BroadwayWest1": {},
    "PC0111-CafeWest": {},
    "PC0112-StairsToLevel2": {},
    "PC0113-PennyLaneExit": {},
    "PC0214-BroadwayEastEntrance": {},
    "PC0215-DataArena": {},
    "PC0216-JonesStEntrance": {},
    "PC0420-Classroom400": {},
    "PC0522-Level5StairsDown": {},
    "PC0523-Classroom200": {},
    "PC0825-CHTArea": {},
    "PC0926-CassArea": {},
    "PC0927-Level9StairsUp": {},
    "PC0928-Level9StairsDown": {},
    "PC0929-StaffCommonRoom": {},
    "PC1030-Level10BridgeEast": {},
    "PC1131-Level11BridgeEast": {},
    "PC1132-SchoolOfCivil": {},
    "PC1133-Level11StairsUp": {}

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
