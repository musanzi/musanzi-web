export interface IArticlePayload {
  title: string;
  summary: string;
  content: string;
  cover?: string | null;
  published?: boolean;
  publishedAt?: string | null;
  tagIds?: string[];
}
