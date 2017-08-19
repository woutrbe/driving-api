const gmaps = require('@google/maps');
const request = require('request');
const TSP = require('./tsp');

class Maps {
	constructor(key) {
		this.client = gmaps.createClient({
			key,
		});

		this.tsp = new TSP();
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
				.then(results => {
					return this.getShortestRoute(results);
				})
				.then(response => {
					console.log('done');
					return resolve(response);
				})
				.catch(err => {
					return reject(err);
				});
		});
	}

	processRoute(origins, destinations, mode) {
		const points = [].concat(origins).concat(destinations);

		// https://developers.google.com/maps/documentation/distance-matrix/start
		return new Promise((resolve, reject) => {
			// Just call the Google Maps API
			this.client.distanceMatrix({
				origins: points,
				destinations: points,
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

				const results = JSON.parse(body);
				return resolve(results.rows);
			});
		});
	}

	/**
	 * Get the short route based on the input matrix
	 *
	 * @param {*Array[Array]} input
	 */
	getShortestRoute(input) {
		// Format results
		const routes = input.map(x => {
			return x.elements.map(e => {
				return {
					distance: e.distance.value,
					duration: e.duration.value,
				};
			});
		});
		console.log(routes);

		// TSP

		return new Promise((resolve, reject) => {

		});
	}
}

module.exports = Maps;