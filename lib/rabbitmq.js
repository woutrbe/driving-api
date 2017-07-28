const Joi = require('joi');
const amqplib = require('amqplib');

class RabbitMQ {
	constructor() {
		this.connection = null;
	}

	connect() {
		return new Promise((resolve, reject) => {

		});
	}

	/**
	 * Close the RabbitMQ connection
	 */
	close() {
		this.connection.close();
	}

	/**
	 * Send a message to a specific queue
	 * 
	 * @param {JSON} msg 
	 * @param {String} queue 
	 * @param {String} exchange 
	 */
	send(msg, queue, exchange) {

	}

	/**
	 * Start listening for incomming messages on a queue
	 * 
	 * @param {String} queue 
	 * @param {Object} options 
	 * @param {Function} callback 
	 */
	listen(queue, options, callback) {

	}
}

module.exports = RabbitMQ;