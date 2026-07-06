import { DatePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialog } from '@admin/app/dashboard/ui/confirm-dialog/confirm-dialog';
import { DEFAULT_LIMIT, ITag, MAX_LIMIT } from '@libs/utils';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TagsStore } from '../../data-access';
import { ITagPayload, ITagQuery } from '../../interfaces';
import { TagFormDialog } from '../../ui/tag-form-dialog/tag-form-dialog';

@Component({
  selector: 'admin-tags',
  providers: [TagsStore],
  imports: [
    DatePipe,
    MatButtonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatFormFieldModule,
    MatIconButton,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    ReactiveFormsModule
  ],
  templateUrl: './tags.html'
})
export class Tags {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly displayedColumns = ['name', 'updatedAt', 'actions'];
  protected readonly query = {
    limit: DEFAULT_LIMIT,
    page: 1,
    q: ''
  } satisfies ITagQuery;
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly tagsStore = inject(TagsStore);

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.query.page = 1;
        this.query.q = this.searchControl.value.trim();
        this.loadTags();
      });

    this.loadTags();

    effect(() => {
      const error = this.tagsStore.error();
      const success = this.tagsStore.success();

      if (error) {
        this.snackBar.open(error, 'Close', { duration: 5000 });
        queueMicrotask(() => this.tagsStore.clearMessages());
      }

      if (success) {
        this.snackBar.open(success, 'Close', { duration: 3000 });
        queueMicrotask(() => this.tagsStore.clearMessages());
      }
    });
  }

  protected createTag(): void {
    this.dialog
      .open<TagFormDialog, undefined, ITagPayload>(TagFormDialog, { width: '420px' })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((payload) => {
        if (!payload) {
          return;
        }

        this.tagsStore.saveTag({ payload });
      });
  }

  protected deleteTag(tag: ITag): void {
    this.dialog
      .open<ConfirmDialog, unknown, boolean>(ConfirmDialog, {
        data: {
          message: `Do you want to delete the tag "${tag.name}"?`,
          title: 'Delete tag'
        },
        width: '420px'
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.tagsStore.deleteTag({ tagId: tag.id });
      });
  }

  protected editTag(tag: ITag): void {
    this.dialog
      .open<TagFormDialog, { tag: ITag }, ITagPayload>(TagFormDialog, {
        data: { tag },
        width: '420px'
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((payload) => {
        if (!payload) {
          return;
        }

        this.tagsStore.saveTag({ payload, tagId: tag.id });
      });
  }

  protected loadTags(): void {
    this.query.limit = Math.min(Number(this.query.limit), MAX_LIMIT);
    this.tagsStore.loadTags(this.query);
  }

  protected pageChanged(event: PageEvent): void {
    this.query.page = event.pageIndex + 1;
    this.query.limit = Math.min(event.pageSize, MAX_LIMIT);
    this.loadTags();
  }

  protected trackBy(_: number, tag: ITag): string {
    return tag.id;
  }
}
