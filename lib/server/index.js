const Server = require('./server');
const Db = require('../db');

// Create a new server instance with host and port
const server = new Server('localhost', process.env.API_PORT);
server.start();

// Create new database connection
const db = new Db(process.env.MONGO_USER, process.env.MONGO_PASS, `localhost:${process.env.MONGO_PORT}`, process.env.MONGO_DB);
db.connect();

process.on('SIGINT', () => {
	process.exit(1);
});