import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { createParams, ITag } from '@libs/utils';
import { Observable } from 'rxjs';
import { ITagPayload, ITagQuery } from '../interfaces';

@Service()
export class TagsService {
  private readonly http = inject(HttpClient);

  create(dto: ITagPayload): Observable<ITag> {
    return this.http.post<ITag>('/tags', dto);
  }

  delete(tagId: string): Observable<void> {
    return this.http.delete<void>(`/tags/${tagId}`);
  }

  findAll(query: ITagQuery): Observable<[ITag[], number]> {
    return this.http.get<[ITag[], number]>('/tags', { params: createParams(query) });
  }

  findOne(tagId: string): Observable<ITag> {
    return this.http.get<ITag>(`/tags/${tagId}`);
  }

  update(tagId: string, dto: ITagPayload): Observable<ITag> {
    return this.http.patch<ITag>(`/tags/${tagId}`, dto);
  }
}
