import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { createParams, IRole } from '@libs/utils';
import { Observable } from 'rxjs';
import { IRolePayload, IRoleQuery } from '../interfaces';

@Service()
export class RolesService {
  private readonly http = inject(HttpClient);

  create(dto: IRolePayload): Observable<IRole> {
    return this.http.post<IRole>('/roles', dto);
  }

  delete(roleId: string): Observable<void> {
    return this.http.delete<void>(`/roles/${roleId}`);
  }

  findAll(query: IRoleQuery): Observable<[IRole[], number]> {
    return this.http.get<[IRole[], number]>('/roles', { params: createParams(query) });
  }

  findOne(roleId: string): Observable<IRole> {
    return this.http.get<IRole>(`/roles/${roleId}`);
  }

  update(roleId: string, dto: IRolePayload): Observable<IRole> {
    return this.http.patch<IRole>(`/roles/${roleId}`, dto);
  }
}
