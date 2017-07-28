const mongoose = require('mongoose');


mongoose.connect();

class Db {
	constructor(username, password, uri, db) {
		this.username = username;
		this.password = password;
		this.uri = uri;
		this.db = db;
	}

	connect() {
		console.log(`Connecting to mongodb://${this.username}:${this.password}@${this.uri}/${this.db}`);
		mongoose.connect(`mongodb://${this.username}:${this.password}@${this.uri}/${this.db}`);
	}
}

module.exports = Db;