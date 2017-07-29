const Db = require('../db');
const queue = require('../rabbitmq');

// Create new database connection
const db = new Db(process.env.MONGO_URI);

/**
 * Process incomming messages
 * 
 * @param {Object} msg 
 */
const processMsg = msg => {
	return new Promise((resolve, reject) => {
		console.log(msg);

		return resolve();
	});
};

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
		queue.listen('routes', {}, processMsg);
		console.log('worker started');
	})
	.catch(err => {
		console.log(err);
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