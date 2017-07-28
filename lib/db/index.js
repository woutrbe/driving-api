const mongoose = require('mongoose');

class Db {
	constructor(username = null, password = null, uri = 'localhost:27017', db = 'test') {
		mongoose.Promise = global.Promise;

		this.username = username;
		this.password = password;
		this.uri = uri;
		this.db = db;
	}

	connect() {
		let uri = `mongodb://${this.uri}/${this.db}`;
		if(this.username && this.password) {
			uri = `mongodb://${this.username}:${this.password}@${this.uri}/${this.db}`;
		}

		return mongoose.connect(uri, {
			useMongoClient: true,
		});
	}

	close() {
		return new Promise((resolve) => {
			mongoose.connection.close(() => {
				resolve();
			});
		});
	}
}

module.exports = Db;