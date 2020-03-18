import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { ServerProvider } from '../../providers/server/server';

import * as io from 'socket.io-client';
import moment from 'moment';

@Component({
  selector: 'page-ph',
  templateUrl: 'ph.html'
})
export class PhPage {

	socket = io('https://tampi-gyo.herokuapp.com/');
	status = false;
	showSelected: boolean;
	ph = {
		ph: 0,
		lowSet: 0,
		highSet: 0,
		lowNow: 0,
		highNow: 0
	}


	hissp = [ ]

	constructor(
		public navCtrl: NavController,
		public platform: Platform,
		public serverProvider: ServerProvider) {
	    this.showSelected = false;
	    this.socketInit();
	}

	ionViewWillLeave(){
		// this.socket.disconnect();
	}

	ionViewCanEnter(){
		this.serverProvider.ambilData("tampi").then(data => {
			if(this.platform.is('cordova')){
        data = JSON.parse(data.data);
      }
      console.log(data);
      if(!data.msg){
				this.hissp = data;
			}else{
				this.serverProvider.showError("tidak dapat memuat data histori");
			}
		})
		.catch(err => {
			console.log(err);
			this.serverProvider.showError("tidak dapat memuat data histori");
		});
	}

	cekStatus(data){
		return Number(data) < 8.5 && Number(data) > 7.5? 'good' : 'bad';
	}

	conversiTglWaktu(tgl){
    return moment(tgl).format('HH:mm - DD MMM YYYY'); 
  }

	socketInit(){
		this.socket.on('connect_error', (socket) => {
			console.log("error conect socket io");
		});

		this.socket.on('connect', (socket) => {
			console.log("socket io connected");
		});

		this.socket.on('ph', (data) => {
			this.ph.ph = Number(parseFloat(data).toFixed(1))
			console.log(data);
		});
	}

	kirimSet(){
		console.log(Number(this.ph.lowSet), Number(this.ph.highSet));
		this.socket.emit('batasPh', { lowSet: this.ph.lowSet, highSet: this.ph.highSet });
	}

  ShowButton() {
      this.showSelected = true;
  }
  HideButton() {
      this.showSelected = false;
  }
}

