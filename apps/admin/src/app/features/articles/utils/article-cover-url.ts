import { environment } from '../../../../environments/environment';

export function getArticleCoverUrl(cover: string | null): string | null {
  if (!cover) return null;

  return `${environment.apiUrl}/uploads/articles/${cover}`;
}
