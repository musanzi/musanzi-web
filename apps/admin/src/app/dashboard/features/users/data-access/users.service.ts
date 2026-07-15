import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { IUser } from '@libs/utils';
import { Observable } from 'rxjs';
import { IUserPayload } from '../interfaces';

@Service()
export class UsersService {
  private readonly http = inject(HttpClient);

  delete(userId: string): Observable<void> {
    return this.http.delete<void>(`/users/${userId}`);
  }

  findOneByEmail(email: string): Observable<IUser> {
    return this.http.get<IUser>(`/users/${encodeURIComponent(email)}`);
  }

  update(userId: string, dto: IUserPayload): Observable<IUser> {
    return this.http.patch<IUser>(`/users/${userId}`, dto);
  }
}
