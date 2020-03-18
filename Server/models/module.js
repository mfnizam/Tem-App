const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Data = require('../models/data');

const moduleExports = module.exports = {};
//fungtion untuk mongoDB
moduleExports.cariPenggunaId = function(id, callback){
	User.findById(id, callback);
}

moduleExports.cariPenggunaUsername = function(username, callback){
	const query = { username: username};
	User.findOne(query, callback);
}

moduleExports.tambahUser = function(userBaru, callback){
	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(userBaru.password, salt, (err, hash) => {
			userBaru.password = hash;
			userBaru.save(callback);
		});
	})
}

moduleExports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
		if(err) throw err;
		callback(null, isMatch);
	});
};

moduleExports.simpanData = function(dataBaru, callback){
	dataBaru.save(callback);
}

moduleExports.getData = function(userId, callback){
	Data.find({}, callback);
}