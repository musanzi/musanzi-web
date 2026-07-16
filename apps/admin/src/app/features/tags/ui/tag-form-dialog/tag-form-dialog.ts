import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, maxLength, required, submit } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ITagFormDialogData, ITagPayload } from '../../interfaces';

const TAG_NAME_MAX_LENGTH = 80;

@Component({
  selector: 'admin-tag-form-dialog',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, FormField],
  templateUrl: './tag-form-dialog.html'
})
export class TagFormDialog {
  private readonly data = inject<ITagFormDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly dialogRef = inject(MatDialogRef<TagFormDialog, ITagPayload>);

  protected readonly isEdit = computed(() => Boolean(this.data?.tag));
  protected readonly tagFormModel = signal({
    name: this.data?.tag?.name ?? ''
  });
  protected readonly tagForm = form(this.tagFormModel, (form) => {
    required(form.name, { message: 'Enter a tag name.' });
    maxLength(form.name, TAG_NAME_MAX_LENGTH, { message: `Tag names must be ${TAG_NAME_MAX_LENGTH} characters or less.` });
  });

  save(event: Event): void {
    event.preventDefault();
    submit(this.tagForm, async () => {
      const name = this.tagFormModel().name.trim();

      if (!name || name.length > TAG_NAME_MAX_LENGTH) {
        return;
      }

      this.dialogRef.close({ name });
    });
  }
}
