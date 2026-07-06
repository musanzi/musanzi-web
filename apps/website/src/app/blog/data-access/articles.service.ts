import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { createParams, IArticle } from '@libs/utils';
import { Observable } from 'rxjs';
import { IPagination } from '../interfaces';

@Service()
export class ArticlesService {
  private readonly http = inject(HttpClient);

  findAll(query: IPagination): Observable<[IArticle[], number]> {
    return this.http.get<[IArticle[], number]>('/articles', { params: createParams(query) });
  }

  findOne(slug: string): Observable<IArticle> {
    return this.http.get<IArticle>(`/articles/${slug}`);
  }
}
