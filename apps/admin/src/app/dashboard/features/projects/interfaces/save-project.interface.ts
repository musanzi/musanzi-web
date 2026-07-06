import { IProjectPayload } from './project-payload.interface';

export interface ISaveProjectPayload {
  payload: IProjectPayload;
  image?: File | null;
  projectId?: string;
}
