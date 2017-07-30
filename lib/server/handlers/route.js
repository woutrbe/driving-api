const Joi = require('joi');
const uuid = require('uuid/v4');
const Route = require('../../db/models/route');
const Directions = require('../../db/models/directions');

/**
 * Create a new route to be processed
 *
 * @param {Array[Number]} pickup The pickup location
 * @param {Array[Array[Number]]} dropoffs Multiple dropoff locations
 *
 * @return {Promise}
 */
const findRoute = async (pickup, dropoffs) => {
	Joi.assert(pickup, Joi.array().items(Joi.number()).length(2).required());
	Joi.assert(dropoffs, Joi.array().items(Joi.array().items(Joi.number()).length(2)).min(1).required());

	return new Promise((resolve, reject) => {
		const token = uuid();

		// Store route
		Route.create({
			from: pickup,
			pickups: dropoffs,
			token,
		})
			.then(result => {
				return resolve({
					token: result.token,
					id: result.id,
				});
			})
			.catch(err => {
				return reject(err);
			});
	});
};

/**
 * Retrieve the shortest route
 *
 * @param {String} routeId
 *
 * @return {Promise}
 */
const getShortestRoute = routeId => {
	Joi.assert(routeId, Joi.string().required());

	return new Promise((resolve, reject) => {
		Directions.findOne({
			route: routeId,
		}, null, {
			sort: {
				total_distance: -1,
			},
		})
			.then(result => {
				return resolve(result);
			})
			.catch(err => {
				return reject(err);
			});
	});
};

/**
 * Retrieve a route from the database
 *
 * @param {String} token Route token
 *
 * @return {Promise)}
 */
const getRoute = token => {
	Joi.assert(token, Joi.string().required());

	return new Promise((resolve, reject) => {
		if(!token) return reject('Invalid token');

		let returnVal = {};
		let route = null;

		return Route.findOne({
			token,
		})
			.then(result => {
				if(!result) return reject('Invalid token');

				route = result;

				// If success, retrieve the shortest route
				if(result.status === 'success') return getShortestRoute(result.id);
				return Promise.resolve();
			})
			.then(result => {
				// Store results
				returnVal = {
					status: route.status,
					error: route.error,
				};

				if(result) {
					returnVal.total_distance = result.total_distance;
					returnVal.total_time = result.total_time;
					returnVal.path = [];

					// Pickup location
					returnVal.path.push(route.from);

					// Sort waypoints according to result
					result.waypoint_order.forEach(order => {
						returnVal.path[order + 1] = route.pickups[order];
					});
				}

				return resolve(returnVal);
			})
			.catch(err => {
				return reject(err);
			});
	});
};

module.exports = {
	findRoute,
	getRoute,
};