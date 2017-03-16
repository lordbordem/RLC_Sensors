"use strict";

var express = require('express')
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io')(server) // new
  , events = require('events')
  , EventEmitter = require('events').EventEmitter
  , ip = require('ip')
  , ejs= require('ejs');;;;;;

var path = require('path')
var moment = require('moment');

var async = require('async');

var locationList = [''];

const util = require('util');

var peopleCounterLocationList = ['PC00.07', 'PC01.12', 'PC01.13', 'PC02.14', 'PC02.16', 'PC05.22',  'PC09.27', 'PC09.28', 'PC11.33'];
var peopleStairLocationList = ['PC05.22',  'PC09.27', 'PC09.28', 'PC11.33'];
var peopleEntrancelocationList = ['PC00.07', 'PC01.12', 'PC01.13', 'PC02.14', 'PC02.16'];

var dbPeopleCounterOUT =
  {
    "PC00.07": {"OUT": 21},
    "PC01.12": {"OUT": 21},
    "PC01.13": {"OUT": 21},
    "PC02.14": {"OUT": 21},
    "PC02.16": {"OUT": 21},
    "PC05.22": {"OUT": 21},
    "PC09.27": {"OUT": 21},
    "PC09.28": {"OUT": 21},
    "PC11.33": {"OUT": 21}
  };
  
var dbPeopleCounterIN =
  {
    "PC00.07": {"IN": 21},
    "PC01.12": {"IN": 21},
    "PC01.13": {"IN": 21},
    "PC02.14": {"IN": 21},
    "PC02.16": {"IN": 21},
    "PC05.22": {"IN": 21},
    "PC09.27": {"IN": 21},
    "PC09.28": {"IN": 21},
    "PC11.33": {"OUT": 21}
  };
  
var dbPeopleCounterTotalOUT =
  {
    "PC00.07": {"TotalOUT": 21},
    "PC01.12": {"TotalOUT": 21},
    "PC01.13": {"TotalOUT": 21},
    "PC02.14": {"TotalOUT": 21},
    "PC02.16": {"TotalOUT": 21},
    "PC05.22": {"TotalOUT": 21},
    "PC09.27": {"TotalOUT": 21},
    "PC09.28": {"TotalOUT": 21},
    "PC11.33": {"TotalOUT": 21}
  };

var dbPeopleCounterTotalIN =
  {
    "PC00.07": {"TotalIN": 21},
    "PC01.12": {"TotalIN": 21},
    "PC01.13": {"TotalIN": 21},
    "PC02.14": {"TotalIN": 21},
    "PC02.16": {"TotalIN": 21},
    "PC05.22": {"TotalIN": 21},
    "PC09.27": {"TotalIN": 21},
    "PC09.28": {"TotalIN": 21},
    "PC11.33": {"TotalIN": 21}
   };
   
var totalkjUP = 0;
var totalkjDOWN = 0;

var totalstairdown = 0;
var totalstairup = 0;
var totalupsteps = 0;
var totaldownsteps = 0;

function totalupkj(pplCounterList, pplCount_list){
console.log("calculating total up");
	for(let pplCount of pplCount_list){
		totalstairup += dbPeopleCounterTotalIN[pplCount]["TotalIN"]
	}
	totalupsteps = totalstairup * 22;
	console.log(totalstairup);
	totalkjUP = totalstairup *17.2;
	console.log(totalstairup + " UTS Students burned a total of " + totalkjUP + "kj going down a total of " + totalupsteps + " steps");
}
	
	
function totaldownkj(pplCounterList, pplCount_list){
console.log("calculating total down");
	for(let pplCount of pplCount_list){
		totalstairdown += dbPeopleCounterTotalOUT[pplCount]["TotalOUT"]
	}
	totaldownsteps = totalstairdown * 22;
	console.log(totalstairdown);
	totalkjDOWN = totalstairdown * 5.1;
	console.log(totalstairdown + " UTS Students burned a total of " + totalkjDOWN + "kj going down a total of " + totaldownsteps + " steps");
}




//var peopleCounterLocationList = ['PC0007-WattleStB10Entrance', 'PC0112-StairsToLevel2', 'PC0113-PennyLaneExit', 'PC0214-BroadwayEastEntrance', 'PC0216-JonesStEntrance', 'PC0522-Level5StairsDown',  'PC0927-Level9StairsUp', 'PC0928-Level9StairsDown', 'PC1133-Level11StairsUp'];
/*
var dbPeopleCounterList =
  {
    "PC0007-WattleStB10Entrance": {},
    "PC0112-StairsToLevel2": {},
    "PC0113-PennyLaneExit": {},
    "PC0214-BroadwayEastEntrance": {},
    "PC0216-JonesStEntrance": {},
    "PC0522-Level5StairsDown": {},
    "PC0927-Level9StairsUp": {},
    "PC0928-Level9StairsDown": {},
    "PC1133-Level11StairsUp": {}
  };
*/

