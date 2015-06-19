// Import all packages
var express = require('express');
var bodyParser = require('body-parser');
var spotifySearch = require('./spotifySearch.js');
var port = process.env.PORT || 8081;
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var router = express.Router();
router.use(function (req, res, next) {
	console.log('Received a request...');
	next();
});

// Global vars
var spotifyUrl = 'https://open.spotify.com/';
var slackKeywordHook = 'spotify ';

// formats song tracks response for Slack
var formatSlackTracksResponse = function (artist, trackList) {
	var spotifyLink = spotifyUrl + 'track/';
	var textResponse = "Top tracks for " + artist + ":\n";

	for (var i = 0; i < trackList.length; i++) {
		var track = trackList[i];
		textResponse += ('<' + spotifyLink + track.id + '|' + track.name + '>\n');
	}

	return {'text': textResponse};
};

// formats albums response for Slack
var formatSlackAlbumsResponse = function (artist, albums) {
	var spotifyLink = spotifyUrl + 'album/';
	var textResponse = "Top albums for " + artist + ":\n";

	for (var i = 0; i < albums.length; i++) {
		var album = albums[i];
		textResponse += ('<' + spotifyLink + album.id + '|' + album.name + '>\n');
	}

	return {'text': textResponse};
};

// formats related artists response for Slack
var formatSlackArtistsResponse = function (artist, relatedArtists) {
	var spotifyLink = spotifyUrl + 'artist/';
	var textResponse = "Related artists for " + artist + ":\n";

	for (var i = 0; i < relatedArtists.length; i++) {
		var relatedArtist = relatedArtists[i];
		textResponse += ('<' + spotifyLink + relatedArtist.id + '|' + relatedArtist.name + '>\n');
	}

	return {'text': textResponse};
};

// simple hello-world example: http://localhost:8081/api/
router.get('/', function (req, res) {
	res.json({text: 'Please enter something like: spotify your_favorite_artist'});
	res.send('hello!');
});

// Slack POST examples:
// return top 5 tracks for a given artist: spotify <artist name>
// return top 5 albums for an artist: spotify <artist name>:albums
// return top 5 related bands for an artist: spotify <artist name>:related
router.route('/spotify').post(function (req, res) {
	var requestString = req.body.text;
	var spotifyPrefixOffset = (slackKeywordHook.length - 1);
	var artistName = (requestString !== null && requestString !== "" && typeof(requestString) !== "undefined") ? requestString.substring(spotifyPrefixOffset) : "Pearl Jam";

	if(artistName.lastIndexOf(':albums') > -1) {
		// get top 5 albums on Spotify for that artist
		spotifySearch.getArtistAlbums(artistName).then(function (albums) {
			return res.json(formatSlackAlbumsResponse(artistName, albums));
		}, function (error) {
			return res.json({"error": error});
		});
	}
	else if(artistName.lastIndexOf(':related') > -1) {
		// do search on related artists
		spotifySearch.getRelatedArtists(artistName).then(function (artists) {
			return res.json(formatSlackArtistsResponse(artistName, artists));
		}, function (error) {
			return res.json({"error": error});
		});
	}
	else {
		// get top 5 tracks for this artist
		console.log('Searching top 5 tracks for: ' + artistName);
		spotifySearch.getTracksByArtist(artistName, 5).then(function (trackList) {
			return res.json(formatSlackResponse(artistName, trackList));
		}, function (error) {
			return res.json({"error": error});
		});
	}
});

// gets artist top tracks by the following example URL: http://localhost:8081/api/spotify/<artist name>
router.route('/spotify/:artist').get(function (req, res) {
	var artistName = req.params["artist"];
	console.log('Performing a search for: ' + artistName);
	spotifySearch.getTracksByArtist(artistName, 5).then(function (trackList) {
		return res.json(formatSlackResponse(artistName, trackList));
	}, function (error) {
		return res.json({"error": error});
	});
});

// gets artist top tracks by the following example URL: http://localhost:8081/api/spotify?text=<artist name>
router.route('/spotify').get(function (req, res) {
	var artistName = req.query.text;
	console.log('Performing a search for: ' + artistName);
	spotifySearch.getTracksByArtist(artistName, 5).then(function (trackList) {
		return res.json(formatSlackResponse(artistName, trackList));
	}, function (error) {
		return res.json({"error": error});
	});
});

// gets artist albums by the following example URL: http://localhost:8081/api/spotify/albums/<artist name>
router.route('/spotify/albums/:artist').get(function (req, res) {
	var artistName = req.params["artist"];
	console.log('Performing a search for: ' + artistName);
	spotifySearch.getArtistAlbums(artistName).then(function (albums) {
		return res.json(albums);
	}, function (error) {
		return res.json({"error": error});
	});
});

router.route('/spotify/related/:artist').get(function (req, res) {
	var artistName = req.params["artist"];
	console.log('Performing a search for: ' + artistName);
	spotifySearch.getRelatedArtists(artistName).then(function (artists) {
		return res.json(artists);
	}, function (error) {
		return res.json({"error": error});
	});
});


app.use('/api', router);
app.listen(port);
console.log("listening on port " + port);
