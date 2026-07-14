import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { IArticle } from '@libs/utils';
import { Observable } from 'rxjs';
import { IArticlePayload } from '../interfaces';

@Service()
export class ArticlesService {
  private readonly http = inject(HttpClient);

  create(dto: IArticlePayload): Observable<IArticle> {
    return this.http.post<IArticle>('/articles', dto);
  }

  delete(articleId: string): Observable<void> {
    return this.http.delete<void>(`/articles/${articleId}`);
  }

  findOne(articleId: string): Observable<IArticle> {
    return this.http.get<IArticle>(`/articles/admin/${articleId}`);
  }

  update(articleId: string, dto: IArticlePayload): Observable<IArticle> {
    return this.http.patch<IArticle>(`/articles/${articleId}`, dto);
  }

  uploadCover(articleId: string, cover: File): Observable<IArticle> {
    const formData = new FormData();
    formData.append('cover', cover);

    return this.http.post<IArticle>(`/articles/${articleId}/cover`, formData);
  }
}
