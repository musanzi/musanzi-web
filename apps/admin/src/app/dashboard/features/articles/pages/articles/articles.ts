import { DatePipe } from '@angular/common';
import { Component, debounced, DestroyRef, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialog } from '@admin/app/dashboard/ui/confirm-dialog/confirm-dialog';
import { DEFAULT_LIMIT, IArticle, MAX_LIMIT } from '@libs/utils';
import { ArticlesStore } from '../../data-access';
import { getArticleCoverUrl } from '../../utils';
import { httpResource } from '@angular/common/http';

@Component({
  selector: 'admin-articles',
  providers: [ArticlesStore],
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatChipsModule,
    MatFormFieldModule,
    MatIconButton,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './articles.html'
})
export class Articles {
  protected readonly articlesStore = inject(ArticlesStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  protected readonly displayedColumns = signal<string[]>([
    'article',
    'status',
    'viewsCount',
    'publishedAt',
    'updatedAt',
    'actions'
  ]);
  protected readonly statusOptions = signal([
    { label: 'All', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' }
  ]);
  query = signal('');
  debouncedQuery = debounced(this.query, 300);
  protected readonly params = linkedSignal(() => ({
    limit: DEFAULT_LIMIT,
    page: 1,
    status: 'all',
    q: this.debouncedQuery.value()
  }));
  protected readonly coverUrl = getArticleCoverUrl;

  protected readonly articlesResource = httpResource<[IArticle[], number]>(() => ({
    url: '/articles/admin',
    params: this.params()
  }));

  protected isPublished(article: IArticle): boolean {
    return !!article.publishedAt && new Date(article.publishedAt) <= new Date();
  }

  protected deleteArticle(article: IArticle): void {
    this.dialog
      .open<ConfirmDialog, unknown, boolean>(ConfirmDialog, {
        data: {
          message: `Do you want to delete the article "${article.title}"?`,
          title: 'Delete article'
        },
        width: '420px'
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.articlesStore.deleteArticle({ articleId: article.id });
      });
  }

  protected pageChanged(event: PageEvent): void {
    this.params.update((p) => ({ ...p, page: event.pageIndex + 1, limit: Math.min(event.pageSize, MAX_LIMIT) }));
  }

  protected statusChanged(status: string): void {
    this.params.update((p) => ({ ...p, page: 1, status }));
  }

  protected trackBy(_: number, article: IArticle): string {
    return article.id;
  }
}
