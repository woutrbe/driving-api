const Joi = require('joi');
const amqplib = require('amqplib');

class RabbitMQ {
	constructor(url, exchange, exhangeType, routingKey) {
		Joi.assert(url, Joi.string().required());
		Joi.assert(exchange, Joi.string().optional());
		Joi.assert(exhangeType, Joi.string().optional());
		Joi.assert(routingKey, Joi.string().optional());

		this.options = {
			url,
			exchange,
			exhangeType,
			routingKey,
		};
	}

	/**
	 * Connect to the defined queues / exhcanges
	 * 
	 * @return {Promise}
	 */
	connect() {
		return new Promise((resolve, reject) => {
			amqplib.connect(this.options.url)
				.then(_connection => {
					this.connection = _connection;

					this.connection.once('close', () => {
						// TODO: try and restart

						console.error('Connection clossed');
					});

					this.connection.once('error', err => {
						// TODO: try and restart

						console.error('Error while connecting');
						console.error(err);
					});

					return this.connection.createChannel();
				})
				.then(_channel => {
					this.channel = _channel;
					this.channel.prefetch(1);

					// Assert an exchange into existence if required
					if(this.options.exchange && this.options.exchangeType) {
						this.channel.assertExchange(this.options.exchange, this.options.exchangeType, {})
							.then(() => {
								return resolve();
							})
							.catch(() => {
								return reject();
							});
					} else {
						return resolve();
					}
				})
				.catch(err => {
					return reject(err);
				});
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
		Joi.assert(msg, Joi.object().required(), 'Message is required');
		Joi.assert(queue, Joi.string().required(), 'Queue is required');
		Joi.assert(exchange, Joi.string().optional().allow(''), 'Exchange is required');

		const toExchange = (exchange ? this.options.exchange : exchange);

		return new Promise((resolve, reject) => {
			const body = JSON.stringify(msg);

			if(this.channel) {
				const success = this.channel.publish(toExchange, queue, body, { persistent: true });
				return success ? resolve() : reject();
			} else {
				return reject();
			}
		});
	}

	/**
	 * Start listening for incomming messages on a queue
	 * 
	 * @param {String} queue 
	 * @param {Object} options 
	 * @param {Function} callback 
	 */
	listen(queue, options, callback) {
		Joi.assert(queue, Joi.string(), 'Queue is required');
		Joi.assert(callback, Joi.func().arity(1), 'Callback is required');

		return this.connectToQueue(queue, options, callback);
	}

	connectToQueue(queue, options, callback) {
		const onMsg = msg => {
			console.log(msg);
			try {
				const content = JSON.parse(msg);

				callback(content)
					.then(() => {
						// Acknowledge message
						this.channel.ack(msg);
					})
					.catch(err => {
						console.error(err);

						// Requeue message
						this.channel.nack(msg);
					});
			} catch(e) {
				// Requeue message
				this.channel.nack(msg, false, true);
			}
		};

		return this.channel.consume(queue, onMsg, options);
	}
}

module.exports = RabbitMQ;