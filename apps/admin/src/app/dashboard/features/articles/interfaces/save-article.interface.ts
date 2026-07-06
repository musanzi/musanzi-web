import { IArticlePayload } from './article-payload.interface';

export interface ISaveArticlePayload {
  cover?: File | null;
  articleId?: string;
  payload: IArticlePayload;
}
