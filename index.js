// Import all packages
var express = require('express');
var bodyParser = require('body-parser');
var spotifySearch = require('./spotifySearch.js');
var constants = require('./constants.js');

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

// returns a generic text response
var getTextResponse = function (artist, type) {
	var text = (type === constants.relatedType) ? "Related " : "Top ";
	text += type + "s for " + artist + ":\n";
	return text;
}

// formats the text response for Slack
var formatSlackResponse = function (artist, items, type) {
	var spotifyLink = spotifyUrl + type +  '/';
	var textResponse = getTextResponse(artist, type);

	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		textResponse += ('<' + spotifyLink + item.id + '|' + item.name + '>\n');
	}

	return {'text': textResponse};
};

// gets the search type: albums, related artists, tracks
var getSearchType = function(searchString) {
	return (searchString.lastIndexOf(constants.searchTypeAlbums) > -1) ? constants.albumType : (searchString.lastIndexOf(constants.searchTypeRelated) > -1) ? constants.relatedType : constants.trackType;
}

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
	var artistName = (requestString !== null && requestString !== "" && typeof(requestString) !== "undefined") ? requestString.substring(spotifyPrefixOffset) : constants.defaultArtist;
	var type = getSearchType(artistName);

	// clean our search string...
	artistName = artistName.replace(constants.searchTypeAlbums, '').replace(constants.searchTypeRelated, '').trim();

	spotifySearch.searchSpotify(artistName, type).then(function (items) {
		return res.json(formatSlackResponse(artistName, items, type));
	}, function (error) {
		return res.json({"error": error});
	});
});

app.use('/api', router);
app.listen(port);
console.log("listening on port " + port);
