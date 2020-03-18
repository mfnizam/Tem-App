import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import * as io from 'socket.io-client';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {


	@ViewChild('radialPh') radialPh: ElementRef;
	@ViewChild('radialSuhu') radialSuhu: ElementRef;
	@ViewChild('radialSalinitas') radialSalinitas: ElementRef;
	@ViewChild('radialKekeruhan') radialKekeruhan: ElementRef;


	socket = io('https://tampi-gyo.herokuapp.com/');
	statusAlat = {
		boolean: false,
		string: 'offline'
	}
	reload = {
		ready : false
	}

	sensor = {
		ph: {
			ph: 0,
			valueBar: 916,
			valueTengah: 0,
		},
		suhu : {
			suhu: 0,
			valueBar: 916,
			valueTengah: 0
		},
		salinitas : {
			salinitas: 0,
			valueBar: 916,
			valueTengah: 0
		},
		kekeruhan : {
			kekeruhan: 0,
			valueBar: 916,
			valueTengah: 0
		}
	}

	constructor(public navCtrl: NavController) {
		
	}

	ionViewDidLoad(){
		this.socketInit();
	}

	socketInit(){
		let radialPhDowo = this.radialPh.nativeElement.getTotalLength();
		let radialSuhuDowo = this.radialSuhu.nativeElement.getTotalLength();
		let radialSalinitasDowo = this.radialSalinitas.nativeElement.getTotalLength();
		let radialKekeruhanDowo = this.radialKekeruhan.nativeElement.getTotalLength();

		this.socket.on('connect_error', (socket) => {
			this.statusAlat.string = 'offline'; 
			this.statusAlat.boolean = false;
		});

		this.socket.on('connect', (socket) => {
			console.log("connect");
		});

		this.socket.on('status-alat', (data) => {
			console.log(data);
			this.statusAlat.boolean = (data == "tersambung");
			this.statusAlat.string = data;
			this.reload.ready = true;

			// if(!this.statusAlat.boolean){
			// 	this.sensor.suhu.suhu = 0;
			// 	this.sensor.suhu.valueBar = 350 - (this.sensor.suhu.suhu * firstRadialDowo) / 100;
			// 	this.sensor.suhu.valueTengah = this.sensor.suhu.suhu;

			// 	this.sensor.kelembaban.kelembaban = 0;
			// 	this.sensor.kelembaban.valueBar = 350 - (this.sensor.kelembaban.kelembaban * secondRadialDowo) / 100;
			// 	this.sensor.kelembaban.valueTengah = this.sensor.kelembaban.kelembaban;

			// }else{

			// }
		});

		this.socket.on('ph', (data) => {
			// return true;
			this.sensor.ph.ph = Number(parseFloat(data).toFixed(1));
			this.sensor.ph.valueBar = 916 - (this.sensor.ph.ph * radialPhDowo) / 14;
			this.sensor.ph.valueTengah = this.sensor.ph.ph;
		});

		this.socket.on('suhu', (data) => {
			// return true;
			this.sensor.suhu.suhu = Number(parseFloat(data).toFixed(1));
			this.sensor.suhu.valueBar = 916 - (this.sensor.suhu.suhu * radialSuhuDowo) / 100;
			this.sensor.suhu.valueTengah = this.sensor.suhu.suhu;
		});

		this.socket.on('salinitas', (data) => {
			// return true;
			this.sensor.salinitas.salinitas = parseFloat(data);
			this.sensor.salinitas.valueBar = 916 - (this.sensor.salinitas.salinitas * radialSalinitasDowo) / 100;
			this.sensor.salinitas.valueTengah = this.sensor.salinitas.salinitas;
		});

		this.socket.on('kekeruhan', (data) => {
			// return true;
			this.sensor.kekeruhan.kekeruhan = Number(parseFloat(data).toFixed(1));
			this.sensor.kekeruhan.valueBar = 916 - (this.sensor.kekeruhan.kekeruhan * radialKekeruhanDowo) / 100;
			this.sensor.kekeruhan.valueTengah = this.sensor.kekeruhan.kekeruhan;
		});
	}

}
