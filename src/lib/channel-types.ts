export type Channel = {
  slug: string;
  name: string;
  country: string | null;
  categories: string[];
  languages: string[];
  streamUrl: string;
  quality: string | null;
  logo: string | null;
  source: string;
};

export type CountryInfo = { code: string; name: string; flag: string; count: number };
export type CategoryInfo = { id: string; name: string; count: number };

export function countryFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}

export function initials(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
