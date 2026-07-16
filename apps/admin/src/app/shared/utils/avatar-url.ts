import { environment } from '../../../environments/environment';

export function getProfileAvatarUrl(avatar: string | null): string | null {
  if (!avatar) {
    return null;
  }

  return avatar.startsWith('https://') ? avatar : `${environment.apiUrl}/uploads/profiles/${avatar}`;
}
