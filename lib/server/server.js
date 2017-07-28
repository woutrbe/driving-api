const Hapi = require('hapi');
const Blipp = require('blipp');

const routes = require('./routes');
const logger = require('./middleware/logger');

class Server {
	/**
	 * @param {String} host
	 * @param {Int} port
	 */
	constructor(host = 'localhost', port = 8080) {
		this.server = null;

		this.host = host;
		this.port = port;
	}

	/**
	 * Start a new Hapi server
	 */	 
	start() {
		this.server = new Hapi.Server();
		this.server.connection({
			port: this.port,
			host: this.host,
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