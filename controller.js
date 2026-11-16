import { debounce } from './debounce.js';
import { mapCountryResponse } from './country.js';
import { HttpError, searchCountries } from './search.js';
export function classifyError(error) {
    if (error instanceof Error && error.name === 'AbortError')
        return null;
    if (error instanceof Error && error.name === 'TimeoutError')
        return 'The request timed out. Please try again.';
    if (error instanceof HttpError)
        return `The country service is unavailable (HTTP ${error.status}). Please try again.`;
    return 'Unable to connect. Check your connection and try again.';
}
export function createSearchController(render, options = {}) {
    let query = '';
    let active;
    let disposed = false;
    const emit = (state) => {
        if (!disposed)
            render(state);
    };
    const cancel = () => {
        active?.abort();
        active = undefined;
    };
    async function run() {
        if (!query || disposed)
            return;
        const currentQuery = query;
        const controller = new AbortController();
        active = controller;
        const timeoutController = new AbortController();
        const timer = setTimeout(() => timeoutController.abort(new DOMException('Request timed out', 'TimeoutError')), options.timeout ?? 10000);
        const signal = AbortSignal.any([
            controller.signal,
            timeoutController.signal,
        ]);
        emit({ status: 'loading', query: currentQuery, countries: [] });
        try {
            const raw = await searchCountries(currentQuery, signal);
            signal.throwIfAborted();
            const countries = raw.map(mapCountryResponse);
            emit({
                status: countries.length ? 'results' : 'empty',
                query: currentQuery,
                countries,
            });
        }
        catch (error) {
            if (controller.signal.aborted)
                return;
            const message = classifyError(error);
            if (message)
                emit({ status: 'error', query: currentQuery, countries: [], message });
        }
        finally {
            clearTimeout(timer);
            if (active === controller)
                active = undefined;
        }
    }
    const delayed = debounce(() => {
        void run();
    }, options.delay ?? 300);
    return {
        input(value) {
            cancel();
            delayed.cancel();
            query = value.trim();
            emit({ status: query ? 'waiting' : 'idle', query, countries: [] });
            if (query)
                delayed();
        },
        retry() {
            cancel();
            delayed.cancel();
            void run();
        },
        dispose() {
            disposed = true;
            cancel();
            delayed.cancel();
        },
    };
}
