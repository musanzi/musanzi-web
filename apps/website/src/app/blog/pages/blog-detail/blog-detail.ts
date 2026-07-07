import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticlesStore } from '../../data-access';
import { ArticleContent } from '../../ui/article-content/article-content';
import { getArticleCoverUrl } from '../../utils/article-cover-url';
import { Footer } from '@website/app/landing/ui/footer/footer';

@Component({
  selector: 'blog-detail',
  providers: [ArticlesStore],
  imports: [
    ArticleContent,
    DatePipe,
    DecimalPipe,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
    Footer
  ],
  templateUrl: './blog-detail.html'
})
export class BlogDetail {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  protected readonly articlesStore = inject(ArticlesStore);
  protected readonly coverUrl = computed(() => getArticleCoverUrl(this.articlesStore.article()?.cover ?? null));

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const slug = params.get('slug');

      if (slug) {
        this.articlesStore.loadArticle(slug);
      }
    });
  }
}
