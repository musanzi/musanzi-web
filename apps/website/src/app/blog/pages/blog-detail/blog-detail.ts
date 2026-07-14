import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleContent } from '../../ui/article-content/article-content';
import { getArticleCoverUrl } from '../../utils/article-cover-url';
import { Footer } from '@website/app/landing/ui/footer/footer';
import { Loader } from '@libs/ui';
import { httpResource } from '@angular/common/http';
import { IArticle } from '@libs/utils';

@Component({
  selector: 'blog-detail',
  imports: [ArticleContent, DatePipe, DecimalPipe, MatButtonModule, MatIconModule, RouterLink, Footer, Loader],
  templateUrl: './blog-detail.html'
})
export class BlogDetail {
  private readonly route = inject(ActivatedRoute);

  private readonly slug = signal(this.route.snapshot.paramMap.get('slug'));

  readonly articleResource = httpResource<IArticle>(() => `/articles/${this.slug()}`);

  protected readonly coverUrl = computed(() => {
    if (this.articleResource.hasValue()) {
      return getArticleCoverUrl(this.articleResource.value().cover);
    }
    return null;
  });
}
