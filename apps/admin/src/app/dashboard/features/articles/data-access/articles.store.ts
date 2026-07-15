import { inject } from '@angular/core';
import { getApiErrorMessage } from '@libs/utils';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, finalize, map, of, pipe, switchMap, tap } from 'rxjs';
import { IArticlesState, IDeleteArticlePayload, ISaveArticlePayload } from '../interfaces';
import { ArticlesService } from './articles.service';

const initialState: IArticlesState = {
  error: null,
  isLoading: false,
  success: null
};

export const ArticlesStore = signalStore(
  withState(initialState),
  withProps(() => ({
    _articlesService: inject(ArticlesService)
  })),
  withMethods(({ _articlesService, ...store }) => ({
    deleteArticle: rxMethod<IDeleteArticlePayload>(
      pipe(
        tap(() => patchState(store, { error: null, success: null })),
        exhaustMap(({ articleId }) =>
          _articlesService.delete(articleId).pipe(
            tap(() => {
              patchState(store, { success: 'Article deleted.' });
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
        tap(() => patchState(store, { error: null, isLoading: true, success: null })),
        exhaustMap(({ articleId, cover, payload }) => {
          const request = articleId ? _articlesService.update(articleId, payload) : _articlesService.create(payload);
          return request.pipe(
            switchMap((savedArticle) => {
              return cover
                ? _articlesService.uploadCover(savedArticle.id, cover).pipe(
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
            tap(({ uploadFailed }) => {
              if (articleId) {
                patchState(store, { success: uploadFailed ? null : 'Article updated.' });
                return;
              }
              patchState(store, { success: uploadFailed ? null : 'Article created.' });
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
            finalize(() => patchState(store, { isLoading: false }))
          );
        })
      )
    )
  }))
);
