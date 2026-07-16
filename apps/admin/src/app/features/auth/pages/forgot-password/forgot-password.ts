import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../data-access';

@Component({
  selector: 'auth-forgot-password',
  templateUrl: './forgot-password.html',
  imports: [MatFormFieldModule, RouterLink, MatInputModule, MatButtonModule, MatIconModule, FormField]
})
export class AuthForgotPassword {
  protected authStore = inject(AuthStore);
  protected forgotPasswordFormModel = signal({
    email: ''
  });
  protected forgotPasswordForm = form(this.forgotPasswordFormModel, (form) => {
    required(form.email, { message: 'You must enter an email address' });
    email(form.email, { message: 'You must enter a valid email address' });
  });

  forgotPassword(event: Event) {
    event.preventDefault();
    submit(this.forgotPasswordForm, async () => {
      this.authStore.forgotPassword(this.forgotPasswordFormModel());
    });
  }
}
