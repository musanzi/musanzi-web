import { computed, inject } from '@angular/core';
import { getApiErrorMessage } from '@libs/utils';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, finalize, of, pipe, tap } from 'rxjs';
import { IArticlesState, IPagination } from '../interfaces';
import { ArticlesService } from './articles.service';

const initialState: IArticlesState = {
  article: null,
  data: [[], 0],
  error: null,
  isLoading: false
};

export const ArticlesStore = signalStore(
  withState(initialState),
  withComputed(({ data }) => ({
    articles: computed(() => data()[0]),
    total: computed(() => data()[1])
  })),
  withProps(() => ({
    articlesService: inject(ArticlesService)
  })),
  withMethods(({ articlesService, ...store }) => ({
    clearError(): void {
      patchState(store, { error: null });
    },
    loadArticle: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { article: null, error: null, isLoading: true })),
        exhaustMap((slug) =>
          articlesService.findOne(slug).pipe(
            tap((article) => patchState(store, { article })),
            catchError((error: Error) => {
              patchState(store, { error: getApiErrorMessage(error, 'Unable to load the article') });
              return of(null);
            }),
            finalize(() => patchState(store, { isLoading: false }))
          )
        )
      )
    ),
    loadArticles: rxMethod<IPagination>(
      pipe(
        tap(() => patchState(store, { error: null, isLoading: true })),
        exhaustMap((query) =>
          articlesService.findAll(query).pipe(
            tap((data) => patchState(store, { data })),
            catchError((error: Error) => {
              patchState(store, {
                data: [[], 0],
                error: getApiErrorMessage(error, 'Unable to load articles')
              });
              return of(null);
            }),
            finalize(() => patchState(store, { isLoading: false }))
          )
        )
      )
    )
  }))
);
