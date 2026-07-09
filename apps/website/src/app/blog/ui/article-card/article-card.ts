import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IArticle } from '@libs/utils';
import { getArticleCoverUrl } from '../../utils/article-cover-url';

@Component({
  selector: 'blog-article-card',
  imports: [DatePipe, DecimalPipe, MatCard, MatCardContent, MatIconModule, RouterLink],
  templateUrl: './article-card.html'
})
export class ArticleCard {
  readonly article = input.required<IArticle>();

  protected readonly coverUrl = computed(() => getArticleCoverUrl(this.article().cover));
}
