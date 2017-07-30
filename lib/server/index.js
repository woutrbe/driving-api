const Server = require('./server');
const Db = require('../db');
const queue = require('../rabbitmq');

// Create a new server instance with host and port
// By default localhost refers to the loopback interface, so inside Docker it will only listen to localhost
// use 0.0.0.0 to expose it to the outside
const server = new Server('0.0.0.0', 8080);

// Create new database connection
const db = new Db(process.env.MONGO_URI);

/**
 * Startup:
 *  1. Connect to Mongo
 *  2. Connect to RabbitMQ
 *  3. Start server
 */
db.connect()
	.then(() => {
		return queue.connect(process.env.RABBIT_URI);
	})
	.then(() => {
		return server.start();
	})
	.catch(err => {
		console.log(err);
		process.exit(1);
	});

// On process exit
process.on('SIGINT', () => {
	Promise.all([
		db.close(),
		queue.close(),
	])
		.then(() => {
			process.exit(1);
		})
		.catch(() => {
			// Terminate anyway
			process.exit(1);
		});
});