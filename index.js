var userhome = require('userhome')
var path = require('path')
var fs = require('fs');
var plist = require('plist');
const https = require('https');
const querystring = require('querystring');

let filename = './data.json'

const config = require('./config.js');
console.log(config)

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

var location = path.resolve(userhome()
  , 'Music/iTunes/iTunes Music Library.xml'
)

var obj = plist.parse(fs.readFileSync(location, 'utf8'));
//console.log(JSON.stringify(obj));

// tracks
var tracks = obj.Tracks

// playlists
var playlists = obj.Playlists

config.PLAYLISTS.forEach(pl => {
    run(pl)
})

var itunesCall = async function(track, entity = 'album') {
    return new Promise((resolve, reject) => {

// singles
//https://itunes.apple.com/search?term=B.o.B Ol' Dirty Bastard Ol' Dirty Bastard - Single&country=fr&explicit=Yes&entity=song&callback=
// albums
//https://itunes.apple.com/search?term=B.o.B Southmatic&country=fr&explicit=Yes&entity=album&callback=

//?term={{artist}} {{album}}
//&country=fr
//&explicit={{explicit}}
//&entity=(album|song)
//&callback={{callback}}
        var options = {
            hostname: "itunes.apple.com",
            path: '/search'
                + '?term=' + querystring.escape(track.album + ' ' + track.artist)
                + '&country=fr'
                + '&explicit=' + (track.explicit ? 'Yes' : 'No')
                + '&entity=' + entity
                + '&callback=' + '',
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            };

        var data = '';
        https.get(options, function(res) {
            res.on('data', function(chunk) {
                data += chunk;
            }).on('end', function() {
                var json = JSON.parse(data);
                //console.log(json.resultCount ? json.results[0] : false)
                console.log('!!!!call: ', track.album + ' by ' + track.artist)
                resolve(json.resultCount ? json.results[0] : false)
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    })
}

var checkiTunes = async function(items) {
        var playlistTracks = [];
        items.forEach(track => {
            if (tracks[track.track_id]) {
                track_item = renameKeys(tracks[track.track_id]);
                await itunesCall(track_item)
                .then(async (it) => {
                    track_item.itunes = it
                    playlistTracks.push(track_item);
                })
                // itunes api call
                // .year, .release_date, .name, .artist, .album, .album_artist, explicit
                // if (track.apple_music)

                return playlistTracks
            }
        })
    //return playlistTracks
}

async function run(playlistName) {
    //checkiTunes(track_item)
    var playlist = playlists.find(p => {
        return p.Name === playlistName
    })
    if (playlist) {
        var items = playlist['Playlist Items'].map(i => {
            return renameKeys(i);
        })

        await checkiTunes(items)
        .then(async (i) => {
            //console.log(JSON.stringify(playlists));
            // added_date
            playlistTracks.push(i);
            playlistTracks.sort((a, b) => a.release_date - b.release_date);

            const final = {playlist: playlistName, tracks: playlistTracks};
            console.log(final);
            writeJSONFile(filename, final)
        })
    }
}

function writeJSONFile(filename, content) {
    fs.writeFileSync(filename, JSON.stringify(content), 'utf8', (err) => {
        if (err) {
            //console.log(err)
        }
    })
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
*/