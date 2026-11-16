import { afterEach, expect, it, vi } from 'vitest';
import { searchCountries, HttpError } from '../src/search.js';
afterEach(() => vi.unstubAllGlobals());
it('encodes the query, forwards cancellation and returns countries', async () => {
  const countries = [{ name: 'Spain' }];
  const fetch = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => countries });
  vi.stubGlobal('fetch', fetch);
  const signal = new AbortController().signal;
  expect(await searchCountries(' south africa ', signal)).toEqual(countries);
  expect(fetch).toHaveBeenCalledWith(
    'https://countries.dev/name/south%20africa',
    { signal },
  );
});
it('returns no matches for 404 without parsing an error body', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
  expect(
    await searchCountries('missing', new AbortController().signal),
  ).toEqual([]);
});
it('throws a typed HTTP error for a server failure', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
  await expect(
    searchCountries('spain', new AbortController().signal),
  ).rejects.toMatchObject({ name: 'HttpError', status: 503 });
  expect(new HttpError(500)).toBeInstanceOf(Error);
});
it('preserves network and cancellation failures', async () => {
  for (const error of [
    new TypeError('Offline'),
    new DOMException('Canceled', 'AbortError'),
  ]) {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
    await expect(
      searchCountries('spain', new AbortController().signal),
    ).rejects.toBe(error);
  }
});
it('does not fetch an empty query', async () => {
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  expect(await searchCountries('  ', new AbortController().signal)).toEqual([]);
  expect(fetch).not.toHaveBeenCalled();
});
