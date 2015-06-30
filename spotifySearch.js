var spotify = require('spotify-web-api-node');
var constants = require('./constants.js');

module.exports = new function () {
	var spotifyClient = new spotify()

	// returns a promise to get the searched-on artistId
	var getArtistID = function (artistName) {
		return spotifyClient.searchArtists(artistName).then(function (data) {
			var artistID = data.artists.items[0].id;
			return artistID;
		});
	};

	this.getTracksByArtist = function (artistName, numberOfTracks) {
		return getArtistID(artistName).then(function (artistID) {
			return spotifyClient.getArtistTopTracks(artistID, constants.spotifyRegion).then(function (data) {
				var topTracks = [];
				numberOfTracks = Math.max(0, Math.min(numberOfTracks, data.tracks.length));

				for (var i = 0; i < numberOfTracks; i++) {
					topTracks.push({
						'name': data.tracks[i].name,
						'id': data.tracks[i].id
					});
				}

				return topTracks;
			});
		});
	}

	this.getRelatedArtists = function (artistName) {
		return getArtistID(artistName).then(function (artistID) {
			return spotifyClient.getArtistRelatedArtists(artistID).then(function (data) {
				var artists = [];
				for (var i = 0; i < data.artists.length; i++) {
					artists.push({
						'name': data.artists[i].name,
						'id': data.artists[i].id
					});
				}
				return artists;
			});
		});
	}

	this.getArtistAlbums = function (artistName) {
		return getArtistID(artistName).then(function (artistID) {
			var albumsPromise = spotifyClient.getArtistAlbums(artistID,
				{
					album_type: constants.albumType,
					country: constants.spotifyRegion,
					limit: constants.limit,
					offset: 0
				});
			return albumsPromise.then(function (data) {
				var topAlbums = [];
				for (var i = 0; i < data.items.length; i++) {
					topAlbums.push({
						'name': data.items[i].name,
						'id': data.items[i].id
					});
				}
				return topAlbums;
			});
		});
	}

	this.searchSpotify = function(artistName, type) {
		if(type === constants.relatedType) {
			return this.getRelatedArtists(artistName);
		}

		if(type === constants.albumType) {
			return this.getArtistAlbums(artistName);
		}

		return this.getTracksByArtist(artistName, constants.limit);
	}
};
