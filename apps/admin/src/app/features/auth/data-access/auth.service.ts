import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { IUser } from '@libs/utils';
import { Observable } from 'rxjs';
import {
  IForgotPasswordPayload,
  IResetPasswordPayload,
  ISignInPayload,
  IUpdatePasswordPayload,
  IUpdateProfilePayload
} from '../interfaces';

@Service()
export class AuthService {
  private http = inject(HttpClient);

  signIn(dto: ISignInPayload): Observable<IUser> {
    return this.http.post<IUser>('/auth/signin', dto);
  }

  signOut(): Observable<void> {
    return this.http.post<void>('/auth/signout', {});
  }

  forgotPassword(dto: IForgotPasswordPayload): Observable<void> {
    return this.http.post<void>('/auth/password/forgot', dto);
  }

  resetPassword(dto: IResetPasswordPayload): Observable<void> {
    return this.http.post<void>('/auth/password/reset', dto);
  }

  updateProfile(dto: IUpdateProfilePayload): Observable<IUser> {
    return this.http.patch<IUser>('/auth/me/update', dto);
  }

  updateAvatar(file: File): Observable<IUser> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<IUser>('/users/profile/avatar', formData);
  }

  updatePassword(dto: IUpdatePasswordPayload): Observable<void> {
    return this.http.patch<void>('/auth/password/update', dto);
  }

  getProfile(): Observable<IUser> {
    return this.http.get<IUser>('/auth/me');
  }
}
