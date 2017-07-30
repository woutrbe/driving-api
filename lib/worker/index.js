const Worker = require('./worker');

// Create a new worker instance
const worker = new Worker();
worker.start();

// On process exit
process.on('SIGINT', () => {
	return worker.close()
		.then(() => {
			process.exit(1);
		})
		.catch(() => {
			// Terminate anyway
			process.exit(1);
		});
});