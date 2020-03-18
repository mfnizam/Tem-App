import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { ServerProvider } from '../../providers/server/server';

import * as io from 'socket.io-client';
import moment from 'moment';

@Component({
  selector: 'page-kekeruhan',
  templateUrl: 'kekeruhan.html'
})
export class KekeruhanPage {
	
	socket = io('https://tampi-gyo.herokuapp.com/');
	status = false;
	showSelected: boolean;
	kekeruhan = {
		kekeruhan: 0,
		highSet: 0,
		highNow: 0
	}
	hissk = []
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
				this.hissk = data;
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
		return Number(data) < 50? 'good' : 'bad';
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

		this.socket.on('kekeruhan', (data) => {
			this.kekeruhan.kekeruhan = Number(parseFloat(data).toFixed(1));
			console.log(data);
		});
	}

	kirimSet(){
		console.log(Number(this.kekeruhan.highSet));
		this.socket.emit('batasKekeruhan', { highSet: this.kekeruhan.highSet });
	}

    ShowButton() {
        this.showSelected = true;
    }
    HideButton() {
        this.showSelected = false;
    }
	
}
