export type ActionResult<U, V> = {
  result?: U;
  error?: V;
};

export type LayerType = {
  id: string;
  name?: string;
  url?: string;
  format?: string;
  size: number;
  width: number;
  height: number;
  publicId?: string;
  posterUrl?: string;
  resourceType?: string;
  transcriptionUrl?: string;
};
