import { computed, inject } from '@angular/core';
import { getApiErrorMessage } from '@libs/utils';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, finalize, map, of, pipe, switchMap, tap } from 'rxjs';
import { IDeleteProjectPayload, IProjectQuery, IProjectsState, ISaveProjectPayload } from '../interfaces';
import { ProjectsService } from './projects.service';

const initialState: IProjectsState = {
  data: [[], 0],
  error: null,
  isLoading: false,
  isSaving: false,
  project: null,
  success: null
};

export const ProjectsStore = signalStore(
  withState(initialState),
  withComputed(({ data }) => ({
    projects: computed(() => data()[0]),
    total: computed(() => data()[1])
  })),
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
    loadProjects: rxMethod<IProjectQuery>(
      pipe(
        tap(() => patchState(store, { error: null, isLoading: true })),
        exhaustMap((query) =>
          _projectsService.findAll(query).pipe(
            tap((data) => patchState(store, { data })),
            catchError(() => {
              patchState(store, { data: [[], 0] });
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
              const [projects, total] = store.data();
              const nextProjects = projects.filter((project) => project.id !== projectId);

              patchState(store, {
                data: [nextProjects, total - 1],
                success: 'Project deleted.'
              });
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
              const [projects, total] = store.data();

              if (projectId) {
                patchState(store, {
                  data: [projects.map((item) => (item.id === projectId ? project : item)), total],
                  project,
                  success: uploadFailed ? null : 'Project updated.'
                });

                return;
              }

              patchState(store, {
                data: [[project, ...projects], total + 1],
                project,
                success: uploadFailed ? null : 'Project created.'
              });
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
