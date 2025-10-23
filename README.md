# Unsaved Form Protection (Angular Standalone, Control Flow)

This project demonstrates how to prevent users from losing changes by:
- blocking route navigation when there are unsaved changes (CanDeactivate guard)
- blocking page reload/tab close when there are unsaved changes (`beforeunload`)

Implementation locations:
- `src/app/features/IDeactivatable.ts`
- `src/app/app.routes.ts` (`canDeactivateForm`)
- `src/app/features/home.component.ts` (`canDeactivate`, `handleBeforeUnload`)

### canDeactivateForm (copy-paste)
Place this in `src/app/app.routes.ts` (or a dedicated `route-guards.ts` and import it into routes):
```ts
import { CanDeactivateFn } from '@angular/router';
import { IDeactivatable } from './features/IDeactivatable';

export const canDeactivateForm: CanDeactivateFn<IDeactivatable | object> = (component) => {
  if (!('canDeactivate' in component)) return true;
  return component.canDeactivate();
};
```
Notes:
- Angular v15+ supports functional guards (`CanDeactivateFn`).
- Keep typing strict. Avoid `any` and casting; rely on the interface check `'canDeactivate' in component`.

## How to Integrate into Your App

### 1) Component Contract for Unsaved Changes
File: `src/app/features/IDeactivatable.ts`
```ts
export interface IDeactivatable {
  canDeactivate(): boolean;
}
```
Any component that should block navigation implements `canDeactivate()`.

### 2) CanDeactivate Guard on Routes
File: `src/app/app.routes.ts`
```ts
import { CanDeactivateFn, Routes } from '@angular/router';
import { IDeactivatable } from './features/IDeactivatable';

export const canDeactivateForm: CanDeactivateFn<IDeactivatable | object> = (component) => {
  if (!('canDeactivate' in component)) return true;
  return component.canDeactivate();
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home.component').then(m => m.HomeComponent),
    canDeactivate: [canDeactivateForm]
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about.component').then(m => m.AboutComponent)
  }
];
```
- The guard is generic: if a component has `canDeactivate`, it runs; otherwise navigation proceeds.

### 3) Component with Form and Blocking Logic
File: `src/app/features/home.component.ts`
Key points:
- `beforeunload` wired via `host`:
  ```ts
  host: {
    '(window:beforeunload)': 'handleBeforeUnload($event)'
  }
  ```
- Template-driven form via `NgForm` and `viewChild('form')`.
- Submission flag as `signal<boolean>`.
- `canDeactivate()` checks `form.dirty` and `!isSubmitted()` and confirms.
- `handleBeforeUnload()` prevents reload if there are unsaved changes.

Minimal structure (snippets):
```ts
import { Component, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IDeactivatable } from './IDeactivatable';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: {
    '(window:beforeunload)': 'handleBeforeUnload($event)'
  },
  template: `
    <form #form="ngForm" (ngSubmit)="onSubmit(form)">
      <label [for]="nameField">User name</label>
      <input #nameField name="name" [(ngModel)]="model.name" required placeholder="User name" />
      <button type="submit" [disabled]="form.invalid">Submit</button>
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
  };

  public readonly handleBeforeUnload = (event: BeforeUnloadEvent): void => {
    if (!this.isSubmitted() && this.model.name.trim() !== '') {
      event.preventDefault();
      // Some browsers also require:
      // event.returnValue = '';
    }
  };

  public readonly onSubmit = (form: NgForm): void => {
    if (form.valid) {
      this.isSubmitted.set(true);
      // ... submission logic
      form.resetForm();
    }
  };
}

```
## Dirty state caveat (important)
- Template-driven and reactive forms mark a control/form as `dirty` on the first user edit and do not automatically revert it back to `pristine` when the user restores the original value.
- If you need “dirty iff different from the initial state”, implement manual comparison and decide when to treat the form as clean.

Minimal approaches:

- Template-driven (NgForm):
  ```ts
  // Inside component
  private readonly initial = { name: '' } as const;
  private isSame = (a: Readonly<typeof this.initial>, b: typeof this.model): boolean => a.name === b.name;

  public readonly canDeactivate = (): boolean => {
    const hasChanges = !this.isSame(this.initial, this.model);
    if (hasChanges && !this.isSubmitted()) {
      return confirm('There are unsaved changes. Are you sure you want to leave?');
    }
    return true;
  };
  ```

- Reactive Forms (sketch):
  ```ts
  // Keep an initial snapshot and compare on demand
  const initial = formGroup.getRawValue();
  const equals = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

  const hasChanges = !equals(initial, formGroup.getRawValue());
  // use hasChanges instead of formGroup.dirty in guards
  ```

Notes:
- Do not rely solely on `dirty` when you need semantic equality with the initial state.
- For complex models, prefer stable structural comparison (e.g., deep compare with stable key order) or domain-specific equality.
