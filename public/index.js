const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize"
const SPOTIFY_CATEGORY_URL = "https://api.spotify.com/v1/browse/categories"
let AUTHORIZATION_CODE = "BQCPViDA8xh91vCK0XXvfLwktq2xSjAGqysRa5TOXU7D20jJRNHcUJbgCfWcaFYtbSnsvBkL-T89Tzd0AZjjTA";
const WMATA_DELAY_URL = "https://api.wmata.com/Incidents.svc/json/Incidents";
const WMATA_STATIONS_URL = "https://api.wmata.com/Rail.svc/json/jStations";
const WMATA_STATION_TO_STATION_URL = "https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo"
const STATION_CODE_URL = "https://api.wmata.com/Rail.svc/json/jStations/"

let spotifyLink = ""

const WMATA_KEY = "cc26ae8a817a4cb296f2a9a68f5b9c0a";
let spotifyUserId = "";

let TRACK_IDS = [];
const PLAYLIST = [];
let MASTER_TRACKLIST = [];
let playlistArray = [];

let musicKey = 0;
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
let firstPlaylist;

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


//Adds Station Names to the Loc/Dest Menus
function addStationNames(){
	let stations = getWMATAStations(getStationID);
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
		$("#location").append(`<option class="js-station-option">${station[i]}</option>`);
		$("#destination").append(`<option>${station[i]}</option>`);
	};
}

///////// ::::: :: : : DELAY TIME CALCULATIONS : : :: :::::: /////////
//function that returns delay time
function getDelayTime(){
	$(".js-journey-form").submit(event => {
		const destination = $("#destination")
	})
	getDelayPredictionAPI(returnDelayTime); 
}

//gets API data from incidents endpoint
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

	//Now that we have all metro data, move on to the spotify API
	getSpotifyPlaylist(getPlaylistItems, desiredMood);
}

//////////////////// ###### ###### ###### ###### ###### ###### ###### ###### ###### ////////////////////

										//	SPOTIFY METHODS  //

//////////////////// ###### ###### ###### ###### ###### ###### ###### ###### ###### ////////////////////
//calls playlist API endpoint
function getSpotifyPlaylist(callback, category){
	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url:  `https://api.spotify.com/v1/browse/categories/${category}/playlists`,
		success: callback,
		error: "Error getting playlist"
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
	};
	$.ajax(settings);
}

//Put any object with track ID's and track names onto its own array
function getTrackIDs(data){
	TRACK_IDS = [];
	for(let i = 0; i < data.items.length; i++){
		TRACK_IDS.push({id: data.items[i].track.id, name: data.items[i].track.name});
	}	

	//Now that we have the API data, time to organize
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
		error: "filterTracks error"
	}; 

	$.ajax(settings);
}

//Add song if key matches to give playlist a cohesive sound
function parseKey(data, trackName){
	//loop through array from multi-track audio features api
	for(let i = 0; i < data.audio_features.length; i++){
		//check if song is the same key
		if(data.audio_features[i] !== null){
			if(data.audio_features[i].key === musicKey){
				//check if there's still time to be added to playlist
				if(playlistTime < parseInt(totalTime*60000+60000)){
					MASTER_TRACKLIST.push(data.audio_features[i]);
					MASTER_TRACKLIST[MASTER_TRACKLIST.length-1].name = TRACK_IDS[i].name;
					playlistTime += data.audio_features[i].duration_ms;	
					updateProgress(playlistTime/parseInt(totalTime*60000+60000));

				} else {
					updateProgress(1);
					sortByEnergy();
					createPlaylist(addTracksToPlaylist);
					break;
				}
			}	
		}
	}
	playlistLoop+=1;
	getSpotifyPlaylist(getPlaylistItems, desiredMood);
}


//order songs by lowest energy to highest so user has a gradual energy build in their listening experience
function sortByEnergy(){
	let sortingArray = [];
	let newMaster = []
	for(let i = 0; i < MASTER_TRACKLIST.length; i++){
		sortingArray.push(MASTER_TRACKLIST[i].energy)
	}
	sortingArray.sort((a, b)=> a-b);

	for(let j = 0; j < sortingArray.length; j++){
		for(let i = 0; i < MASTER_TRACKLIST.length; i++){
			if(MASTER_TRACKLIST[i].energy === sortingArray[j]){
				newMaster.push(MASTER_TRACKLIST[i]);
				break;
			}
		}
	}
	MASTER_TRACKLIST = newMaster; 
}

