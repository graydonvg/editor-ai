export type ActionResult<U, V> = {
  result?: U;
  error?: V;
};

export type LayerType = {
  id: string;
  name?: string;
  url?: string;
  format?: string;
  width: number;
  height: number;
  publicId?: string;
  thumbnailUrl?: string;
  resourceType?: string;
  transcriptionUrl?: string;
};
