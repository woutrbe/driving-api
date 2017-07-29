const Joi = require('joi');
const uuid = require('uuid/v4');
const Route = require('../../db/models/route');

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
 * Retrieve a route from the database
 * 
 * @param {String} token Route token
 * 
 * @return {Promise)}
 */
const getRoute = token => {
	return new Promise((resolve, reject) => {
		if(!token) return reject('Invalid token');

		return Route.findOne({
			token,
		})
			.then(result => {
				if(!result) return reject('Invalid token');

				return resolve(result);
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