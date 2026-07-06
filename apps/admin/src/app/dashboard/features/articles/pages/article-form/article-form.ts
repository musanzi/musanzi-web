import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { disabled, form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TagsStore } from '@admin/app/dashboard/features/tags/data-access';
import { UiTextEditor } from '@libs/ui';
import { IArticle, MAX_LIMIT } from '@libs/utils';
import { ArticlesStore } from '../../data-access';
import { IArticleForm, IArticlePayload } from '../../interfaces';
import { getArticleCoverUrl } from '../../utils';

@Component({
  selector: 'admin-article-form',
  providers: [ArticlesStore, TagsStore],
  imports: [
    FormField,
    MatButtonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    RouterLink,
    UiTextEditor
  ],
  templateUrl: './article-form.html'
})
export class ArticleForm {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly articleId = this.route.snapshot.paramMap.get('id');
  protected readonly articlesStore = inject(ArticlesStore);
  protected readonly coverFile = signal<File | null>(null);
  protected readonly coverPreviewUrl = signal<string | null>(null);
  protected readonly articleModel = signal<IArticleForm>({
    content: '',
    publishedAt: null,
    summary: '',
    tagIds: [],
    title: ''
  });
  protected readonly articleForm = form(this.articleModel, (schema) => {
    disabled(schema.title, { when: () => this.articlesStore.isSaving() });
    required(schema.title, { message: 'Enter an article title.' });

    disabled(schema.summary, { when: () => this.articlesStore.isSaving() });
    required(schema.summary, { message: 'Enter an article summary.' });

    disabled(schema.content, { when: () => this.articlesStore.isSaving() });
    required(schema.content, { message: 'Enter article content.' });

    disabled(schema.publishedAt, { when: () => this.articlesStore.isSaving() });

    disabled(schema.tagIds, { when: () => this.articlesStore.isSaving() });
  });
  protected readonly existingCoverUrl = computed(() => getArticleCoverUrl(this.articlesStore.article()?.cover ?? null));
  protected readonly displayCoverUrl = computed(() => this.coverPreviewUrl() ?? this.existingCoverUrl());
  protected readonly formInvalid = computed(() => this.articleForm().invalid());
  protected readonly isEdit = computed(() => Boolean(this.articleId));
  protected readonly tagsStore = inject(TagsStore);

  constructor() {
    this.tagsStore.loadTags({ limit: MAX_LIMIT, page: 1 });

    if (this.articleId) {
      this.articlesStore.loadArticle(this.articleId);
    } else {
      this.articlesStore.clearArticle();
    }

    effect(() => {
      const article = this.articlesStore.article();

      if (article) {
        this.articleModel.set(this.createFormValue(article));
      }
    });

    effect(() => {
      const error = this.articlesStore.error();
      const success = this.articlesStore.success();

      if (error) {
        this.snackBar.open(error, 'Close', { duration: 5000 });
        queueMicrotask(() => this.articlesStore.clearMessages());
      }

      if (success) {
        this.snackBar.open(success, 'Close', { duration: 3000 });
        queueMicrotask(() => {
          this.articlesStore.clearMessages();
          this.router.navigateByUrl('/articles');
        });
      }
    });

    effect(() => {
      const error = this.tagsStore.error();

      if (error) {
        this.snackBar.open(error, 'Close', { duration: 5000 });
        queueMicrotask(() => this.tagsStore.clearMessages());
      }
    });

    this.destroyRef.onDestroy(() => this.revokeCoverPreview());
  }

  protected chooseCover(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';

    this.revokeCoverPreview();
    this.coverFile.set(file);

    if (file) {
      this.coverPreviewUrl.set(URL.createObjectURL(file));
    }
  }

  protected save(event: Event): void {
    event.preventDefault();

    if (this.formInvalid()) {
      return;
    }

    submit(this.articleForm, async () => {
      const value = this.articleModel();
      const payload: IArticlePayload = {
        content: value.content.trim(),
        publishedAt: value.publishedAt ? value.publishedAt.toISOString() : null,
        summary: value.summary.trim(),
        tagIds: value.tagIds,
        title: value.title.trim()
      };

      this.articlesStore.saveArticle({
        articleId: this.articleId ?? undefined,
        cover: this.coverFile(),
        payload
      });
    });
  }

  private createFormValue(article: IArticle): IArticleForm {
    return {
      content: article.content ?? '',
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
      summary: article.summary,
      tagIds: article.tags.map((tag) => tag.id),
      title: article.title
    };
  }

  private revokeCoverPreview(): void {
    const previewUrl = this.coverPreviewUrl();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      this.coverPreviewUrl.set(null);
    }
  }
}
