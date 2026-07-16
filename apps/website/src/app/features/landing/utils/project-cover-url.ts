import { environment } from '../../../../environments/environment';

export function getPorjectCoverUrl(cover: string | null): string | null {
  if (!cover) {
    return null;
  }

  if (/^https?:\/\//i.test(cover)) {
    return cover;
  }

  return `${environment.apiUrl}/uploads/projects/${cover}`;
}
