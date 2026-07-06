import { IProjectLink } from './project-link.interface';

export interface IProject {
  id: string;
  name: string;
  summary: string;
  image: string | null;
  links: IProjectLink[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
