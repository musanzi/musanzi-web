import { httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { email, form, FormField, required, submit, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IRole, MAX_LIMIT } from '@libs/utils';
import { IUserPayload, IUserFormDialog } from '../../interfaces';

@Component({
  selector: 'admin-user-form-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    FormField
  ],
  templateUrl: './user-form-dialog.html'
})
export class UserFormDialog {
  protected readonly data = inject<IUserFormDialog>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<UserFormDialog, IUserPayload>);

  protected readonly rolesResource = httpResource<[IRole[], number]>(() => ({
    url: '/roles',
    params: { limit: MAX_LIMIT, page: 1 }
  }));
  protected readonly roles = computed(() => this.rolesResource.value()?.[0] ?? []);

  protected readonly userFormModel = signal({
    name: this.data.user?.name ?? '',
    email: this.data.user?.email ?? '',
    password: '',
    roles: this.data.user?.roles ?? []
  });
  protected readonly userForm = form(this.userFormModel, (form) => {
    required(form.name, { message: 'You must enter your name' });
    required(form.email, { message: 'You must enter an email address' });
    email(form.email, { message: 'You must enter a valid email address' });
    validate(form.roles, ({ value }) => {
      if (value().length === 0) {
        return {
          kind: 'required',
          message: 'Select at least one role.'
        };
      }

      return null;
    });
  });
  protected readonly isEdit = computed(() => Boolean(this.data.user));

  constructor() {
    effect(() => {
      const roles = this.roles();

      if (roles.length === 0) {
        return;
      }

      this.userFormModel.update((model) => ({ ...model, roles: this.resolveRoleIds(model.roles, roles) }));
    });
  }

  save(event: Event): void {
    event.preventDefault();
    submit(this.userForm, async () => {
      const rawValue = this.userFormModel();
      const payload: IUserPayload = {
        name: rawValue.name.trim(),
        email: rawValue.email.trim(),
        roles: rawValue.roles
      };
      const password = rawValue.password.trim();

      if (!payload.name) {
        return;
      }

      if (password) {
        payload.password = password;
      }

      this.dialogRef.close(payload);
    });
  }

  private resolveRoleIds(values: string[], roles: IRole[]): string[] {
    const rolesByName = new Map(roles.map((role) => [role.name, role.id]));
    const roleIds = new Set(roles.map((role) => role.id));

    return values
      .map((value) => {
        if (roleIds.has(value)) {
          return value;
        }

        return rolesByName.get(value);
      })
      .filter((value): value is string => Boolean(value));
  }
}
