//var userhome = require('userhome')
var path = require('path')
var fs = require('fs');
var plist = require('plist');

//var location = path.resolve('./iTunes Music Library.xml')
var location = path.resolve('./sample.xml')
//var location = path.resolve('./sample.xml')
/*var location = path.resolve(userhome()
  , 'Music/iTunes/iTunes Music Library.xml'
)*/

var obj = plist.parse(fs.readFileSync(location, 'utf8'));
//console.log(JSON.stringify(obj));

// tracks
var tracks = obj.Tracks

// playlists
var playlists = obj.Playlists
var playlistName = 'Singles récents';

var playlist = playlists.find(p => {
	return p.Name === playlistName
})
if (playlist) {
	var items = playlist['Playlist Items']
	var playlistTracks = [];

	items.forEach(track => {
		if (tracks[track['Track ID']]) {
			// itunes api call
			// .Year, ['Release Date'], .Name, .Artist, .Album, ['Album Artist']
			playlistTracks.push(tracks[track['Track ID']]);
		}
	})
	//console.log(JSON.stringify(playlists));
	console.log(playlistTracks);
}