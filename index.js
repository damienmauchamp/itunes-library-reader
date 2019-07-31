//var userhome = require('userhome')
var path = require('path')
var fs = require('fs');
var plist = require('plist');

var renameKeys = (obj) => {
	var keysMap = {};
	Object.keys(obj).forEach(k => {
		keysMap[k] = k.toLowerCase().replace(/ /g,"_");
	});
	return Object
		.keys(obj)
		.reduce((acc, key) => {
			const renamedObject = { [keysMap[key] || key]: obj[key] };
			return {
				...acc,
				...renamedObject
			  }
		}, {});
};

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
	var items = playlist['Playlist Items'].map(i => {
		return renameKeys(i);
	})
	var playlistTracks = [];
	items.forEach(track => {
		if (tracks[track.track_id]) {
			track_item = renameKeys(tracks[track.track_id]);
			// itunes api call
			// .year, .release_date, .name, .artist, .album, .album_artist, explicit
			playlistTracks.push(track_item);
		}
	})
	//console.log(JSON.stringify(playlists));
	console.log(playlistTracks);
}

/*

[ { track_id: 58213,
    size: 7602465,
    total_time: 215024,
    disc_number: 1,
    disc_count: 1,
    track_number: 1,
    track_count: 1,
    year: 2019,
    date_modified: 2019-06-13T19:46:14.000Z,
    date_added: 2019-06-13T19:46:14.000Z,
    bit_rate: 256,
    sample_rate: 44100,
    part_of_gapless_album: true,
    release_date: 2019-06-13T07:00:00.000Z,
    artwork_count: 1,
    persistent_id: '777DDC39BF7C04DD',
    explicit: true,
    track_type: 'Remote',
    apple_music: true,
    name: 'Ol\' Dirty Bastard',
    artist: 'B.o.B',
    album_artist: 'B.o.B',
    composer: 'Bobby Ray Simmons, Jr.',
    album: 'Ol\' Dirty Bastard - Single',
    genre: 'Hip-hop/Rap',
    kind: 'Fichier audio AAC Apple Music',
    sort_name: 'Ol\' Dirty Bastard',
    sort_album: 'Ol\' Dirty Bastard - Single',
    sort_artist: 'B.o.B' } ]

// singles
https://itunes.apple.com/search?term=B.o.B Ol' Dirty Bastard Ol' Dirty Bastard - Single&country=fr&explicit=Yes&entity=song&callback=
// albums
https://itunes.apple.com/search?term=B.o.B Southmatic&country=fr&explicit=Yes&entity=album&callback=
*/