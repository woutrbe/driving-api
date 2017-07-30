const mongoose = require('mongoose');

/**
 * Simple Database class to connect and close database connections
 */
class Db {
	constructor(uri) {
		mongoose.Promise = global.Promise;

		this.uri = uri;
	}

	/**
	 * Connect to Mongo
	 */
	connect() {
		return mongoose.connect(this.uri, {
			useMongoClient: true,
		});
	}

	/**
	 * Close open Mongo connection
	 */
	close() {
		return new Promise((resolve) => {
			mongoose.connection.close(() => {
				resolve();
			});
		});
	}
}

module.exports = Db;