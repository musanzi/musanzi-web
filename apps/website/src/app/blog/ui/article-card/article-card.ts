import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IArticle } from '@libs/utils';
import { getArticleCoverUrl } from '../../utils/article-cover-url';

@Component({
  selector: 'blog-article-card',
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatCard, MatCardContent, MatChipsModule, MatIconModule, RouterLink],
  templateUrl: './article-card.html'
})
export class ArticleCard {
  readonly article = input.required<IArticle>();

  protected readonly coverUrl = computed(() => getArticleCoverUrl(this.article().cover));
  protected readonly displayedTags = computed(() => this.article().tags.slice(0, 3));
  protected readonly hiddenTagsCount = computed(() =>
    Math.max(this.article().tags.length - this.displayedTags().length, 0)
  );
}
