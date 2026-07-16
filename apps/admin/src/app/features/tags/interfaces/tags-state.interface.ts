import { ITag } from '@libs/utils';

export interface ITagsState {
  data: [ITag[], number];
  error: string | null;
  isLoading: boolean;
  success: string | null;
}
