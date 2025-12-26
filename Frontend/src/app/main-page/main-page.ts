import { Component } from '@angular/core';
import {SideBar} from '../components/side-bar/side-bar';
import {Canvas} from '../components/canvas/canvas';
import {TopBar} from '../components/top-bar/top-bar';

@Component({
  selector: 'app-main-page',
  imports: [
    SideBar,
    Canvas,
    TopBar
  ],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage {

}
