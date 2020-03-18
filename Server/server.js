const app = require('express')(),
			path = require('path'),
			http = require('http').Server(app),
			bodyParse = require('body-parser'),
			cors = require('cors'),
			passport = require('passport'),

			util = require('util'),

			config = require('./config/database.js'),
			mongoose = require('mongoose'),

			io = require('socket.io')(http),
			MongoClient = require('mongodb').MongoClient,
			mqtt = require('mqtt'),

			Module = require('./models/module'),
			Data = require('./models/data'),
			client = mqtt.connect({
				port: 12505,
				host: 'm24.cloudmqtt.com',
				username: 'ulreypzx',
				password: '8UMU1gd2rU36',
				clientId: 'tamam-server-mqtt',
			});

mongoose.connect(config.database, { useNewUrlParser: true });
mongoose.connection.on('connected', () => {
	console.log('terkoneksi dengan database \"' + config.database + '\"');
});
mongoose.connection.on('error', (err) => {
	console.log('database error ' + err);
});

// variable save in server side
	// data ke aplikasi
	let statusAlat = 'tidak tersambung',
		ph = '0',
		suhu = '0',
		salinitas = '0',
		kekeruhan = '0';
//=============================

// socket io
	io.on('connection', (socket) => {
		console.log('aplikasi tersambung tampi');

		socket.emit('status-alat', statusAlat);
		socket.emit('ph', ph);
		socket.emit('suhu', suhu);
		socket.emit('salinitas', salinitas);
		socket.emit('kekeruhan', kekeruhan);

		socket.on('batasSuhu', (data) => {
			console.log("data dari set suhu apk: " + data.lowSet);
			client.publish('batasSuhu', data.lowSet + "a," + data.highSet + "b,");
		});

		socket.on('batasSalinitas', (data) => {
			console.log("data dari set salinitas apk: " + data.lowSet);
			client.publish('batasSalinitas', data.lowSet + "c," + data.highSet + "d,");
		});

		socket.on('batasPh', (data) => {
			console.log("data dari set ph apk: " + data.highSet);
			client.publish('batasPh', data.lowSet + "e," + data.highSet + "f,");
		});

		socket.on('batasKekeruhan', (data) => {
			console.log("data dari set kekeruhan apk: " + data.highSet);
			client.publish('batasKekeruhan', data.highSet + "g,");
		});


		socket.on('disconnect', () => {
			console.log('aplikasi disconnect');
		});
	});
// ==============================



// mqtt for tamam`s devices
	client.on('connect', (data) => { console.log('mqtt clien connect') });
	client.on('disconnect', (data) => {
		socket.emit('ph', 0);
		socket.emit('suhu', 0);
		socket.emit('salinitas', 0);
		socket.emit('kekeruhan', 0);
	});
	client.on('error', (data) => { });

	client.subscribe('status-alat', (err, granted) => {});
	client.subscribe('esp/ph', (err, granted) => {});
	client.subscribe('esp/suhu', (err, granted) => {});
	client.subscribe('esp/salinitas', (err, granted) => {});
	client.subscribe('esp/kekeruhan', (err, granted) => {});


	
	client.on('message', (topic, message, packet) => {
	  if(topic == 'status-alat'){
	  	let data = JSON.parse(message.toString('utf8'));
	  	statusAlat = data.status;

	  	if(statusAlat != "tersambung"){
	  		ph = 0;
	  		suhu = 0;
	  		salinitas = 0;
	  		kekeruhan = 0;
	  	}

	  	statusAlat = "tersambung";

	  	statusAlat = message.toString('utf8');
			io.emit('status-alat', statusAlat);
	  }else if(topic == 'esp/ph'){
	  	ph = message.toString('utf8');
	  	io.emit('ph', ph);

	  	statusAlat = "tersambung";

	  	clearTimeout(deviceConnect);
			deviceConnect = timeoutSet();
	  }else if(topic == 'esp/suhu'){
	  	suhu = message.toString('utf8');
	  	io.emit('suhu', suhu);

	  	statusAlat = "tersambung";

	  	clearTimeout(deviceConnect);
			deviceConnect = timeoutSet();
	  }else if(topic == 'esp/salinitas'){
	  	salinitas =  message.toString('utf8');
	  	io.emit('salinitas', salinitas);

	  	statusAlat = "tersambung";

	  	clearTimeout(deviceConnect);
			deviceConnect = timeoutSet();
	  }else if(topic == 'esp/kekeruhan'){
	  	kekeruhan =  message.toString('utf8');
	  	io.emit('kekeruhan', kekeruhan);

	  	statusAlat = "tersambung";

	  	clearTimeout(deviceConnect);
			deviceConnect = timeoutSet();
	  }
	});

	let deviceConnect;
	function timeoutSet(){
		return setTimeout(() => {
			ph = 0;
  		suhu = 0;
  		salinitas = 0;
  		kekeruhan = 0;
  		statusAlat = "tidak tersambung";

			io.emit('status-alat', "tidak tersambung");
			io.emit('ph', ph);
			io.emit('suhu', suhu);
			io.emit('salinitas', salinitas);
			io.emit('kekeruhan', kekeruhan);
		}, 5000);
	}

	setInterval(() => {
		let statusAlat_ = statusAlat == "tersambung"? true: false;	
		
		if(statusAlat_){
			let dataBaru = new Data({
				ph : ph,
  			suhu : suhu,
  			salinitas : salinitas,
  			kekeruhan : kekeruhan,
				tgl: Date.now()
			})


			Module.simpanData(dataBaru, (err, callback) => {
				if(err) throw console.log(err);
				console.log(callback);
			});
		}
	}, 60000); //setengah jam 1800000

// =====================
	app.use(cors());
	app.use(bodyParse.json());
	app.use(passport.initialize());
	app.use(passport.session());
	require('./config/passport')(passport);
	const backends = require('./routes/backends');
	app.use('/backend', backends);
	app.get('/', function (req, res) { res.send('Hello World!') })
	var server = http.listen(process.env.PORT || 3000, function () { /* console.log('App listening at port 3000 and mmqtt clien\n'); */ });
// =======================
