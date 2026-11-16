export class HttpError extends Error {
  constructor(public readonly status: number) {
    super(`Country service returned HTTP ${status}`);
    this.name = 'HttpError';
  }
}
export async function searchCountries(
  query: string,
  signal: AbortSignal,
): Promise<unknown[]> {
  const normalized = query.trim();
  if (!normalized) return [];
  const response = await fetch(
    `https://countries.dev/name/${encodeURIComponent(normalized)}`,
    { signal },
  );
  if (response.status === 404) return [];
  if (!response.ok) throw new HttpError(response.status);
  const data: unknown = await response.json();
  if (!Array.isArray(data))
    throw new TypeError('Invalid country service response');
  return data;
}