var underscore = require("underscore.string");
var math = require('mathjs');



//var waspmoteList = ['ES_B_04_415_7BD1','ES_B_05_416_7C15','ES_B_10_427_7B90','ES_B_07_420_7E1D','ES_B_09_425_3E8D','ES_B_10_426_7E1E','ES_B_05_417_7C13','ES_B_01_411_7E39','ES_A_05_175_CE2E','ES_B_09_424_B74C','ES_B_12_431_7BC2','ES_B_04_414_7C00','ES_B_07_421_7C17','ES_B_11_429_3E90','ES_B_08_423_7BE2','ES_B_12_430_44DE','ES_B_02_412_3E68','ES_B_06_418_7BED','ES_C_13_302_C88E','ES_B_06_419_7C09','ES_B_08_422_7BDC','ES_B_11_428_3EA4','ES_A_03_141_CE3A','ES_A_03_151_CE38','ES_A_07_293_3E72','ES_A_03_153_CE2A','ES_A_04_163_7C58','ES_A_06_195_3E87','ES_A_13_276_7C44','ES_A_04_159_7B7E','ES_A_09_298_7BC5','ES_A_12_301_7BB6','ES_A_09_226_44DF','ES_A_07_207_44FA']
/*
var dbWaspmote = {
	"ES_B_04_415_7BD1": {"CO2": 21},
	"ES_B_05_416_7C15": {"CO2": 21},
	"ES_B_10_427_7B90": {"CO2": 21},
	"ES_B_07_420_7E1D": {"CO2": 21},
	"ES_B_09_425_3E8D": {"CO2": 21},
	"ES_B_10_426_7E1E": {"CO2": 21},
	"ES_B_05_417_7C13": {"CO2": 21},
	"ES_B_01_411_7E39": {"CO2": 21},
	"ES_A_05_175_CE2E": {"CO2": 21},
	"ES_B_09_424_B74C": {"CO2": 21},
	"ES_B_12_431_7BC2": {"CO2": 21},
	"ES_B_04_414_7C00": {"CO2": 21},
	"ES_B_07_421_7C17": {"CO2": 21},
	"ES_B_11_429_3E90": {"CO2": 21},
	"ES_B_08_423_7BE2": {"CO2": 21},
	"ES_B_12_430_44DE": {"CO2": 21},
	"ES_B_02_412_3E68": {"CO2": 21},
	"ES_B_06_418_7BED": {"CO2": 21},
	"ES_C_13_302_C88E": {"CO2": 21},
	"ES_B_06_419_7C09": {"CO2": 21},
	"ES_B_08_422_7BDC": {"CO2": 21},
	"ES_B_11_428_3EA4": {"CO2": 21},
	"ES_A_03_141_CE3A": {"CO2": 21},
	"ES_A_03_151_CE38": {"CO2": 21},
	"ES_A_07_293_3E72": {"CO2": 21},
	"ES_A_03_153_CE2A": {"CO2": 21},
	"ES_A_04_163_7C58": {"CO2": 21},
	"ES_A_06_195_3E87": {"CO2": 21},
	"ES_A_13_276_7C44": {"CO2": 21},
	"ES_A_04_159_7B7E": {"CO2": 21},
	"ES_A_09_298_7BC5": {"CO2": 21},
	"ES_A_12_301_7BB6": {"CO2": 21},
	"ES_A_09_226_44DF": {"CO2": 21},
	"ES_A_07_207_44FA": {"CO2": 21}
};
*/

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
var counter = 0;


var getPeopleOutCounter = function(pplCounterList, pplCount_list){
	//Get time now, and time half an hour ago, and transform it into the correct format
	var toDate = getTimeNow();
	var fromDate = getTime1WeekAgo();

	//For every waspmote in the predefined array, retrieve the json from the specfic url
	for(let pplCount of pplCount_list){
		var request = require('request');
		var url = "https://eif-research.feit.uts.edu.au/api/json/?rFromDate="+ fromDate +"&rToDate="+ toDate +"&rFamily=people&rSensor=" + "+" + pplCount + "+" + "%28Out%29"

		//Line added to deal with the authorisation request from the uts api. 
		//(note: it is not the best practice and not very secure, but till an alternative is found, this is the solution)
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	
		//Debugging
		console.log("Sending request");
		request(url , function (error, response, body) {
			//Debugging
			console.log("got response");
			//console.log(body);
			
			//Alternative fix to the authorisation problem, still in progress (slows down everything)
			//require('ssl-root-cas').inject();
			if (!error && response.statusCode == 200) {
			 	//Gets the body response from the request call and formats it to json
			 	//Adds information to dbRooms
				addInfoTodbPPlCountOut(body, pplCount);
	 
			}else{
			  	console.log(error);

			}
		})
	}
	

}


