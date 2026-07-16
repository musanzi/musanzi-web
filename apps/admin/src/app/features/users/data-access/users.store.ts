import { inject } from '@angular/core';
import { getApiErrorMessage } from '@libs/utils';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, of, pipe, tap } from 'rxjs';
import { IDeleteUserPayload, IUserPayload, IUsersState } from '../interfaces';
import { UsersService } from './users.service';

const initialState: IUsersState = {
  error: null,
  success: null
};

export const UsersStore = signalStore(
  withState(initialState),
  withProps(() => ({
    usersService: inject(UsersService)
  })),
  withMethods(({ usersService, ...store }) => ({
    deleteUser: rxMethod<IDeleteUserPayload>(
      pipe(
        tap(() => patchState(store, { error: null, success: null })),
        exhaustMap(({ userId }) =>
          usersService.delete(userId).pipe(
            tap(() => {
              patchState(store, { success: 'User deleted.' });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: getApiErrorMessage(error, 'Unable to delete the user')
              });
              return of(null);
            })
          )
        )
      )
    ),
    updatedUser: rxMethod<{ userId: string; payload: IUserPayload }>(
      pipe(
        tap(() => patchState(store, { error: null, success: null })),
        exhaustMap(({ userId, payload }) => {
          return usersService.update(userId, payload).pipe(
            tap(() => {
              patchState(store, { success: 'User updated.' });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: getApiErrorMessage(error)
              });
              return of(null);
            })
          );
        })
      )
    ),
    clearMessages(): void {
      patchState(store, { error: null, success: null });
    }
  }))
);
