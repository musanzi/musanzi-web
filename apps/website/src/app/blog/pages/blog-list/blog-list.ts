import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DEFAULT_LIMIT, IArticle } from '@libs/utils';
import { ArticlesStore } from '../../data-access';
import { ArticleCard } from '../../ui/article-card/article-card';
import { Footer } from '@website/app/landing/ui/footer/footer';

@Component({
  selector: 'blog-list',
  providers: [ArticlesStore],
  imports: [
    ArticleCard,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    RouterLink,
    Footer
  ],
  templateUrl: './blog-list.html'
})
export class BlogList {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly articlesStore = inject(ArticlesStore);
  protected readonly limit = DEFAULT_LIMIT;
  protected page = 1;

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const page = Number(params.get('page') ?? 1);
      this.page = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

      this.articlesStore.loadArticles({
        limit: this.limit,
        page: this.page,
        status: 'published'
      });
    });
  }

  protected pageChanged(event: PageEvent): void {
    const page = event.pageIndex + 1;

    this.router.navigate([], {
      queryParams: {
        page: page > 1 ? page : null
      },
      queryParamsHandling: 'merge',
      relativeTo: this.route
    });
  }

  protected trackBy(_: number, article: IArticle): string {
    return article.id;
  }
}
