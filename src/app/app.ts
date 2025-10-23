import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MenuComponent} from './layout/menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent],
  template: `
    <menu app-menu></menu>
    <router-outlet/>
  `
})
export class App {
}
