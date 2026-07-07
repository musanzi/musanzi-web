import { ITag } from './tag.interface';

export interface IArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  cover: string | null;
  viewsCount: number;
  publishedAt: string | null;
  tags: ITag[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
