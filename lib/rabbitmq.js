const Joi = require('joi');
const amqplib = require('amqplib');

class RabbitMQ {
	constructor() {
		this.connection = null;
		this.channel = null;
	}

	/**
	 * Connect to the defined queues / exhcanges
	 *
	 * @param {String} uri
	 *
	 * @return {Promise}
	 */
	connect(uri) {
		Joi.assert(uri, Joi.string().required());

		this.options = {
			uri,
		};

		return new Promise((resolve, reject) => {
			amqplib.connect(this.options.uri)
				.then(_connection => {
					this.connection = _connection;

					this.connection.once('close', () => {
						console.error('Connection clossed');
					});

					this.connection.once('error', err => {
						// TODO: try and restart
						console.error(err);
					});

					return this.connection.createChannel();
				})
				.then(_channel => {
					this.channel = _channel;
					this.channel.prefetch(1);

					// Assert an exchange into existence if required
					if(this.options.exchange && this.options.exchangeType) {
						return this.channel.assertExchange(this.options.exchange, this.options.exchangeType, {})
							.then(() => {
								return resolve();
							})
							.catch(() => {
								return reject();
							});
					}

					return resolve();
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
	 * @param {Object} msg
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
				return this.channel.assertQueue(queue)
					.then(() => {
						const success = this.channel.publish(toExchange, queue, new Buffer(body), { persistent: true });
						return success ? resolve() : reject();
					});
			}

			return reject();
		});
	}

	/**
	 * Start listening for incomming messages on a queue
	 *
	 * @param {String} queue
	 * @param {Object} options
	 * @param {Function} callback
	 */
	listen(queue, options, context, callback) {
		Joi.assert(queue, Joi.string(), 'Queue is required');
		Joi.assert(callback, Joi.func().arity(1), 'Callback is required');

		return this.connectToQueue(queue, options, context, callback);
	}

	connectToQueue(queue, options, context, callback) {
		const onMsg = msg => {
			try {
				let content = Buffer.from(msg.content).toString('utf8');
				content = JSON.parse(content);

				callback.call(context, content)
					.then(() => {
						// Acknowledge message
						this.channel.ack(msg);
					})
					.catch(err => {
						console.error(err);

						// Requeue message
						this.channel.ack(msg);
					});
			} catch(e) {
				// Requeue message
				this.channel.nack(msg, false, true);
			}
		};

		this.channel.assertQueue(queue);
		return this.channel.consume(queue, onMsg, options);
	}
}

// Return a new instance since we want to maintain the connection at all times
module.exports = new RabbitMQ();