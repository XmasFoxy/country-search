export interface Country {
  id: string;
  name: string;
  flag: string;
  capital: string;
  region: string;
  description: string;
  population: number;
  area: number;
  borders: string[];
  languages: string[];
  currencies: string[];
}
function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
}
function text(value: unknown, fallback = 'Not available'): string {
  return typeof value === 'string' && value ? value : fallback;
}
function items(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
function number(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}
export function mapCountryResponse(raw: unknown): Country {
  const data = record(raw);
  if (typeof data.name !== 'string' || !data.name)
    throw new TypeError('Country name is missing');
  const region = text(data.region);
  const flags = record(data.flags);
  const flag = [flags.svg, flags.png, data.flag].find(
    (value) => typeof value === 'string' && /^https:\/\//.test(value),
  );
  return {
    id: text(data.alpha3Code, data.name),
    name: data.name,
    flag: typeof flag === 'string' ? flag : '',
    capital: text(data.capital),
    region,
    description: `${data.name} is a country in ${text(data.subregion, region)}.`,
    population: number(data.population),
    area: number(data.area),
    borders: items(data.borders).filter(
      (item): item is string => typeof item === 'string',
    ),
    languages: items(data.languages).map((item) => text(record(item).name)),
    currencies: items(data.currencies).map((item) => {
      const currency = record(item);
      return `${text(currency.name)} (${text(currency.code)}) ${text(currency.symbol, '')}`.trim();
    }),
  };
}
