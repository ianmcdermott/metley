const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize"
const SPOTIFY_CATEGORY_URL = "https://api.spotify.com/v1/browse/categories"
let AUTHORIZATION_CODE = "BQD_SyLUeocxLxr2jCK5-4h7TgEpB4DEcfbCkB2qlOQJusT76q1JAtRx0AQDx7CxtANevlZrvVQHwxAihEu6dg";
const WMATA_DELAY_URL = "https://api.wmata.com/Incidents.svc/json/Incidents";
const WMATA_STATIONS_URL = "https://api.wmata.com/Rail.svc/json/jStations";
const WMATA_STATION_TO_STATION_URL = "https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo"
const STATION_CODE_URL = "https://api.wmata.com/Rail.svc/json/jStations/"

const WMATA_KEY = "cc26ae8a817a4cb296f2a9a68f5b9c0a";
let spotifyUserId = "";

let TRACK_IDS = [];
const PLAYLIST = [];
//const TRACKS = [];
const MASTER_TRACKLIST = [];
let playlistArray = [];

let musicKey = Math.floor(Math.random(12));
let desiredMood = "";

let waitTime = 0;
let tripTime = 0;
let delayTime = 0;

let playlistTime = 0;

let fromStation = "";
let toStation = "";
let totalTime = 0;
let masterTrackCount = 0;
let toCode = "";
let fromCode = "";
const stationItems = [];
let lineColor = "";
let playlistLoop = 0;
let trackCount = 0;

// 	====================================== * * * * * * WMATA API  * * * * * * ====================================== //
//Add station names to the loc/dest options
function getStationCode(fs, ts){
	let tc = stationItems.find(function(item){
		return getCode(item, ts, "Code");
	});
	let fc = stationItems.find(function(item){
		return getCode(item, fs, "Code");
	});
	let lc = stationItems.find(function(item){
		return getCode(item, fs, "LineCode1");
	});

	fromCode = fc.Code;
	toCode = tc.Code;
	lineColor = lc.LineCode1;
}

function getCode(item, variable, key){
	if(item.Name === variable){
		return item.Code;
	}
}

function getLine(item, variable, key){
	if(item.Name === variable){
		return item.LineCode1;
	}
}


function calculateJourneyTime(){
//	getWMATAStations(returnStationCode);
	getWaitTime();	

}

//Adds Station Names to the Loc/Dest Menus
function addStationNames(){
	let stations = getWMATAStations(getStationID);
//	$(clearSelectionBoxes);
}

function getWMATAStations(callback){
	const settings = {
		headers: {'api_key': WMATA_KEY},
		url: WMATA_STATIONS_URL,
		success: callback
	};
	$.ajax(settings)
}

function getStationID(data){
	const station = [];
	data.Stations.map(function(item, index){
		station.push(item.Name);
		stationItems.push(item);
	});
	station.sort();
	for(let i=0; i < station.length; i++){
		$("#location").append(`<option>${station[i]}</option>`);
		$("#destination").append(`<option>${station[i]}</option>`);
	};
}


///////// ::::: :: : : WAIT TIME CALCULATIONS : : :: :::::: /////////
//function that returns wait time
function getWaitTime(){
	//function that retrieves location's code*/
	getWaitPredictionEndpoint(returnWaitTime);
}

//gets wait time from Predictions API
function getWaitPredictionEndpoint(callback){
	let params = {
            "api_key": WMATA_KEY,
        };
     let settings = {
        url: `https://api.wmata.com/StationPrediction.svc/json/GetPrediction/${fromCode}?`
         + $.param(params),
        type: "GET",
        success: function(data){
        	callback(data);
        },
    };

    $.ajax(settings);
}

//Get Time of Wait 
function returnWaitTime(data){
	for(let i = 0; i < data.Trains.length; i++){
			waitTime = data.Trains[i].Min;
	}
	getDelayTime();	
}



///////// ::::: :: : : DELAY TIME CALCULATIONS : : :: :::::: /////////
//function that returns delay time
function getDelayTime(){
	$(".js-journey-form").submit(event => {
		const destination = $("#destination")
	})
	getDelayPredictionAPI(returnDelayTime); //placeholder
}
//gets API data from incidents API
function getDelayPredictionAPI(callback){
	const settings = {
		headers: { "api_key": WMATA_KEY},
		url: WMATA_DELAY_URL,
		success: callback,
	}
	$.ajax(settings)
}

//returns delay time as a number
function returnDelayTime(data){
	for(let incident in data.Incidents){
		if(incident !== undefined){
			if(lineColor === incident.LinesAffected){
				delayTime = data.Incidents[0].PassengerDelay;
			}
		} else {
			delayTime = 0;
		}
	}
	getTripPredictionAPI(returnTripTime);
}

