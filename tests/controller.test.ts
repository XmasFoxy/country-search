import { afterEach, expect, it, vi } from 'vitest';
import {
  createSearchController,
  classifyError,
  type SearchState,
} from '../src/controller.js';
import { HttpError } from '../src/search.js';
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it('distinguishes user cancellation, timeout, HTTP and network errors', () => {
  expect(classifyError(new DOMException('', 'AbortError'))).toBeNull();
  expect(classifyError(new DOMException('', 'TimeoutError'))).toContain(
    'timed out',
  );
  expect(classifyError(new HttpError(503))).toContain('503');
  expect(classifyError(new TypeError('offline'))).toContain('connection');
});
it('shows no matches for 404 and retries the last input after a failure', async () => {
  vi.useFakeTimers();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 500 })
    .mockResolvedValueOnce({ ok: false, status: 404 });
  vi.stubGlobal('fetch', fetch);
  const states: SearchState[] = [];
  const controller = createSearchController((s) => states.push(s));
  controller.input('spain');
  await vi.advanceTimersByTimeAsync(300);
  expect(states.at(-1)?.status).toBe('error');
  controller.retry();
  await vi.advanceTimersByTimeAsync(0);
  expect(states.at(-1)?.status).toBe('empty');
  expect(fetch.mock.calls[1]?.[0]).toBe('https://countries.dev/name/spain');
  controller.dispose();
});
it('clears input immediately without fetching and cancels debounce', async () => {
  vi.useFakeTimers();
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  const render = vi.fn();
  const controller = createSearchController(render);
  controller.input('spain');
  controller.input('  ');
  await vi.advanceTimersByTimeAsync(1000);
  expect(fetch).not.toHaveBeenCalled();
  expect(render).toHaveBeenLastCalledWith({
    status: 'idle',
    query: '',
    countries: [],
  });
  controller.dispose();
});
it('turns a stalled request into a visible timeout error', async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (_url, { signal }: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) =>
          signal.addEventListener('abort', () => reject(signal.reason)),
        ),
    ),
  );
  const render = vi.fn();
  const controller = createSearchController(render, { timeout: 100 });
  controller.input('spain');
  await vi.advanceTimersByTimeAsync(400);
  expect(render.mock.lastCall?.[0]).toMatchObject({
    status: 'error',
    message: expect.stringContaining('timed out'),
  });
  controller.dispose();
});
