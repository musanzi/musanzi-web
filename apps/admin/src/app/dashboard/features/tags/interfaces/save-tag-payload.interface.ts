import { ITagPayload } from './tag-payload.interface';

export interface ISaveTagPayload {
  payload: ITagPayload;
  tagId?: string;
}
