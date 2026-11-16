import { expect, it } from 'vitest';
import { mapCountryResponse } from '../src/country.js';
it('maps the documented API shape without changing the source', () => {
  const raw = Object.freeze({
    name: 'Spain',
    alpha3Code: 'ESP',
    flag: 'https://countries.dev/flags/es.svg',
    capital: 'Madrid',
    region: 'Europe',
    subregion: 'Southern Europe',
    population: 47351567,
    area: 505992,
    borders: ['FRA', 'PRT'],
    languages: [{ name: 'Spanish' }],
    currencies: [{ name: 'Euro', code: 'EUR', symbol: '€' }],
  });
  expect(mapCountryResponse(raw)).toEqual({
    id: 'ESP',
    name: 'Spain',
    flag: raw.flag,
    capital: 'Madrid',
    region: 'Europe',
    description: 'Spain is a country in Southern Europe.',
    population: 47351567,
    area: 505992,
    borders: ['FRA', 'PRT'],
    languages: ['Spanish'],
    currencies: ['Euro (EUR) €'],
  });
});
it('provides readable defaults for missing optional fields', () => {
  expect(mapCountryResponse({ name: 'Test' })).toMatchObject({
    name: 'Test',
    capital: 'Not available',
    flag: '',
    population: 0,
    area: 0,
    languages: [],
    currencies: [],
    borders: [],
  });
});
it('rejects malformed records and unsafe flag URLs', () => {
  expect(() => mapCountryResponse(null)).toThrow(TypeError);
  expect(() => mapCountryResponse({})).toThrow(TypeError);
  expect(
    mapCountryResponse({ name: 'Test', flag: 'javascript:alert(1)' }).flag,
  ).toBe('');
});
