var spotify = require('spotify-web-api-node');

module.exports = new function() {
  var spotifyClient = new spotify()
  var spotifyRegion = 'US';

  // returns a promise to get the searched-on artistId
  var getArtistID = function(artistName) {
    var artistsPromise = spotifyClient.searchArtists(artistName);
    return artistsPromise.then(function(data) 
    {
      var artistID = data.artists.items[0].id;
      return artistID;
    });
  };

  this.getTracksByArtist = function(artistName, numberOfTracks) {
    return getArtistID(artistName).then(function(artistID) {
      var tracksPromise = spotifyClient.getArtistTopTracks(artistID, spotifyRegion);
      return tracksPromise.then(function(data) 
      {
        var topTracks = [];
        numberOfTracks = Math.max(0, Math.min(numberOfTracks, data.tracks.length));

        for (var i = 0; i < numberOfTracks; i++) {
          topTracks.push({
            'name': data.tracks[i].name,
            'id': data.tracks[i].id,
          });
        }

        return topTracks;
      });
    });
  }

  this.getRelatedArtists = function(artistName) {
    return getArtistID(artistName).then(function(artistID) {
      var artistsPromise = spotifyClient.getArtistRelatedArtists(artistID);
      console.log('fetching related artists...');
      console.log('artistpromise: ' + artistsPromise);
      return artistsPromise.then(function(data) 
      {
        console.log(data.artists);
        return data.artists;
      });
    });
  }

  this.getArtistAlbums = function(artistName) {
    console.log('fetching artistID...');
    return getArtistID(artistName).then(function(artistID) {
      console.log('fetching albums...');
      var albumsPromise = spotifyClient.getArtistAlbums(artistID, { album_type : 'album', country : 'US', limit : 5, offset : 0 });
      return albumsPromise.then(function(data) 
      {
        console.log('data:' + data);
        return data.items;
        // return data.albums;
        /*
        var topAlbums = [];
        console.log('albums: ' + data.albums.length);

        for (var i = 0; i < data.albums.length; i++) {
          topAlbums.push({
            'name': data.albums[i].name,
            'id': data.albums[i].id,
          });
        }
        return topAlbums;
        */

        // if (data.albums.length) {
        //   console.log('I got ' + data.albums.length + ' albums for ' + artistName +'!');
        //   console.log('The most popular one is ' + data.albums[0].name);
        // } else {
        //   console.log('I didn\'t find any albums... Sorry.');
        // }
      });
    });
  }
};
