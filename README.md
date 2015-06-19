# slack-spotify #

A Slack plugin that returns links to an artist's top tracks, top albums, or related artists from the Spotify API.


# Set Up #
Build Node.js
In a browser, run http://yourlocaldomain/api and you should see some sort of "Hello World" response
Other GET commands are:
  http://yourlocaldomain/api/spotify/<enter artist name>
  http://yourlocaldomain/api/spotify/albums/<enter artist name>
  http://yourlocaldomain/api/spotify/related/<enter artist name>

You should be able to deploy on Heroku

In your Slack configuration, set up an Outgoing Webhook that points to your deployed application.
Also, create a keyword to be used in the usage below (i.e. spotify).

# Usage #
Get top tracks for a given artist:
	spotify <artist name>

Get top albums for a given artist:
	spotify <artist name>:albums

Get related artists for a given artist:
	spotify <artist name>:related

