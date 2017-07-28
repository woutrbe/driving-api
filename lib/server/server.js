const Hapi = require('hapi');
const Blipp = require('blipp');

const routes = require('./routes');
const logger = require('./middleware/logger');

class Server {
	constructor() {
		this.server = null;
	}

	/**
	 * Start a new Hapi server
	 * 
	 * @param {String} host
	 * @param {Int} port
	 */
	start(host = 'localhost', port = 8080) {
		this.server = new Hapi.Server();
		this.server.connection({
			port,
			host,
		});

		// Register all required plugins / middleware
		this.server.register([
			{
				register: Blipp,
				options: {},
			},
			{
				register: logger,
			},
		], registerErr => {
			if(registerErr) {
				throw registerErr;
			}

			// Register routes
			this.server.route(routes);

			// Start server
			this.server.start(startErr => {
				if(startErr) {
					throw startErr;
				}

				console.log(`Server running at: ${this.server.info.uri}`);
			});
		});
	}
}

module.exports = Server;