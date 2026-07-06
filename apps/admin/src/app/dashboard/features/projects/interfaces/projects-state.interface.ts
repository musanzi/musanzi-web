import { IProject } from '@libs/utils';

export interface IProjectsState {
  data: [IProject[], number];
  error: string | null;
  isLoading: boolean;
  isSaving: boolean;
  project: IProject | null;
  success: string | null;
}
