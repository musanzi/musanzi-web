import { IProjectLink } from '@libs/utils';

export interface IProjectForm {
  name: string;
  summary: string;
  links: IProjectLink[];
}
