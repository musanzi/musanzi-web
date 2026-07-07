import { computed, inject } from '@angular/core';
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
    _articlesService: inject(ArticlesService)
  })),
  withMethods(({ _articlesService, ...store }) => ({
    clearError(): void {
      patchState(store, { error: null });
    },
    loadArticle: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { article: null, error: null, isLoading: true })),
        exhaustMap((slug) =>
          _articlesService.findOne(slug).pipe(
            tap((article) => patchState(store, { article })),
            catchError(() => {
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
          _articlesService.findAll(query).pipe(
            tap((data) => patchState(store, { data })),
            catchError(() => {
              return of(null);
            }),
            finalize(() => patchState(store, { isLoading: false }))
          )
        )
      )
    )
  }))
);
