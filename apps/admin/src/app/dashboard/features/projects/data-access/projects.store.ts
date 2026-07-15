import { inject } from '@angular/core';
import { getApiErrorMessage } from '@libs/utils';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, finalize, map, of, pipe, switchMap, tap } from 'rxjs';
import { IDeleteProjectPayload, IProjectsState, ISaveProjectPayload } from '../interfaces';
import { ProjectsService } from './projects.service';

const initialState: IProjectsState = {
  error: null,
  isLoading: false,
  isSaving: false,
  project: null,
  success: null
};

export const ProjectsStore = signalStore(
  withState(initialState),
  withProps(() => ({
    _projectsService: inject(ProjectsService)
  })),
  withMethods(({ _projectsService, ...store }) => ({
    loadProject: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { error: null, isLoading: true, project: null })),
        exhaustMap((projectId) =>
          _projectsService.findOne(projectId).pipe(
            tap((project) => patchState(store, { project })),
            catchError((error: Error) => {
              patchState(store, { error: getApiErrorMessage(error, 'Unable to load the project') });
              return of(null);
            }),
            finalize(() => patchState(store, { isLoading: false }))
          )
        )
      )
    ),
    deleteProject: rxMethod<IDeleteProjectPayload>(
      pipe(
        tap(() => patchState(store, { error: null, success: null })),
        exhaustMap(({ projectId }) =>
          _projectsService.delete(projectId).pipe(
            tap(() => {
              patchState(store, { success: 'Project deleted.' });
            }),
            catchError((error: Error) => {
              patchState(store, { error: getApiErrorMessage(error, 'Unable to delete the project') });
              return of(null);
            })
          )
        )
      )
    ),
    saveProject: rxMethod<ISaveProjectPayload>(
      pipe(
        tap(() => patchState(store, { error: null, isSaving: true, success: null })),
        exhaustMap(({ image, payload, projectId }) => {
          const request = projectId ? _projectsService.update(projectId, payload) : _projectsService.create(payload);

          return request.pipe(
            switchMap((savedProject) => {
              return image
                ? _projectsService.uploadImage(savedProject.id, image).pipe(
                    map((projectWithImage) => ({
                      project: projectWithImage,
                      uploadFailed: false
                    })),
                    catchError((error: Error) => {
                      patchState(store, {
                        error: getApiErrorMessage(
                          error,
                          'Project saved, but the image could not be uploaded. Try replacing the image again.'
                        )
                      });
                      return of({ project: savedProject, uploadFailed: true });
                    })
                  )
                : of({ project: savedProject, uploadFailed: false });
            }),
            tap(({ project, uploadFailed }) => {
              if (projectId) {
                patchState(store, { project, success: uploadFailed ? null : 'Project updated.' });
                return;
              }

              patchState(store, { project, success: uploadFailed ? null : 'Project created.' });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: getApiErrorMessage(
                  error,
                  projectId ? 'Unable to update the project' : 'Unable to create the project'
                )
              });
              return of(null);
            }),
            finalize(() => patchState(store, { isSaving: false }))
          );
        })
      )
    ),
    clearMessages(): void {
      patchState(store, { error: null, success: null });
    },
    clearProject(): void {
      patchState(store, { project: null });
    }
  }))
);
