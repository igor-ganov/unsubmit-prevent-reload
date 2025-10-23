import {Component, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {IDeactivatable} from './IDeactivatable';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: {
    '(window:beforeunload)': 'handleBeforeUnload($event)'
  },
  template: `
    <form #form="ngForm" (ngSubmit)="onSubmit(form)">
      <label [for]="nameField">User name</label>
      <input
        #nameField
        name="name"
        [(ngModel)]="model.name"
        required
        placeholder="User name"
      />

      <button type="submit" [disabled]="form.invalid">
        Submit
      </button>
    </form>

    @if (form.dirty && !isSubmitted()) {
      <p>⚠️ Unsaved changes</p>
    }
  `
})
export class HomeComponent implements IDeactivatable {
  public readonly model = { name: '' };
  public readonly isSubmitted = signal(false);

  private readonly form = viewChild('form', { read: NgForm });

  public readonly canDeactivate = (): boolean => {
    if (this.form()?.dirty && !this.isSubmitted()) {
      return confirm('There are unsaved changes. Are you sure you want to leave?');
    }
    return true;
  }

  public readonly handleBeforeUnload = (event: BeforeUnloadEvent): void => {
    if (!this.isSubmitted() && this.model.name.trim() !== '') {
      event.preventDefault();
    }
  }

  public readonly onSubmit = (form: NgForm): void => {
    if (form.valid) {
      this.isSubmitted.set(true);
      globalThis.alert(`Submitted: ${JSON.stringify(this.model)}`);
      form.resetForm();
    }
  }
}
