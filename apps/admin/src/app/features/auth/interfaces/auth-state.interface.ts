import { IUser } from '@libs/utils';

export interface IAuthState {
  user: IUser | null;
  isVerifying: boolean;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}
