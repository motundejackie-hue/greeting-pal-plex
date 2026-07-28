// Extra channels must ship a working HLS URL — the app is HLS-only.
// (YouTube links are added per-channel by the user and stored separately.)
export type ExtraChannel = {
  id: string;
  name: string;
  country: string;
  categories: string[];
  streamUrl: string;
  logo?: string;
};

export const EXTRA_CHANNELS: ExtraChannel[] = [];