//Updates Total Out Counter for The People Counter
var addInfoTodbPPlCountOut = function(body, pplCount){
	console.log("The current pplCount before is... " + counter);
	var jsonBody = JSON.parse(body);
	for(var attributename in jsonBody){
		//console.log("The current pplcount is... " + attributename);
		//pplCountDB.set({Sensor_Name: pplCount, OUT: "OUT", TIME: jsonBody[attributename][0], ppl: jsonBody[attributename][1]});
    	dbPeopleCounterOUT[pplCount]["OUT"] = jsonBody[attributename][1];
		dbPeopleCounterTotalOUT[pplCount]["TotalOUT"] += jsonBody[attributename][1];
		//console.log("The total out for " + dbPeopleCounterTotalOUT[pplCount] + "is the following" + dbPeopleCounterTotalOUT[pplCount]["TotalOUT"]);
	}
	totaldownkj(dbPeopleCounterTotalOUT,peopleStairLocationList);

	//console.log(util.inspect(dbPeopleCounterTotalOUT, {showHidden: false, depth: null}))

}


var getPeopleINCounter = function(pplCounterList, pplCount_list){
	//Get time now, and time half an hour ago, and transform it into the correct format
	var toDate = getTimeNow();
	var fromDate = getTime1WeekAgo();

	//For every waspmote in the predefined array, retrieve the json from the specfic url
	for(let pplCount of pplCount_list){
		var request = require('request');
		var url = "https://eif-research.feit.uts.edu.au/api/json/?rFromDate="+ fromDate +"&rToDate="+ toDate +"&rFamily=people&rSensor=" + "+" + pplCount + "+" + "%28In%29"

		//Line added to deal with the authorisation request from the uts api. 
		//(note: it is not the best practice and not very secure, but till an alternative is found, this is the solution)
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	
		//Debugging
		console.log("Sending request");
		request(url , function (error, response, body) {
			//Debugging
			console.log("got response");
			//console.log(body);
			
			//Alternative fix to the authorisation problem, still in progress (slows down everything)
			//require('ssl-root-cas').inject();
			if (!error && response.statusCode == 200) {
			 	//Gets the body response from the request call and formats it to json
			 	//Adds information to dbRooms
				addInfoTodbPPlCountIn(body, pplCount);
	 
			}else{
			  	console.log(error);

			}
		})
	}
}


//Updates Total IN Counter for The People Counter
var addInfoTodbPPlCountIn = function(body, pplCount){
	//console.log("The current pplCount before is... " + counter);
	var jsonBody = JSON.parse(body);
	for(var attributename in jsonBody){
		//console.log("The current pplcount is... " + attributename);
		//pplCountDB.set({Sensor_Name: pplCount, OUT: "OUT", TIME: jsonBody[attributename][0], ppl: jsonBody[attributename][1]});
    	dbPeopleCounterIN[pplCount]["IN"] = jsonBody[attributename][1];
		dbPeopleCounterTotalIN[pplCount]["TotalIN"] += jsonBody[attributename][1];
		//console.log("The total in for " + pplCount + "is the following" + dbPeopleCounterTotalIN[pplCount]["TotalIN"]);
	}
	totalupkj(dbPeopleCounterTotalIN,peopleStairLocationList);
	//console.log(util.inspect(dbPeopleCounterTotalIN, {showHidden: false, depth: null}))
}


