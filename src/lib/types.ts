export type ActionResult<U, V> = {
  result?: U;
  error?: V;
};

export type LayerType = {
  publicId?: string;
  width?: number;
  height?: number;
  url?: string;
  id?: string;
  name?: string;
  format?: string;
  posterUrl?: string;
  resourceType?: string;
  transcriptionUrl?: string;
};
