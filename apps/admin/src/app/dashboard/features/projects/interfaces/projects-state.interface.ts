import { IProject } from '@libs/utils';

export interface IProjectsState {
  error: string | null;
  isLoading: boolean;
  isSaving: boolean;
  project: IProject | null;
  success: string | null;
}
