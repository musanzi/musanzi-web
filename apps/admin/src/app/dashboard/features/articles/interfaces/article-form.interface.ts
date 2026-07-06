export interface IArticleForm {
  title: string;
  summary: string;
  content: string;
  publishedAt: Date | null;
  tagIds: string[];
}
