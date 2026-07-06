import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { createParams, IUser } from '@libs/utils';
import { Observable } from 'rxjs';
import { IUserPayload, IUserQuery } from '../interfaces';

@Service()
export class UsersService {
  private readonly http = inject(HttpClient);

  delete(userId: string): Observable<void> {
    return this.http.delete<void>(`/users/${userId}`);
  }

  findAll(query: IUserQuery): Observable<[IUser[], number]> {
    return this.http.get<[IUser[], number]>('/users', { params: createParams(query) });
  }

  findOneByEmail(email: string): Observable<IUser> {
    return this.http.get<IUser>(`/users/${encodeURIComponent(email)}`);
  }

  update(userId: string, dto: IUserPayload): Observable<IUser> {
    return this.http.patch<IUser>(`/users/${userId}`, dto);
  }
}
