const gmaps = require('@google/maps');
const request = require('request');

class Maps {
	constructor(key) {
		this.client = gmaps.createClient({
			key,
		});
	}

	/**
	 * Find the shortest route
	 *
	 * @param {Array[Number]} start
	 * @param {Array[Array[Number]]} points
	 * @param {String} mode
	 *
	 * @return {Promise}
	 */
	findRoute(start, points, mode = 'driving') {
		return new Promise((resolve, reject) => {
			this.processRoute([start], points, mode)
				.then(response => {
					return this.processUrl(response);
				})
				.then(response => {
					return resolve(response);
				})
				.catch(err => {
					return reject(err);
				});
		});
	}

	processRoute(origins, destinations, mode) {
		// https://developers.google.com/maps/documentation/distance-matrix/start
		return new Promise((resolve, reject) => {
			// Just call the Google Maps API
			this.client.distanceMatrix({
				origins,
				destinations,
				mode,
			}, (err, response) => {
				if(err || !response.requestUrl) return reject(err);

				return resolve(response.requestUrl);
			});
		});
	}

	/**
	 * Process the request URL returned by the Google aps API
	 *
	 * @param {String} url
	 */
	processUrl(url) {
		return new Promise((resolve, reject) => {
			request(url, (error, response, body) => {
				if(error) {
					console.log(error);
					return reject(error);
				}

				console.log(error);
				console.log(body);

				// The Google Maps API will return a list of routes
				// each route contains a list of legs and the waypoint order
				// In order to calulcate the total distance and time, we need to add distance and duration for each leg
				// const result = JSON.parse(body);
				// const routes = result.routes;
				// const returnVal = [];

				// if(!routes.length) return reject('No routes found');

				// routes.forEach(route => {
				// 	let totalTime = 0;
				// 	let totalDistance = 0;

				// 	route.legs.forEach(leg => {
				// 		totalTime += leg.duration.value;
				// 		totalDistance += leg.distance.value;
				// 	});

				// 	returnVal.push({
				// 		totalTime,
				// 		totalDistance,
				// 		waypoint_order: route.waypoint_order,
				// 	});
				// });

				// return resolve(returnVal);
			});
		});
	}
}

module.exports = Maps;