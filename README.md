# slack-spotify #

A Slack plugin that returns links to an artist's top tracks, top albums, or related artists from the Spotify API.


# Set Up #
Build Node.js application.  
In a browser, run http://yourlocaldomain/api and you should see some sort of "Hello World" response.
Other GET commands are (where 'artist_name' is an artist of your choice):
  http://yourlocaldomain/api/spotify/artist_name
  http://yourlocaldomain/api/spotify/albums/artist_name
  http://yourlocaldomain/api/spotify/related/artist_name

You should be able to deploy on Heroku

In your Slack configuration, set up an Outgoing Webhook that points to your deployed application.
Also, create a keyword to be used in the usage below (i.e. spotify).

# Usage #
Get top tracks for a given artist:
  spotify artist_name

Get top albums for a given artist:
  spotify artist_name:albums

Get related artists for a given artist:
  spotify artist_name:related

