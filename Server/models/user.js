const mongoose = require('mongoose');
const config = require('../config/database');
const Schema = mongoose.Schema;
const Data = require('./data');

//user scheme
const UserSchema = mongoose.Schema({
	nama: {
		type: String
	},
	email: {
		type: String
	},
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	data : [{ type: Schema.Types.ObjectId, ref: 'Data' }]
});

//export mongoDB scheme dan user file sebagai User
const User = mongoose.model('User', UserSchema);
module.exports = User;
