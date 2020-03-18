import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { HTTP } from '@ionic-native/http';
import { HttpModule } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';

import { KekeruhanPage } from '../pages/kekeruhan/kekeruhan';
import { PhPage } from '../pages/ph/ph';
import { SalinitasPage } from '../pages/salinitas/salinitas';
import { SuhuPage } from '../pages/suhu/suhu';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { ServerProvider } from '../providers/server/server';

@NgModule({
  declarations: [
    MyApp,
    KekeruhanPage,
    PhPage,
    SalinitasPage,
    SuhuPage,
    HomePage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    KekeruhanPage,
    PhPage,
    SalinitasPage,
    SuhuPage,
    HomePage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ServerProvider,
    HTTP,
  ]
})
export class AppModule {}
