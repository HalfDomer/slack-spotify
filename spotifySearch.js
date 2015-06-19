var spotify = require('spotify-web-api-node');

module.exports = new function () {
	var spotifyClient = new spotify()
	var spotifyRegion = 'US';

	// returns a promise to get the searched-on artistId
	var getArtistID = function (artistName) {
		var artistsPromise = spotifyClient.searchArtists(artistName);
		return artistsPromise.then(function (data) {
			var artistID = data.artists.items[0].id;
			return artistID;
		});
	};

	this.getTracksByArtist = function (artistName, numberOfTracks) {
		return getArtistID(artistName).then(function (artistID) {
			var tracksPromise = spotifyClient.getArtistTopTracks(artistID, spotifyRegion);
			return tracksPromise.then(function (data) {
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

	this.getRelatedArtists = function (artistName) {
		return getArtistID(artistName).then(function (artistID) {
			var artistsPromise = spotifyClient.getArtistRelatedArtists(artistID);
			//return artistsPromise.then(function (data) {
			//	return data.artists;
			//});

			return artistsPromise.then(function (data) {
				var artists = [];
				console.log('items in dataset: ' + data.artists.length);

				for (var i = 0; i < data.artists.length; i++) {
					artists.push({
						'name': data.artists[i].name,
						'id': data.artists[i].id,
					});
				}
				return artists;
			});
		});
	}

	this.getArtistAlbums = function (artistName) {
		console.log('fetching artistID...');
		return getArtistID(artistName).then(function (artistID) {
			var albumsPromise = spotifyClient.getArtistAlbums(artistID,
				{
					album_type: 'album',
					country: spotifyRegion,
					limit: 5,
					offset: 0
				});
			return albumsPromise.then(function (data) {
				// return data.items;
				var topAlbums = [];
				console.log('items in dataset: ' + data.items.length);

				for (var i = 0; i < data.items.length; i++) {
					topAlbums.push({
						'name': data.items[i].name,
						'id': data.items[i].id,
					});
				}
				return topAlbums;

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
