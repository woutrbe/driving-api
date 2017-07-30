const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RouteSchema = new Schema({
	status: {
		type: String,
		default: 'in progress',
	},
	token: {
		type: String,
		index: true,
	},
	from: {
		type: [Number],
	},
	pickups: {
		type: [[Number]],
	},
	error: {
		type: String,
	},
});

module.exports = mongoose.model('route', RouteSchema);