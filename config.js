const path = require('path');
//require('dotenv').config({ path: path.resolve(__dirname, './.env') });
require('dotenv').config();

module.exports = {
	PLAYLISTS: process.env.PLAYLISTS.split(',')
}