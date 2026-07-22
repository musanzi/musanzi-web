import { httpResource } from '@angular/common/http';
import { Component, DestroyRef, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { disabled, form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UiTextEditor } from '@libs/ui';
import { IArticle, ITag } from '@libs/utils';
import { ArticlesStore } from '../../data-access';
import { IArticleForm, IArticlePayload } from '../../interfaces';
import { getArticleCoverUrl } from '../../utils';

@Component({
  selector: 'admin-article-form',
  providers: [ArticlesStore],
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
  protected readonly articlesStore = inject(ArticlesStore);

  protected readonly articleId = this.route.snapshot.paramMap.get('id');
  protected readonly coverFile = signal<File | null>(null);
  protected readonly coverPreviewUrl = signal<string | null>(null);

  protected readonly articleResource = httpResource<IArticle>(() =>
    this.articleId ? { url: `/articles/${this.articleId}` } : undefined
  );

  protected readonly articleModel = linkedSignal<IArticleForm>(() => {
    const article = this.articleResource.value();
    return article
      ? this.createFormValue(article)
      : { content: '', publishedAt: null, summary: '', tagIds: [], title: '' };
  });
  protected readonly articleForm = form(this.articleModel, (schema) => {
    disabled(schema.title, { when: () => this.isBusy() });
    required(schema.title, { message: 'Enter an article title.' });
    disabled(schema.summary, { when: () => this.isBusy() });
    required(schema.summary, { message: 'Enter an article summary.' });
    disabled(schema.content, { when: () => this.isBusy() });
    required(schema.content, { message: 'Enter article content.' });
    disabled(schema.publishedAt, { when: () => this.isBusy() });
    disabled(schema.tagIds, { when: () => this.isBusy() });
  });
  protected readonly existingCoverUrl = computed(() => getArticleCoverUrl(this.articleResource.value()?.cover ?? null));
  protected readonly displayCoverUrl = computed(() => this.coverPreviewUrl() ?? this.existingCoverUrl());
  protected readonly formInvalid = computed(() => this.articleForm().invalid());
  protected readonly isBusy = computed(() => this.articlesStore.isLoading() || this.articleResource.isLoading());
  protected readonly isEdit = computed(() => Boolean(this.articleId));

  protected readonly tagsResource = httpResource<[ITag[], number]>(() => '/tags');

  constructor() {
    effect(() => {
      if (this.articlesStore.success()) {
        this.router.navigateByUrl('/articles');
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
        ...value,
        publishedAt: value.publishedAt ? value.publishedAt.toISOString() : null
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
