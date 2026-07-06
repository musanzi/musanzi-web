import { computed, inject } from '@angular/core';
import { getApiErrorMessage } from '@libs/utils';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, finalize, of, pipe, tap } from 'rxjs';
import { IDeleteTagPayload, ISaveTagPayload, ITagQuery, ITagsState } from '../interfaces';
import { TagsService } from './tags.service';

const initialState: ITagsState = {
  data: [[], 0],
  error: null,
  isLoading: false,
  success: null
};

export const TagsStore = signalStore(
  withState(initialState),
  withComputed(({ data }) => ({
    tags: computed(() => data()[0]),
    total: computed(() => data()[1])
  })),
  withProps(() => ({
    _tagsService: inject(TagsService)
  })),
  withMethods(({ _tagsService, ...store }) => ({
    loadTags: rxMethod<ITagQuery>(
      pipe(
        tap(() => patchState(store, { error: null, isLoading: true })),
        exhaustMap((query) =>
          _tagsService.findAll(query).pipe(
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
    deleteTag: rxMethod<IDeleteTagPayload>(
      pipe(
        tap(() => patchState(store, { error: null, success: null })),
        exhaustMap(({ tagId }) =>
          _tagsService.delete(tagId).pipe(
            tap(() => {
              const [tags, total] = store.data();
              const nextTags = tags.filter((tag) => tag.id !== tagId);

              patchState(store, {
                data: [nextTags, total - 1],
                success: 'Tag deleted.'
              });
            }),
            catchError((error: Error) => {
              patchState(store, { error: getApiErrorMessage(error, 'Unable to delete the tag') });
              return of(null);
            })
          )
        )
      )
    ),
    saveTag: rxMethod<ISaveTagPayload>(
      pipe(
        tap(() => patchState(store, { error: null, success: null })),
        exhaustMap(({ payload, tagId }) => {
          const request = tagId ? _tagsService.update(tagId, payload) : _tagsService.create(payload);

          return request.pipe(
            tap((savedTag) => {
              const [tags, total] = store.data();

              if (tagId) {
                patchState(store, {
                  data: [tags.map((tag) => (tag.id === tagId ? savedTag : tag)), total],
                  success: 'Tag updated.'
                });

                return;
              }

              patchState(store, {
                data: [[savedTag, ...tags], total + 1],
                success: 'Tag created.'
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: getApiErrorMessage(error, tagId ? 'Unable to update the tag' : 'Unable to create the tag')
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
