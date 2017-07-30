const Db = require('../db');
const queue = require('../rabbitmq');
const Map = require('./maps');
const Directions = require('../db/models/directions');
const Route = require('../db/models/route');

class Worker {
	constructor() {
		// Create new database connection
		this.db = new Db(process.env.MONGO_URI);

		this.map = new Map(process.env.GOOGLE_KEY);
	}

	start() {
		/**
		 * Startup:
		 *  1. Connect to Mongo
		 *  2. Connect to RabbitMQ
		 *  3. Start server
		 */
		this.db.connect()
			.then(() => {
				return queue.connect(process.env.RABBIT_URI);
			})
			.then(() => {
				queue.listen('routes', {}, this, this.processMsg);
			})
			.catch(err => {
				console.log(err);
				process.exit(1);
			});
	}

	stop() {
		return Promise.all([
			this.db.close(),
			queue.close(),
		]);
	}

	/**
	 * Process incomming messages
	 *
	 * @param {Object} msg
	 */
	processMsg(msg) {
		return new Promise((resolve, reject) => {
			const routeId = msg.id;
			const start = msg.pickup;
			const points = msg.dropoffs;

			this.map.findRoute(start, points)
				.then(results => {
					const resultQ = [];

					results.forEach(result => {
						// Store results
						resultQ.push(Directions.create({
							total_time: result.totalTime,
							total_distance: result.totalDistance,
							waypoint_order: result.waypoint_order,
							route: routeId,
						}));
					});

					return Promise.all(resultQ);
				})
				.then(() => {
					// Update Route as success
					return Route.update({
						_id: routeId,
					}, {
						status: 'success',
					}, {
						upsert: true,
					});
				})
				.then(() => {
					return resolve();
				})
				.catch(err => {
					// Update Route as success
					Route.update({
						_id: routeId,
					}, {
						status: 'failure',
						error: err,
					});

					return reject(err);
				});
		});
	}
}

// Create a new worker instance
const worker = new Worker();
worker.start();

// On process exit
process.on('SIGINT', () => {
	return worker.close()
		.then(() => {
			process.exit(1);
		})
		.catch(() => {
			// Terminate anyway
			process.exit(1);
		});
});