import { IProjectLink } from '@libs/utils';

export interface IProjectPayload {
  name: string;
  summary: string;
  image?: string | null;
  links?: IProjectLink[];
}
