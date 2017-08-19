class Individual {
	constructor(length = 0, gaData = []) {
		this.length = length;
		this.gaData = gaData;

		this.genetics = [];

		for(let i = 0; i < this.length; i++) {
			this.genetics.push(i);
		}

		// Mutate first time
		this.mutate();

		console.log(this.genetics);
	}

	/**
	 * Mutate the invididual
	 * Essentially making random changes to it's genetics
	 */
	mutate() {
		for(let i = 0; i < this.genetics; i++) {
			// We always want to start from point A
			const rand = 1 + Math.floor(Math.random() * (this.length - 1));
			const tmp = this.genetics[rand];
			this.genetics[rand] = this.genetics[i];
			this.genetics[i] = tmp;
		}

		console.log(this.genetics);
	}

	getDistance() {
		let distance = 0;

		return distance;
	}
}

class Population {
	constructor(length = 0, size = 0) {
		this.individuals = [];

		for(let i = 0; i < size; i++) {
			const individual = new Individual(length);
			this.individuals.push(individual);
		}
	}

	mutate() {
		console.log('Mutating population');
		for(let i = 0; i < this.individuals.length; i++) {
			console.log(i);
			this.individuals[i].mutate();
		}
	}
}

class TSP {
	constructor(points, gaData, config) {
		this.points = points;
		this.gaData = gaData;

		// Assign default config
		this.config = Object.assign({
			maxIterations: 20,
			tick: 60,
			size: 50,
		}, config);

		console.log('TSP');

		this.population = new Population(this.points.length, this.config.size);
	}

	/**
	 * Evolves a given generations
	 *
	 * @param {Generation} population
	 * @param {Function} evolveCallback
	 * @param {Function} completeCallback
	 */
	evolve(evolveCallback = null, completeCallback = null) {
		let generation = 1;

		const int = setInterval(() => {
			// Call callback
			if(typeof evolveCallback === 'function') {
				evolveCallback({
					generation,
				});
			}

			this.population.mutate();

			generation++;

			// Max iterations passed
			if(generation >= this.config.maxIterations) {
				clearInterval(int);

				if(typeof completeCallback === 'function') {
					completeCallback({
						generation,
					});
				}
			}
		}, this.config.tick);
	}
}

module.exports = TSP;