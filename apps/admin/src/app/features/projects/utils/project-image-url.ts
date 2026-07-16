import { environment } from '../../../../environments/environment';

export function getProjectImageUrl(image: string | null): string | null {
  if (!image) return null;

  return `${environment.apiUrl}/uploads/projects/${image}`;
}
