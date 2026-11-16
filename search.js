export class HttpError extends Error {
    status;
    constructor(status) {
        super(`Country service returned HTTP ${status}`);
        this.status = status;
        this.name = 'HttpError';
    }
}
export async function searchCountries(query, signal) {
    const normalized = query.trim();
    if (!normalized)
        return [];
    const response = await fetch(`https://countries.dev/name/${encodeURIComponent(normalized)}`, { signal });
    if (response.status === 404)
        return [];
    if (!response.ok)
        throw new HttpError(response.status);
    const data = await response.json();
    if (!Array.isArray(data))
        throw new TypeError('Invalid country service response');
    return data;
}
