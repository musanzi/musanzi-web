export interface ITextContentMark {
  attrs?: Record<string, unknown>;
  type?: string;
}

export interface ITextContentNode {
  attrs?: Record<string, unknown>;
  content?: ITextContentNode[];
  marks?: ITextContentMark[];
  text?: string;
  type?: string;
}

export interface ILowlightNode {
  children?: ILowlightNode[];
  properties?: {
    className?: unknown;
  };
  type?: string;
  value?: string;
}
