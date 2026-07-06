import { computed, inject } from '@angular/core';
import { getApiErrorMessage } from '@libs/utils';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, finalize, map, of, pipe, switchMap, tap } from 'rxjs';
import { IArticleQuery, IArticlesState, IDeleteArticlePayload, ISaveArticlePayload } from '../interfaces';
import { ArticlesService } from './articles.service';

const initialState: IArticlesState = {
  article: null,
  data: [[], 0],
  error: null,
  isLoading: false,
  isSaving: false,
  success: null
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
    loadArticle: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { article: null, error: null, isLoading: true })),
        exhaustMap((articleId) =>
          articlesService.findOne(articleId).pipe(
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
    loadArticles: rxMethod<IArticleQuery>(
      pipe(
        tap(() => patchState(store, { error: null, isLoading: true })),
        exhaustMap((query) =>
          articlesService.findAll(query).pipe(
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
    deleteArticle: rxMethod<IDeleteArticlePayload>(
      pipe(
        tap(() => patchState(store, { error: null, success: null })),
        exhaustMap(({ articleId }) =>
          articlesService.delete(articleId).pipe(
            tap(() => {
              const [articles, total] = store.data();
              const nextArticles = articles.filter((article) => article.id !== articleId);

              patchState(store, {
                data: [nextArticles, total - 1],
                success: 'Article deleted.'
              });
            }),
            catchError((error: Error) => {
              patchState(store, { error: getApiErrorMessage(error, 'Unable to delete the article') });
              return of(null);
            })
          )
        )
      )
    ),
    saveArticle: rxMethod<ISaveArticlePayload>(
      pipe(
        tap(() => patchState(store, { error: null, isSaving: true, success: null })),
        exhaustMap(({ articleId, cover, payload }) => {
          const request = articleId ? articlesService.update(articleId, payload) : articlesService.create(payload);

          return request.pipe(
            switchMap((savedArticle) => {
              return cover
                ? articlesService.uploadCover(savedArticle.id, cover).pipe(
                    map((articleWithCover) => ({
                      article: articleWithCover,
                      uploadFailed: false
                    })),
                    catchError((error: Error) => {
                      patchState(store, {
                        error: getApiErrorMessage(
                          error,
                          'Article saved, but the cover could not be uploaded. Try replacing the cover again.'
                        )
                      });
                      return of({ article: savedArticle, uploadFailed: true });
                    })
                  )
                : of({ article: savedArticle, uploadFailed: false });
            }),
            tap(({ article, uploadFailed }) => {
              const [articles, total] = store.data();

              if (articleId) {
                patchState(store, {
                  article,
                  data: [articles.map((item) => (item.id === articleId ? article : item)), total],
                  success: uploadFailed ? null : 'Article updated.'
                });

                return;
              }

              patchState(store, {
                article,
                data: [[article, ...articles], total + 1],
                success: uploadFailed ? null : 'Article created.'
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: getApiErrorMessage(
                  error,
                  articleId ? 'Unable to update the article' : 'Unable to create the article'
                )
              });
              return of(null);
            }),
            finalize(() => patchState(store, { isSaving: false }))
          );
        })
      )
    ),
    clearArticle(): void {
      patchState(store, { article: null });
    },
    clearMessages(): void {
      patchState(store, { error: null, success: null });
    }
  }))
);
