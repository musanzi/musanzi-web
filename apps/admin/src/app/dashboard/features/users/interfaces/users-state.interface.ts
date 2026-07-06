import { IUser } from '@libs/utils';

export interface IUsersState {
  isLoading: boolean;
  success: string | null;
  error: string | null;
  data: [IUser[], number];
}
