import { DatePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { TagsStore } from '@admin/app/dashboard/features/tags/data-access';
import { ConfirmDialog } from '@admin/app/dashboard/ui/confirm-dialog/confirm-dialog';
import { DEFAULT_LIMIT, IArticle, MAX_LIMIT } from '@libs/utils';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ArticlesStore } from '../../data-access';
import { ArticleStatus, IArticleQuery } from '../../interfaces';
import { getArticleCoverUrl } from '../../utils';

@Component({
  selector: 'admin-articles',
  providers: [ArticlesStore, TagsStore],
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly articlesStore = inject(ArticlesStore);
  protected readonly displayedColumns = ['article', 'status', 'tags', 'publishedAt', 'updatedAt', 'actions'];
  protected readonly query = {
    limit: DEFAULT_LIMIT,
    page: 1,
    q: '',
    status: 'all' as ArticleStatus,
    tagId: ''
  } satisfies IArticleQuery;
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly statusOptions: { label: string; value: ArticleStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' }
  ];
  protected readonly tagsStore = inject(TagsStore);

  constructor() {
    this.tagsStore.loadTags({ limit: MAX_LIMIT, page: 1 });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.query.page = 1;
        this.query.q = this.searchControl.value.trim();
        this.loadArticles();
      });

    this.loadArticles();

    effect(() => {
      const error = this.articlesStore.error();
      const success = this.articlesStore.success();

      if (error) {
        this.snackBar.open(error, 'Close', { duration: 5000 });
        queueMicrotask(() => this.articlesStore.clearMessages());
      }

      if (success) {
        this.snackBar.open(success, 'Close', { duration: 3000 });
        queueMicrotask(() => this.articlesStore.clearMessages());
      }
    });

    effect(() => {
      const error = this.tagsStore.error();

      if (error) {
        this.snackBar.open(error, 'Close', { duration: 5000 });
        queueMicrotask(() => this.tagsStore.clearMessages());
      }
    });
  }

  protected coverUrl(article: IArticle): string | null {
    return getArticleCoverUrl(article.cover);
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

  protected loadArticles(): void {
    this.query.limit = Math.min(Number(this.query.limit), MAX_LIMIT);
    this.articlesStore.loadArticles(this.query);
  }

  protected pageChanged(event: PageEvent): void {
    this.query.page = event.pageIndex + 1;
    this.query.limit = Math.min(event.pageSize, MAX_LIMIT);
    this.loadArticles();
  }

  protected statusChanged(status: ArticleStatus): void {
    this.query.page = 1;
    this.query.status = status;
    this.loadArticles();
  }

  protected tagChanged(tagId: string): void {
    this.query.page = 1;
    this.query.tagId = tagId;
    this.loadArticles();
  }

  protected trackBy(_: number, article: IArticle): string {
    return article.id;
  }
}