//Create the playlist on user's spotify account
function createPlaylist(callback){
	var url = 'https://api.spotify.com/v1/users/' + spotifyUserId + '/playlists';
	$.ajax(url, {
		method: 'POST',
		data: JSON.stringify({
			'name': 'Metly: A ' + desiredMood + " Journey to " + toStation,
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

//Add tracks to the playlist that now exists in user's account
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

//Open the playlist in a new tab
function openPlaylist(data, link){
	spotifyLink = link;
	sessionStorage.link =  JSON.stringify(spotifyLink);
	$("#js-journey-form").unbind().submit();
}

///////// ::::: :: : : DOM RENDERING : : :: :::::: /////////
//Render playlist to playlist page
function renderPlaylist(songs){
	spotifyLink = JSON.parse(sessionStorage.link);
	firstPlaylist = JSON.parse(sessionStorage.firstPlaylist);
	
	fromStation = JSON.parse(sessionStorage.fromStation);
	toStation = JSON.parse(sessionStorage.toStation);
	let mood = JSON.parse(sessionStorage.mood);
	
	$('.js-playlist-title').html(`<p>A ${mood} Journey from ${fromStation} to ${toStation}</p>`);
	
	songs.forEach(item => {
		let duration = convertTrackTime(item.duration_ms);
		$(".js-playlist").append(`
			<div class="js-playlist-entry">
			<p class="js-song-name">${item.name}</p>
			<p class="js-song-time">${duration}</p>
			</div>	
			`);
	});

	//open the playlist in a new tab
	if(firstPlaylist == true){
		window.open(spotifyLink);
		sessionStorage.firstPlaylist = false;
	}		
}

//Adds converts song times to minute:second format 
function convertTrackTime(trackDuration){
	let seconds = String(Math.ceil(((trackDuration/60000) % 1)*60));
	//if there's a 0 in the one's place of the seconds, it will have been cleared, this adds back in
	if(seconds.length == 1) seconds+="0";
	return Math.floor(trackDuration/60000)+":"+ seconds;
}

///////// ::::: :: : : Menu Item Methods : : :: :::::: /////////
//Add category names to the mood options
function addCategoryNames(){
	AUTHORIZATION_CODE = JSON.parse(sessionStorage.access);
	spotifyUserId = JSON.parse(sessionStorage.userId);
	let categories = getSpotifyCategory(getCategoryID);
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
	let string;
	let cat;
	for(let i=0; i < category.length; i++){
		if (category[i].indexOf('_') > -1){
			string = category[i];
			cat = string.replace("_", "-");
		} else {
			cat = category[i];
		}
		$("#mood").append(`<option>${cat}</option>`);
	}
}

///////// ::::: :: : : Event Listeners : : :: :::::: /////////
//Function listens for submit button, runs getplaylist functions
function handleSubmit(){
	$(".js-journey-form").submit(function(event){ 
		event.preventDefault();

		//take session storage firstPlaylist variable and convert it to a variable local to index.js, since we're clearing session storage a few lines down 
		//this will help detect if this is the browser's first generation fo the playlist, rather than  
		firstPlaylist = JSON.parse(sessionStorage.firstPlaylist);
		musicKey = Math.floor(Math.random()*12);
		sessionStorage.clear();
		desiredMood = $(this).find("#mood").val(); 
		fromStation = $(this).find("#location").val();
		toStation = $(this).find("#destination").val();
		if(fromStation == toStation){
			$(".warning").css("display", "block");
		} else {
			showProgress();
		}
		getStationCode(fromStation, toStation);

		//now that session storage has been cleared, we reload the firstPlayist variable into session storage, to be used when we switch to our playlist page 
		sessionStorage.setItem('firstPlaylist', firstPlaylist)

		sessionStorage.mood = JSON.stringify(desiredMood);
		sessionStorage.fromStation = JSON.stringify(fromStation);
		sessionStorage.toStation = JSON.stringify(toStation);
		getDelayTime();
		$(updatePlaylist);
	});
}

//Updates/renders playlist in playlist page
function updatePlaylist(){
	let songs = JSON.parse(sessionStorage.getItem("songs"));
	$(renderPlaylist(songs));
}

//Renders journey info to journey page
function renderJourney(){
	tripTime = JSON.parse(sessionStorage.tripTime);
	delayTime = JSON.parse(sessionStorage.delayTime);
	fromStation = JSON.parse(sessionStorage.fromStation);
	toStation = JSON.parse(sessionStorage.toStation);
	let mood = JSON.parse(sessionStorage.mood);

	$(".js-journey-description").text(`A ${mood} Journey from ${fromStation} to ${toStation}`);
	$(".js-trip-time").text(`Travel Time: ${tripTime}`);
	$(".js-delay-time").text(`Delay Time: ${delayTime}`);
}

//Makes progress bar appear
function showProgress(){
	$('#progress-wrapper').css('display', 'flex');
}

//Updates inside of Progress Bar
function updateProgress(percentage){
	let elem = document.getElementById('progress-bar');
	let width = 1;
	console.log('progress running ' + percentage*100 + "%");
	
	width = percentage;
	if(width > 1) width = 1;
	elem.style.width = percentage*100 + '%';

	
}

function runApp(){
	addStationNames();
	addCategoryNames();
	handleSubmit();
}

$(runApp);