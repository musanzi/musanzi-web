import { Component, computed, inject, signal } from '@angular/core';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthStore } from '@admin/app/features/auth/data-access';
import { getProfileAvatarUrl } from '@admin/app/shared/utils';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Component({
  selector: 'admin-account-profile',
  imports: [MatButton, MatDivider, MatIcon, MatFormFieldModule, MatInputModule, FormField],
  templateUrl: './profile.html'
})
export class AccountProfile {
  protected readonly authStore = inject(AuthStore);

  protected readonly avatarUrl = computed(() => getProfileAvatarUrl(this.authStore.user()?.avatar ?? null));
  protected readonly profileModel = signal(this.getUserFormValue());
  protected readonly profileForm = form(this.profileModel, (schema) => {
    required(schema.name, { message: 'You must enter your name' });
    required(schema.email, { message: 'You must enter an email address' });
    email(schema.email, { message: 'You must enter a valid email address' });
  });

  constructor() {
    this.authStore.clearMessages();
  }

  protected save(event: Event): void {
    event.preventDefault();
    this.authStore.clearMessages();

    submit(this.profileForm, async () => {
      this.authStore.updateProfile(this.profileModel());
    });
  }

  protected uploadAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.authStore.clearMessages();

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      this.authStore.setError('Unsupported format. Use JPG, PNG, WebP, or GIF.');
      input.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      this.authStore.setError('The profile photo must not exceed 2 MB.');
      input.value = '';
      return;
    }

    this.authStore.updateAvatar(file);
    input.value = '';
  }

  private getUserFormValue(): { email: string; name: string } {
    const user = this.authStore.user();

    return {
      email: user?.email ?? '',
      name: user?.name ?? ''
    };
  }
}
