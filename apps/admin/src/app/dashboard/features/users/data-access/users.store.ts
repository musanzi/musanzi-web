import { computed, inject } from '@angular/core';
import { getApiErrorMessage } from '@libs/utils';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, finalize, map, of, pipe, tap } from 'rxjs';
import { IDeleteUserPayload, IUserPayload, IUserQuery, IUsersState } from '../interfaces';
import { UsersService } from './users.service';

const initialState: IUsersState = {
  error: null,
  isLoading: false,
  success: null,
  data: [[], 0]
};

export const UsersStore = signalStore(
  withState(initialState),
  withComputed(({ data }) => ({
    total: computed(() => data()[1]),
    users: computed(() => data()[0])
  })),
  withProps(() => ({
    usersService: inject(UsersService)
  })),
  withMethods(({ usersService, ...store }) => {
    const loadUsers = rxMethod<IUserQuery>(
      pipe(
        tap(() => patchState(store, { error: null, isLoading: true })),
        exhaustMap((query) =>
          usersService.findAll(query).pipe(
            tap((data) => patchState(store, { data })),
            catchError((error: Error) => {
              patchState(store, { error: getApiErrorMessage(error, 'Unable to load users') });
              return of(null);
            }),
            finalize(() => patchState(store, { isLoading: false }))
          )
        )
      )
    );
    return {
      loadUsers,
      deleteUser: rxMethod<IDeleteUserPayload>(
        pipe(
          tap(() => patchState(store, { error: null, success: null })),
          exhaustMap(({ userId }) =>
            usersService.delete(userId).pipe(
              tap(() => {
                const [users, total] = store.data();
                const nextUsers = users.filter((user) => user.id !== userId);

                patchState(store, {
                  data: [nextUsers, total - 1],
                  success: 'User deleted.'
                });
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
              map((savedUser) => {
                const [users, total] = store.data();

                patchState(store, {
                  data: [users.map((user) => (user.id === userId ? savedUser : user)), total],
                  success: 'User updated.'
                });
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
    };
  })
);
