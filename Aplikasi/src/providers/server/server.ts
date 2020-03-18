import { AlertController, Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';
// import { Http, Headers, RequestOptions } from '@angular/http';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

export class User {
	nama: String;
	email: String;

	constructor(nama: string, email: string){
		this.nama = nama;
		this.email = email;    
	}
}


@Injectable()
export class ServerProvider {

  serverUrl = 'http://tampi-gyo.herokuapp.com/backend/';
  // serverUrl = 'http://192.168.43.192:3000/backend/';
	UserLogin: User;

  constructor(
    public alertCtrl: AlertController,
    public storage: Storage,
    private http: HTTP,
    private Http: Http,
    public platform: Platform
    ) {}


  public register(data){

    let url = this.serverUrl + "daftar/" + data.nama + "/" + data.email + "/" + data.nama + "/" + data.password;
    // let url = this.serverUrl + data.nama + "/" + data.password;
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });

    if(!this.platform.is('cordova')){
      // return this.Http.post(url, JSON.stringify({nama: data.nama, email: data.email, username: data.nama, password: data.password}), options)
      return this.Http.get(url)
      .map((response) => response.json())
      .toPromise();      
    }else{
      return this.http.get(url, {}, {});
    }
  }

  public login(data){
    let url = this.serverUrl + "masuk/" + data.nama + "/" + data.password;
    if(!this.platform.is('cordova')){
      return this.Http.get(url)
      .map((response) => response.json())
      .toPromise();
    }else{
      return this.http.get(url, {}, {})
    }
  }

  public logout() {
    return Observable.create(observer => {
      this.UserLogin = null;
      this.storage.remove('userData');
      observer.next(true);
      // observer.complete();
    });
  }

  public ambilData(id_pengguna){
    let url = this.serverUrl + "getdata?userId=" + id_pengguna;
    if(!this.platform.is('cordova')){
      // return this.Http.post(url, JSON.stringify({nama: data.nama, email: data.email, username: data.nama, password: data.password}), options)
      return this.Http.get(url)
      .map((response) => response.json())
      .toPromise();      
    }else{
      return this.http.get(url, {}, {});
    }
  }

  public getData(idBayi){
    // let url = this.serverUrl + "getData?userId=" + userId;
    let url = this.serverUrl + "getData?id_bayi=" + idBayi;
    if(!this.platform.is('cordova')){
      return this.Http.get(url)
      .map((response) => response.json())
      .toPromise();      
    }else{
      return this.http.get(url, {}, {});
    }
  }

  public tambahData(idBayi, berat, tinggi){
    let url = this.serverUrl + "tambahData?id_bayi=" + idBayi + "&berat=" + berat + "&tinggi=" + tinggi;
    if(!this.platform.is('cordova')){
      return this.Http.get(url)
      .map((response) => response.json())
      .toPromise();      
    }else{
      return this.http.get(url, {}, {});
    }
  }

  

  //local storage
  public setStorage(key, isi){
    return this.storage.set(key, isi);
  }

  public getStorage(key){
    return this.storage.get(key).catch(err => {
      console.log(err)
    });
  }
  public getAllStorage(){
    return this.storage.forEach((v, k) => {
      console.log(k + " : " ,v);
    });
  }

  //alert
  public showError(text) { 
    let alert = this.alertCtrl.create({
      // title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present();
  }
}
