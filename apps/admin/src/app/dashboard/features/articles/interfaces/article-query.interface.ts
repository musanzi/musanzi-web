export type ArticleStatus = 'all' | 'draft' | 'published';

export interface IArticleQuery {
  limit?: number | string;
  page?: number | string;
  q?: string;
  status?: ArticleStatus;
  tagId?: string;
  take?: number | string;
}
