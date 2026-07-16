import { IRole } from '@libs/utils';

export interface IRolesState {
  data: [IRole[], number];
  error: string | null;
  isLoading: boolean;
  success: string | null;
}
