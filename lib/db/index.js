const mongoose = require('mongoose');

class Db {
	constructor(uri) {
		mongoose.Promise = global.Promise;

		this.uri = uri;
	}

	connect() {
		return mongoose.connect(this.uri, {
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