///////// ::::: :: : : TRIP TIME CALCULATIONS : : :: :::::: /////////
//function that returns length of trip
function getTripPredictionAPI(callback){
	let query= `FromStationCode=${fromCode}&ToStationCode=${toCode}`;

	const settings = {	
		headers: { "api_key": WMATA_KEY },

		url: `https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo?${query}`,
		success: callback,
	//	async: false
	};
	$.ajax(settings);
}

//Return the Railtime of the first/only item in Station to Station Info
function returnTripTime(data){
	tripTime =  data.StationToStationInfos[0].RailTime;
	direction = data.StationToStationInfos[0].RailTime;
	totalTime = parseInt(parseInt(tripTime)+parseInt(waitTime)+parseInt(delayTime));

	sessionStorage.totalTime = JSON.stringify(totalTime);

	sessionStorage.tripTime = JSON.stringify(tripTime);
	sessionStorage.waitTime = JSON.stringify(waitTime);
	sessionStorage.delayTime = JSON.stringify(delayTime);

	handleSpotify(desiredMood);
}

//////////////////// ###### ###### ###### ###### ###### ###### ###### ###### ###### ////////////////////

										//	SPOTIFY METHODS  //

//////////////////// ###### ###### ###### ###### ###### ###### ###### ###### ###### ////////////////////
function handleSpotify(desiredMood){	
	getSpotifyPlaylist(getPlaylistItems, desiredMood);
	
}

//calls playlist API
function getSpotifyPlaylist(callback, category){
	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url:  `https://api.spotify.com/v1/browse/categories/${category}/playlists`,
		success: callback,
		error: "Error getting playlist"
	//	async: false
	};
	$.ajax(settings)
}


//returns array of playlist id's
function getPlaylistItems(data){
	getPlaylistTracks(getTrackIDs, data.playlists.items[playlistLoop].id);
}

//gets the tracks listed in a playlist
function getPlaylistTracks(callback, playlistID){
	settings = {
		url: `https://api.spotify.com/v1/users/Spotify/playlists/${playlistID}/tracks`,
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		success: callback,
	//	async: false
	};
	$.ajax(settings);
}

//Push and object with track ID's and track names to its own array
function getTrackIDs(data){
	TRACK_IDS = [];
	for(let i = 0; i < data.items.length; i++){
		TRACK_IDS.push({id: data.items[i].track.id, name: data.items[i].track.name});
	}	

	parsePlaylists(data.items.length);
}

function parsePlaylists(limit){
	filterTracks(parseKey, TRACK_IDS.id, TRACK_IDS.name); 
}

///////// ::::: :: : : PLAYLIST SORTING ALGORITHMS : : :: :::::: /////////
//get the Audio features from first tracks in list
function filterTracks(callback, trackID, trackName){
	//Spotify's https://api.spotify.com/v1/audio-features endpoint can take up to 100
	//comma-separated track ID's
	let stringOfTracks = [];
	TRACK_IDS.forEach(item => stringOfTracks.push(item.id));

	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: `https://api.spotify.com/v1/audio-features/?ids=${stringOfTracks.toString()}`,
		success: function(data){
			callback(data, trackName);
		},
	}; 
	$.ajaxSetup({
   		cache: false
	});
	$.ajax(settings);
}

//Add song if key matches
function parseKey(data, trackName){
	//loop through array from multi-track audio features api
	for(let i = 0; i < data.audio_features.length; i++){
		//check if song is the same key
		if(data.audio_features[i].key === musicKey){
			//check if there's still time to be added to playlist
			if(playlistTime < parseInt(totalTime*60000+60000)){
				MASTER_TRACKLIST.push(data.audio_features[i]);
				MASTER_TRACKLIST[MASTER_TRACKLIST.length-1].name = TRACK_IDS[i].name;
				playlistTime += data.audio_features[i].duration_ms;	
				updateProgress(Math.round(playlistTime/parseInt(totalTime*60000+60000)));

			} else {
				updateProgress(100);

				createPlaylist(addTracksToPlaylist);
				break;
			}
		}	
	}
	playlistLoop+=1;
	getSpotifyPlaylist(getPlaylistItems, desiredMood);
}

function createPlaylist(callback){
	var url = 'https://api.spotify.com/v1/users/' + spotifyUserId + '/playlists';
	$.ajax(url, {
		method: 'POST',
		data: JSON.stringify({
			'name': 'Metly: A ' + desiredMood + " Journey to " destination,
			'public': false
		}),
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + AUTHORIZATION_CODE,
			'Content-Type': 'application/json'
		},
		success: function(data) {
			callback(data, openPlaylist);
		},
		error: function(data) {
			callback(null);
		}
	});
}

