const util = require('util');
const mosca = require('mosca');
const settings = { port: process.env.PORT ? parseInt(process.env.PORT) : 1883 };
const server = new mosca.Server(settings);

server.on('clientConnected', function(client) {
	let mess = {
		topic: 'status-alat',
		payload: '{ "status": "tidak tersambung", "deviceId" : "" }',
		qos: 0, // 0, 1, or 2
		retain: false // or true
	}
	for (key in client.server.clients) {
	    if(key.includes('esp->server-wawan')) {
	    	mess.payload = '{ "status": "tersambung", "deviceId" : "' + key + '" }';
	    }
	}

	
	if((client.id).includes('esp->server-wawan')){
		server.publish(mess, () => { });
	}

	if(client.id == 'server=>server-wawan-local' || client.id == 'server=>server-wawan'){
		server.publish(mess, () => { });	
	}
});

server.on('clientDisconnected', (client) => {
	if(client.id == 'esp->server-wawan'){
		let mess = {
			topic: 'status-alat',
			payload: '{ "status": "tidak tersambung", "deviceId" : "' + client.id + '" }',
			qos: 0, // 0, 1, or 2
			retain: false // or true
		}
		server.publish(mess, () => {});
	}
});

// when a message is received
	server.on('published', function(packet, client) {
	  // console.log('topic:', packet.topic, ' payload: ', packet.payload.toString());
	});
	server.on('subscribed', (packet, client) => {
		// console.log('subscribed: ' + client.id); 
		// console.log(packet);
	});
	server.on('unsubscribed', (packet, client) => {
		// console.log('unsubscribed: ' + client.id);
	});
	server.on('ready', () => {
	  console.log('Mosca server is up and running');
	});
// ================================
