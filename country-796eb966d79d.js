function record(value) {
    return typeof value === 'object' && value !== null
        ? value
        : {};
}
function text(value, fallback = 'Not available') {
    return typeof value === 'string' && value ? value : fallback;
}
function items(value) {
    return Array.isArray(value) ? value : [];
}
function number(value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
        ? value
        : 0;
}
export function mapCountryResponse(raw) {
    const data = record(raw);
    if (typeof data.name !== 'string' || !data.name)
        throw new TypeError('Country name is missing');
    const region = text(data.region);
    const flags = record(data.flags);
    const flag = [flags.svg, flags.png, data.flag].find((value) => typeof value === 'string' && /^https:\/\//.test(value));
    return {
        id: text(data.alpha3Code, data.name),
        name: data.name,
        flag: typeof flag === 'string' ? flag : '',
        capital: text(data.capital),
        region,
        description: `${data.name} is a country in ${text(data.subregion, region)}.`,
        population: number(data.population),
        area: number(data.area),
        borders: items(data.borders).filter((item) => typeof item === 'string'),
        languages: items(data.languages).map((item) => text(record(item).name)),
        currencies: items(data.currencies).map((item) => {
            const currency = record(item);
            return `${text(currency.name)} (${text(currency.code)}) ${text(currency.symbol, '')}`.trim();
        }),
    };
}
