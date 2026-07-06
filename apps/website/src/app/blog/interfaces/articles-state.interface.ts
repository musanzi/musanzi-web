import { IArticle } from '@libs/utils';

export interface IArticlesState {
  article: IArticle | null;
  data: [IArticle[], number];
  error: string | null;
  isLoading: boolean;
}
