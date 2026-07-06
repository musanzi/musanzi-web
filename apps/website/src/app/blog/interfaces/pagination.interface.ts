export type ArticleStatusFilter = 'all' | 'draft' | 'published';

export interface IPagination {
  limit?: number | string;
  page?: number | string;
  q?: string;
  status?: ArticleStatusFilter;
  tagId?: string;
  take?: number | string;
}
