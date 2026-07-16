import { computed, inject } from '@angular/core';
import { getApiErrorMessage } from '@libs/utils';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, finalize, of, pipe, tap } from 'rxjs';
import { IDeleteRolePayload, IRoleQuery, IRolesState, ISaveRolePayload } from '../interfaces';
import { RolesService } from './roles.service';

const initialState: IRolesState = {
  data: [[], 0],
  error: null,
  isLoading: false,
  success: null
};

export const RolesStore = signalStore(
  withState(initialState),
  withComputed(({ data }) => ({
    roles: computed(() => data()[0]),
    rolesById: computed(() => new Map(data()[0].map((role) => [role.id, role.name]))),
    total: computed(() => data()[1])
  })),
  withProps(() => ({
    rolesService: inject(RolesService)
  })),
  withMethods(({ rolesService, ...store }) => ({
    loadRoles: rxMethod<IRoleQuery>(
      pipe(
        tap(() => patchState(store, { error: null, isLoading: true })),
        exhaustMap((query) =>
          rolesService.findAll(query).pipe(
            tap((data) => patchState(store, { data })),
            catchError((error: Error) => {
              patchState(store, { error: getApiErrorMessage(error) });
              return of(null);
            }),
            finalize(() => patchState(store, { isLoading: false }))
          )
        )
      )
    ),
    deleteRole: rxMethod<IDeleteRolePayload>(
      pipe(
        tap(() => patchState(store, { error: null, success: null })),
        exhaustMap(({ roleId }) =>
          rolesService.delete(roleId).pipe(
            tap(() => {
              const [roles, total] = store.data();
              const nextRoles = roles.filter((role) => role.id !== roleId);

              patchState(store, {
                data: [nextRoles, total - 1],
                success: 'Role deleted.'
              });
            }),
            catchError((error: Error) => {
              patchState(store, { error: getApiErrorMessage(error, 'Unable to delete the role') });
              return of(null);
            })
          )
        )
      )
    ),
    saveRole: rxMethod<ISaveRolePayload>(
      pipe(
        tap(() => patchState(store, { error: null, success: null })),
        exhaustMap(({ payload, roleId }) => {
          const request = roleId ? rolesService.update(roleId, payload) : rolesService.create(payload);
          return request.pipe(
            tap((savedRole) => {
              const [roles, total] = store.data();

              if (roleId) {
                patchState(store, {
                  data: [roles.map((role) => (role.id === roleId ? savedRole : role)), total],
                  success: 'Role updated.'
                });

                return;
              }

              patchState(store, {
                data: [[savedRole, ...roles], total + 1],
                success: 'Role created.'
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: getApiErrorMessage(error, roleId ? 'Unable to update the role' : 'Unable to create the role')
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
