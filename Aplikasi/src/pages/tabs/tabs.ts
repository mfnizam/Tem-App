import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';


import { KekeruhanPage } from '../kekeruhan/kekeruhan';
import { PhPage } from '../ph/ph';
import { SalinitasPage } from '../salinitas/salinitas';
import { SuhuPage } from '../suhu/suhu';
import { HomePage } from '../home/home';

@Component({
	selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = SuhuPage;
  tab3Root = SalinitasPage;
  tab4Root = PhPage;
  tab5Root = KekeruhanPage;
  
  constructor() {

  }
}
