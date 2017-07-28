const Joi = require('joi');

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

			console.log(pickup);
			console.log(dropoffs);
			reply('ok');
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

			reply(`${token}`);
		},
	},
];

module.exports = routes;