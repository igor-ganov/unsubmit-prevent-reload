import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>About</h1>
  `,
  styles: [`

  `]
})
export class AboutComponent {
}
