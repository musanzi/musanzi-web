import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DEFAULT_LIMIT, IArticle } from '@libs/utils';
import { ArticleCard } from '../../ui/article-card/article-card';
import { Footer } from '@website/app/landing/ui/footer/footer';
import { Loader } from '@libs/ui';
import { httpResource } from '@angular/common/http';

@Component({
  selector: 'blog-list',
  imports: [
    ArticleCard,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    RouterLink,
    Footer,
    Loader
  ],
  templateUrl: './blog-list.html'
})
export class BlogList {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly limit = DEFAULT_LIMIT;
  protected page = signal<number>(Number(this.route.snapshot.paramMap.get('page') ?? 1));

  params = computed(() => ({
    page: this.page(),
    limit: this.limit,
    status: 'published'
  }));

  readonly articlesRessource = httpResource<[IArticle[], number]>(() => ({
    url: '/articles',
    params: this.params()
  }));

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
}
