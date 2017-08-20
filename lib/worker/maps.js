const gmaps = require('@google/maps');
const request = require('request');
const TSP = require('./tsp');

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
	 * @param {Array[Array[Number]]} destinations
	 * @param {String} mode
	 *
	 * @return {Promise}
	 */
	findRoute(start, destinations, mode = 'driving') {
		const points = [].concat([start]).concat(destinations);

		return new Promise((resolve, reject) => {
			this.processRoute(points, mode)
				.then(response => {
					return this.processUrl(response);
				})
				.then(results => {
					// Make sure all directions were found
					results.forEach(r => {
						r.elements.forEach(e => {
							if(e.status !== 'OK') {
								throw new Error('Direction not found');
							}
						});
					});

					return this.getShortestRoute(points, results);
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

	processRoute(points, mode) {
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
	getShortestRoute(points, input) {
		// Format results
		const routes = input.map(x => {
			return x.elements.map(e => {
				return {
					distance: e.distance.value,
					duration: e.duration.value,
				};
			});
		});

		return new Promise((resolve, reject) => {
			// TSP
			const tsp = new TSP(points, routes, {
				maxIterations: 50,
			});
			tsp.evolve(null, results => {
				console.log('Completed');
				console.log(results);

				if(!results.fittest) {
					return reject('Could not calculate shortest route');
				}

				// Calculate distance and time
				const waypointOrder = results.fittest.genetics;

				let totalDistance = 0;
				let totalTime = 0;
				for(let i = 0; i < waypointOrder.length - 1; i++) {
					const start = waypointOrder[i];
					const end = waypointOrder[i + 1];

					totalDistance += routes[start][end].distance;
					totalTime += routes[start][end].duration;
				}

				return resolve({
					totalTime,
					totalDistance,
					waypointOrder,
				});
			});
		});
	}
}

module.exports = Maps;