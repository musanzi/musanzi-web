import { environment } from '../../../environments/environment';

export function getArticleCoverUrl(cover: string | null): string | null {
  if (!cover) {
    return null;
  }

  if (/^https?:\/\//i.test(cover)) {
    return cover;
  }

  return `${environment.apiUrl}/uploads/articles/${cover}`;
}
