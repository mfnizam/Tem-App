const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
//user scheme
const DataSchema = mongoose.Schema({
	tgl: { 
		type: Date,
		required: true 
	},
	ph: {
		type: Number,
		required: true
	},
	suhu: {
		type: Number,
		required: true
	},
	salinitas: {
		type: Number,
		required: true
	},
	kekeruhan: {
		type: Number,
		required: true
	}
});

//export mongoDB scheme dan user file sebagai User
const Data = mongoose.model('Data', DataSchema);
module.exports = Data;