/*
var getWaspmotes = function(waspmoteList, waspmote_list){
	//Get time now, and time half an hour ago, and transform it into the correct format
	var toDate = getTimeNow();
	var fromDate = getTimeHalfHourAgo();


	// Debugging time formats
	// console.log(toDate);
	// console.log(fromDate);


	//For every waspmote in the predefined array, retrieve the json from the specfic url
	for(let waspmote of waspmote_list){

		var request = require('request');
		var url = "https://eif-research.feit.uts.edu.au/api/json/?rFromDate="+ fromDate +"&rToDate="+ toDate +"&rFamily=wasp&rSensor=" + waspmote + "&rSubSensor=CO2"
		console.log("the url is.." + url);
		counter++;
		//console.log(waspmote);
		//Line added to deal with the authorisation request from the uts api. 
		//(note: it is not the best practice and not very secure, but till an alternative is found, this is the solution)
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		console.log("The count of waspmote currently is... " + counter);
		//Debugging
		console.log("Sending request");
		request(url , function (error, response, body) {
			//Debugging
			console.log("got response");
			console.log(body);
			//Alternative fix to the authorisation problem, still in progress (slows down everything)
			//require('ssl-root-cas').inject();

			if (!error && response.statusCode == 200) {
			 	//Gets the body response from the request call and formats it to json
			 	//Adds information to dbRooms
				addInfoTodbWaspmote(body, waspmote);
	 
			}else{
			  	console.log(error);

			}
		})
	}
}



//Adds information to dbRooms, and also calls populate levels
//The function"Populate levels" is being called in here to
//avoid js asynchronus execution
var addInfoTodbWaspmote = function(body, waspmote){
	console.log("The current waspmote before is... " + counter);
	var jsonBody = JSON.parse(body);
	for(var attributename in jsonBody){
		console.log("The current waspmote is... " + attributename);
    	dbWaspmote[waspmote]["CO2"] = jsonBody[attributename][1];
		console.log(dbWaspmote[waspmote]["CO2"]);
	}

}


*/


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

var getTime24HourAgo = function(){
	var now = moment().format();
	var halfHourAgo = moment(now).subtract("24", "hours").format();
	var timenow = halfHourAgo.toString().split("+");
	var timeSplit = timenow[0].toString().split(":");
	var finalNow = timeSplit[0] + "%3A" + timeSplit[1] + "%3A" + timeSplit[2];

	return finalNow;

}

var getTime48HourAgo = function(){
	var now = moment().format();
	var halfHourAgo = moment(now).subtract("48", "hours").format();
	var timenow = halfHourAgo.toString().split("+");
	var timeSplit = timenow[0].toString().split(":");
	var finalNow = timeSplit[0] + "%3A" + timeSplit[1] + "%3A" + timeSplit[2];

	return finalNow;

}


var getTime1WeekAgo = function(){
	var now = moment().format();
	var halfHourAgo = moment(now).subtract("7", "days").format();
	var timenow = halfHourAgo.toString().split("+");
	var timeSplit = timenow[0].toString().split(":");
	var finalNow = timeSplit[0] + "%3A" + timeSplit[1] + "%3A" + timeSplit[2];

	return finalNow;

}


//Calls to function
//getCurrPcLogin(dbRooms, roomsList);
//getWaspmotes(dbWaspmote,waspmoteList);
getPeopleINCounter(dbPeopleCounterIN,peopleCounterLocationList);
getPeopleOutCounter(dbPeopleCounterOUT,peopleCounterLocationList);

var serverIP = ip.address() ;
setTimeout(function(){ 
  server.listen(app.get('port'), serverIP, function(){ 
  console.log('Express server listening on: ', serverIP, ':', app.get('port'));
});
}, 2000);



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

//Sockets (Real Time Updating)
var user_count = 0;


io.on('connection', function (socket) {
    user_count++;
    socket.emit('users', { number: user_count });
    socket.broadcast.emit('users', { number: user_count });
    console.log("user_count: ", user_count);
    console.log("socket is connected");
    initialpageUpdate();
    pageUpdate();

    socket.on('disconnect', function () {
        user_count--;
        socket.broadcast.emit('users', { number: user_count });
        console.log(user_count);
    });


    function initialpageUpdate() {
        setTimeout(function () {
            console.log("Starting initial page update...");
            initialUpdate();
        }, 10000)
    }

    function pageUpdate() {
        setTimeout(function () {
            console.log("Starting page update...");
            intervalUpdate()
        }, 25000)
    }

    // Send time every 2 seconds
    setInterval(function () {
        var now = new Date();
        socket.emit('timer_tick', { string: getTimeStampLog() });
    }, 1000);

    function intervalUpdate() {
        setInterval(function () {
            console.log("Updating Page...");
            UpdatePage();
        }, 35000);
    }


    function initialUpdate() {
	
		socket.emit('upkj', JSON.stringify(data));
		socket.emit('downkj', JSON.stringify(data));
		socket.emit('totalstairsup', JSON.stringify(data));
		socket.emit('totalstairsdown', JSON.stringify(data));
		socket.emit('totalentrance', JSON.stringify(data));
		socket.emit('totalexit', JSON.stringify(data));
    };
	



    function UpdatePage() {
      
    }



});
