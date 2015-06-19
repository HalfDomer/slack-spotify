// Import all packages
var express = require('express');
var bodyParser = require('body-parser');
var spotifySearch = require('./spotifySearch.js');
var port = process.env.PORT || 8081;
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var makeSlackResponse = function(artist, trackList) {
  var spotifyLink = "https://open.spotify.com/track/";
  var textResponse = "Top tracks for "+ artist +"\n";
  for (var i = 0; i < trackList.length; i++) {
    var track = trackList[i];
    textResponse += ('<' + spotifyLink + track.id + '|' + track.name + '>\n');
  }
  console.log('Request completed');
  return {'text' : textResponse};
};

var router = express.Router();
router.use(function(req, res, next){
  console.log('Received a request...');
  next();
});

// simple hello-world example: http://localhost:8081/api/
router.get('/', function(req, res) {
    res.json({text: 'Please enter something like: spotify your_favorite_artist'});
    res.send('hello!');
});

// Slack POST example: spotify <artist name>
router.route('/spotify').post(function(req, res) {
  var requestString = req.body.text;
  var spotifyPrefixOffset = ('spotify '.length -1);
  var artistName = (requestString !== null && requestString !== "" && typeof(requestString) !== "undefined") ? requestString.substring(spotifyPrefixOffset) : "Pearl Jam";
  console.log('Performing a search for: ' + artistName);
  spotifySearch.getTracksByArtist(artistName, 5).then(function(trackList) {
    return res.json(makeSlackResponse(artistName, trackList));
  }, function(error) {
    return res.json({"error": error});
  });
});

// gets artist top tracks by the following example URL: http://localhost:8081/api/spotify/<artist name>
router.route('/spotify/:artist').get(function(req, res) {
  var artistName = req.params["artist"];
  console.log('Performing a search for: ' + artistName);
  spotifySearch.getTracksByArtist(artistName, 5).then(function(trackList) {
    return res.json(makeSlackResponse(artistName, trackList));
  }, function(error) {
    return res.json({"error": error});
  });
});

// gets artist top tracks by the following example URL: http://localhost:8081/api/spotify?text=<artist name>
router.route('/spotify').get(function(req, res) {
  var artistName = req.query.text;
  console.log('Performing a search for: ' + artistName);
  spotifySearch.getTracksByArtist(artistName, 5).then(function(trackList) {
    return res.json(makeSlackResponse(artistName, trackList));
  }, function(error) {
    return res.json({"error": error});
  });
});

// gets artist albums by the following example URL: http://localhost:8081/api/spotify/albums/<artist name>
router.route('/spotify/albums/:artist').get(function(req, res) {
  var artistName = req.params["artist"];
  console.log('Performing a search for: ' + artistName);
  spotifySearch.getArtistAlbums(artistName).then(function(albums) {
    return res.json(albums);
  }, function(error) {
    return res.json({"error": error});
  });
});

router.route('/spotify/related/:artist').get(function(req, res) {
  var artistName = req.params["artist"];
  console.log('Performing a search for: ' + artistName);
  spotifySearch.getRelatedArtists(artistName).then(function(artists) {
    return res.json(artists);
  }, function(error) {
    return res.json({"error": error});
  });
});


app.use('/api', router);
app.listen(port);
console.log("listening on port " + port);
