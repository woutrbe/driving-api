class Individual {
	/**
	 *
	 * @param {Int} length Length of the individual
	 */
	constructor(length = 0) {
		this.length = length;

		this.genetics = [];
		this.fitness = null;

		for(let i = 0; i < this.length; i++) {
			this.genetics.push(i);
		}

		// Mutate first time
		this.mutate();
	}

	/**
	 * Mutate the invididual
	 * Essentially making random changes to it's genetics
	 */
	mutate() {
		for(let i = 1; i < this.genetics.length; i++) {
			// We always want to start from point A
			const rand = 1 + Math.floor(Math.random() * (this.length - 1));
			const tmp = this.genetics[rand];

			this.genetics[rand] = this.genetics[i];
			this.genetics[i] = tmp;
		}
	}

	/**
	 * Get the total distance for the individual
	 * Essentially just randomize our points
	 *
	 * @param {Array[Array]} gaData Data returned from the Google distance matrix
	 */
	getDistance(gaData) {
		this.path = [];

		let distance = 0;

		for(let i = 0; i < this.genetics.length - 1; i++) {
			const start = this.genetics[i];
			const end = this.genetics[i + 1];
			distance += gaData[start][end].distance;

			this.path.push(`${start} -> ${end}: ${gaData[start][end].distance}`);
		}

		return distance;
	}

	/**
	 * Calculate the fitness level
	 * in our case this is just the total distance
	 *
	 * @param {Array[Array]} gaData Data returned from the Google distance matrix
	 */
	getFitness(gaData) {
		this.fitness = this.getDistance(gaData);
		return this.fitness;
	}
}

class Population {
	constructor(length = 0, size = 0, gaData = []) {
		this.individuals = [];
		this.gaData = gaData;
		this.length = length;
		this.size = size;

		for(let i = 0; i < size; i++) {
			const individual = new Individual(length);
			this.individuals.push(individual);
		}
	}

	evolve() {
		const nextPopulation = new Population(this.length, 0, this.gaData);
		const fittest = this.getFittest(true);
		for(let i = 0; i < this.individuals.length; i++) {
			// We want to keep the fittest individual
			if(i === fittest) {
				// Add to the next population
				nextPopulation.add(this.individuals[fittest]);
			} else {
				// Create a new individual
				nextPopulation.add(new Individual(this.length));
			}
		}

		return nextPopulation;
	}

	/**
	 * Mutate the current population
	 */
	mutate() {
		const fittest = this.getFittest(true);

		for(let i = 0; i < this.individuals.length; i++) {
			if(i !== fittest) this.individuals[i].mutate();
		}
	}

	/**
	 * Add an individual to the population
	 *
	 * @param {Individual} individual
	 */
	add(individual) {
		this.individuals.push(individual);
	}

	/**
	 * Return the fitest individual
	 *
	 * @param {Bool} indexOnly Only return the index of the fitest
	 *
	 * @return {Individual}
	 */
	getFittest(indexOnly = false) {
		let fitness = this.individuals.map((x, i) => {
			return {
				fitness: x.getFitness(this.gaData),
				index: i,
			};
		});
		fitness = fitness.sort((a, b) => {
			return a.fitness - b.fitness;
		});

		return indexOnly ? fitness[0].index : this.individuals[fitness[0].index];
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
			uniqueNess: 0,
		}, config);

		this.population = new Population(this.points.length, this.config.size, this.gaData);
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
					fittest: this.population.getFittest(),
				});
			}

			// Evolve the population
			this.population = this.population.evolve();

			// Mutate our current population
			this.population.mutate();

			generation++;

			// Max iterations passed
			if(generation >= this.config.maxIterations) {
				clearInterval(int);

				if(typeof completeCallback === 'function') {
					completeCallback({
						generation,
						fittest: this.population.getFittest(),
					});
				}
			}
		}, this.config.tick);
	}
}

module.exports = TSP;