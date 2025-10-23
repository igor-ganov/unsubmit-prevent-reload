import {Component, ChangeDetectionStrategy} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'menu[app-menu]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li>
      <a routerLink="/">Home</a>
      <a routerLink="/about">About</a>
    </li>
  `,
  imports: [
    RouterLink
  ],
  styles: [`
    :host{
      display: flex;
      flex-direction: row;
      gap: 1em;
    }
  `]
})
export class MenuComponent {
}
