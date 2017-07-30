const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DirectionsSchema = new Schema({
	route: {
		type: String,
		index: true,
	},
	total_time: {
		type: Number,
	},
	total_distance: {
		type: Number,
		index: true,
	},
	waypoint_order: {
		type: [Number],
	},
});

module.exports = mongoose.model('direction', DirectionsSchema);