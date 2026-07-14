import { IArticle } from '@libs/utils';

export interface IArticlesState {
  article: IArticle | null;
  error: string | null;
  isLoading: boolean;
  success: string | null;
}
