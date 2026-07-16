import { Component, effect, inject, signal } from '@angular/core';
import { form, FormField, required, submit, validate } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthStore } from '@admin/app/features/auth/data-access';

@Component({
  selector: 'admin-account-security',
  imports: [MatButton, MatDivider, MatIcon, MatFormFieldModule, MatInputModule, FormField],
  templateUrl: './security.html'
})
export class AccountSecurity {
  protected readonly authStore = inject(AuthStore);

  protected readonly securityModel = signal({
    confirmPassword: '',
    password: ''
  });
  protected readonly securityForm = form(this.securityModel, (schema) => {
    required(schema.password, { message: 'You must enter a password' });
    required(schema.confirmPassword, { message: 'You must confirm your password' });

    validate(schema.confirmPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(schema.password)) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match'
        };
      }

      return null;
    });
  });

  constructor() {
    this.authStore.clearMessages();

    effect(() => {
      if (this.authStore.success()) {
        this.securityModel.set({
          confirmPassword: '',
          password: ''
        });
      }
    });
  }

  protected save(event: Event): void {
    event.preventDefault();
    this.authStore.clearMessages();

    submit(this.securityForm, async () => {
      this.authStore.updatePassword({ password: this.securityModel().password });
    });
  }
}
