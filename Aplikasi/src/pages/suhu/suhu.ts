import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { ServerProvider } from '../../providers/server/server';

import * as io from 'socket.io-client';
import moment from 'moment';

@Component({
  selector: 'page-suhu',
  templateUrl: 'suhu.html'
})
export class SuhuPage {
	
	socket = io('https://tampi-gyo.herokuapp.com/');
	status = false;
	showSelected: boolean;
	suhu = {
		suhu: 0,
		lowSet: 0,
		highSet: 0,
		lowNow: 0,
		highNow: 0
	}


	hiss = []

	constructor(
		public navCtrl: NavController,
		public platform: Platform,
		public serverProvider: ServerProvider) {
	    this.showSelected = false;
	    this.socketInit()
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
				this.hiss = data;
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
		return Number(data) > 28 && Number(data) < 33? 'good' : 'bad';
	}

	conversiTglWaktu(tgl){
    return moment(tgl).format('HH:mm - DD MMM YYYY'); 
  }

	socketInit(){
		this.socket.on('connect_error', (socket) => {
			// console.log("error conect socket io");
		});

		this.socket.on('connect', (socket) => {
			// console.log("socket io connected");
		});

		this.socket.on('suhu', (data) => {
			this.suhu.suhu = Number(parseFloat(data).toFixed(1));
			// console.log(data);
		});
	}

	kirimSet(){
		console.log(Number(this.suhu.lowSet), Number(this.suhu.highSet));
		this.socket.emit('batasSuhu', { lowSet: this.suhu.lowSet, highSet: this.suhu.highSet });
	}

  ShowButton() {
      this.showSelected = true;
  }
  HideButton() {
      this.showSelected = false;
  }

}
