import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { IRolePayload, RoleFormDialogData } from '../../interfaces';

@Component({
  selector: 'admin-role-form-dialog',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, FormField],
  templateUrl: './role-form-dialog.html'
})
export class RoleFormDialog {
  private readonly data = inject<RoleFormDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly dialogRef = inject(MatDialogRef<RoleFormDialog, IRolePayload>);

  protected readonly roleFormModel = signal({
    name: this.data?.role?.name ?? ''
  });
  protected readonly roleForm = form(this.roleFormModel, (form) => {
    required(form.name, { message: 'You must enter your name' });
  });
  protected readonly isEdit = computed(() => Boolean(this.data?.role));

  save(event: Event): void {
    event.preventDefault();
    submit(this.roleForm, async () => {
      const name = this.roleFormModel().name.trim();
      if (!name) {
        return;
      }

      this.dialogRef.close({ name });
    });
  }
}
