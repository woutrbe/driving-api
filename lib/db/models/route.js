const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RouteSchema = new Schema({
	status: {
		type: String,
		default: 'in progress',
	},
	token: {
		type: String,
	},
	from: {
		type: [Number],
	},
	pickups: {
		type: [[Number]],
	},
	total_time: {
		type: Number,
	},
	total_distance: {
		type: Number,
	},
});

module.exports = mongoose.model('route', RouteSchema);