const Joi = require('joi');
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
		Joi.assert(msg, Joi.object().required());

		return new Promise((resolve, reject) => {
			const routeId = msg.id;
			const start = msg.pickup;
			const points = msg.dropoffs;

			this.map.findRoute(start, points)
				.then(result => {
					// Store result
					return Directions.create({
						total_time: result.totalTime,
						total_distance: result.totalDistance,
						waypoint_order: result.waypointOrder,
						route: routeId,
					});
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
					return Route.update({
						_id: routeId,
					}, {
						status: 'failure',
						error: err,
					})
						.then(() => {
							return reject(err);
						})
						.catch(() => {
							return reject(err);
						});
				});
		});
	}
}

module.exports = Worker;