function addTracksToPlaylist(data, callback){
	sessionStorage.songs = JSON.stringify(MASTER_TRACKLIST); 

	let playlistId = data.id;
	let tracks = [];
	for(let i = 0; i < MASTER_TRACKLIST.length; i++){
		tracks.push(MASTER_TRACKLIST[i].id);
	}
	let tracksString = tracks.join(",spotify:track:");
	
	var url = 'https://api.spotify.com/v1/users/' + spotifyUserId +
		'/playlists/' + playlistId +
		'/tracks?uris='+encodeURIComponent("spotify:track:"+tracksString);
	$.ajax(url, {
		method: 'POST',
		//data: {'uris':'tracksString'},
		dataType: 'text',
		headers: {
			'Authorization': 'Bearer ' + AUTHORIZATION_CODE,
			'Content-Type': 'application/json'
		},
		success: function(d) {
			callback(d, data.external_urls.spotify);
		},
		error: function(r) {
			callback(null, null);
		}
	});
}

function openPlaylist(data, link){
	window.open(link);
	$("#js-journey-form").unbind().submit();
}

//order songs by lowest energy to highest
function sortByEnergy(a, b){
	console.log("sorting ");
	return a - b;
}

///////// ::::: :: : : DOM RENDERING : : :: :::::: /////////
function renderPlaylist(songs){
	songs.forEach(item => {
		let duration = convertTrackTime(item.duration_ms);
		$(".js-playlist").append(`
			<div class="js-playlist-entry">
				<p class="js-song-name">${item.name}</p>
				<p class="js-song-time">${duration}</p>
			</div>	
		`);
	});
}

function convertTrackTime(trackDuration){
	return Math.floor(trackDuration/60000)+":"+Math.ceil(((trackDuration/60000) % 1)*60);
}

///////// ::::: :: : : Menu Item Methods : : :: :::::: /////////
//Add category names to the mood options
function addCategoryNames(){
	AUTHORIZATION_CODE = JSON.parse(sessionStorage.access);
	spotifyUserId = JSON.parse(sessionStorage.userId);
	let categories = getSpotifyCategory(getCategoryID);
	$(clearSelectionBoxes);
}
//Gets Category Data from Spotify API
function getSpotifyCategory(callback){
	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: SPOTIFY_CATEGORY_URL,
		success: callback
	};
	$.ajax(settings)
}
//gets playlist API based on categories

function getCategoryID(data){
	const category =  data.categories.items.map((item, index) => item.id);
	category.sort();
	for(let i=0; i < category.length; i++){
		$("#mood").append(`<option>${category[i]}</option>`);
	}
}


function clearSelectionBoxes(){
	$("#mood").attr("selectedIndex", -1);
	$("#location").attr("selectedIndex", -1);
	$("#destination").attr("selectedIndex", -1);
}

function convertToSeconds(milliseconds){
	return milliseconds/1000;
}

///////// ::::: :: : : Event Listeners : : :: :::::: /////////
//Function listens for submit button, runs getplaylist functions
function handleSubmit(){
	$(".js-journey-form").submit(function(event){ 
		event.preventDefault();
		showProgress();
		sessionStorage.clear();
		desiredMood = $(this).find("#mood").val(); 
		fromStation = $(this).find("#location").val();
		toStation = $(this).find("#destination").val();
		if(fromStation == toStation){
			alert("Please make sure that your current station and destination are different.");
		}
		getStationCode(fromStation, toStation);

		sessionStorage.mood = JSON.stringify(desiredMood);
		sessionStorage.fromStation = JSON.stringify(fromStation);
		sessionStorage.toStation = JSON.stringify(toStation);
		calculateJourneyTime();
		$(updatePlaylist);
	});
}


function updatePlaylist(){
	let songs = JSON.parse(sessionStorage.getItem("songs"));
	$(renderPlaylist(songs));
}

function renderJourney(){
	tripTime = JSON.parse(sessionStorage.tripTime);
	waitTime = JSON.parse(sessionStorage.waitTime);
	delayTime = JSON.parse(sessionStorage.delayTime);
	fromStation = JSON.parse(sessionStorage.fromStation);
	toStation = JSON.parse(sessionStorage.toStation);
	let mood = JSON.parse(sessionStorage.mood);

	$(".js-journey-description").text(`A ${mood} Journey from ${fromStation} to ${toStation}`);
	$(".js-wait-time").text(`Wait Time: ${waitTime}`);
	$(".js-trip-time").text(`Travel Time: ${tripTime}`);
	$(".js-delay-time").text(`Delay Time: ${delayTime}`);
}

function showProgress(){
	$('#progress-wrapper').css('display', 'flex');
}

function updateProgress(percentage){
	let elem = document.getElementById('progress-bar');
	let width = 1;
	console.log('progress running ' + percentage*100 + "%");
	
	width = percentage;
	elem.style.width = percentage*100 + '%';
		
	
}

function runApp(){
	runAuth();
	addStationNames();
	addCategoryNames();
	handleSubmit();
}

$(runApp);


//get wait time properly
//Get total time properly
//Get Destination/line
//Fix Journey Details
//Fix
//Order the playlist

 function runAuth() {

       
}