const Joi = require('joi');

const queue = require('../rabbitmq');
const routeHandler = require('./handlers/route');

const routes = [
	{
		method: 'POST',
		path: '/route',
		config: {
			validate: {
				payload: Joi.array().items(Joi.array().items(Joi.number()).length(2).required()).min(2).required(),
			},
		},
		handler: (req, reply) => {
			const locations = req.payload;

			const pickup = locations.shift();
			const dropoffs = locations;

			let result = null;

			routeHandler.findRoute(pickup, dropoffs)
				.then(_result => {
					result = _result;

					// Send message to rabbit
					return queue.send({
						id: result.id,
						token: result.token,
						pickup,
						dropoffs,
					}, 'routes');
				})
				.then(() => {
					reply({
						token: result.token,
					}).code(200);
				})
				.catch(err => {
					reply({
						status: 'error',
						error: err,
					}).code(400);
				});
		},
	},
	{
		method: 'GET',
		path: '/route/{token}',
		config: {
			validate: {
				params: {
					token: Joi.string().required(),
				},
			},
		},
		handler: (req, reply) => {
			const token = req.params.token;
			routeHandler.getRoute(token)
				.then(result => {
					console.log(result);

					// Return correct response based on the status
					switch(result.status) {
					case 'success':
						reply({
							status: 'success',
						}).code(200);
						break;
					case 'in progress':
						reply({
							status: 'in progress',
						}).code(200);
						break;
					case 'failure':
						reply({
							status: 'failure',
							error: 'error',
						}).code(200);
						break;
					default:
						reply({
							status: 'failure',
						}).code(400);
					}
				})
				.catch(err => {
					reply(err).code(400);
				});
		},
	},
];

module.exports = routes;