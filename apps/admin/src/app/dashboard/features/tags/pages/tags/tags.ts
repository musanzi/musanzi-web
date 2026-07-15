import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, debounced, DestroyRef, effect, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialog } from '@admin/app/dashboard/ui/confirm-dialog/confirm-dialog';
import { DEFAULT_LIMIT, ITag, MAX_LIMIT } from '@libs/utils';
import { TagsStore } from '../../data-access';
import { ITagPayload } from '../../interfaces';
import { TagFormDialog } from '../../ui/tag-form-dialog/tag-form-dialog';

@Component({
  selector: 'admin-tags',
  providers: [TagsStore],
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatFormFieldModule,
    MatIconButton,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule
  ],
  templateUrl: './tags.html'
})
export class Tags {
  protected readonly tagsStore = inject(TagsStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  protected readonly displayedColumns = signal<string[]>(['name', 'updatedAt', 'actions']);
  query = signal('');
  debouncedQuery = debounced(this.query, 300);
  protected readonly params = linkedSignal(() => ({
    limit: DEFAULT_LIMIT,
    page: 1,
    q: this.debouncedQuery.value()
  }));

  protected readonly tagsResource = httpResource<[ITag[], number]>(() => ({
    url: '/tags',
    params: this.params()
  }));

  constructor() {
    effect(() => {
      if (this.tagsStore.success()) {
        this.tagsResource.reload();
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

  protected pageChanged(event: PageEvent): void {
    this.params.update((p) => ({ ...p, page: event.pageIndex + 1, limit: Math.min(event.pageSize, MAX_LIMIT) }));
  }
}
