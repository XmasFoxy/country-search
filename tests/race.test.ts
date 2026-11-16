import { afterEach, expect, it, vi } from 'vitest';
import { createSearchController, type SearchState } from '../src/controller.js';
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it('aborts the earlier request during debounce and keeps only the later result', async () => {
  vi.useFakeTimers();
  const requests: {
    signal: AbortSignal;
    resolve: (value: unknown) => void;
    aborted: boolean;
  }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (_url, { signal }: { signal: AbortSignal }) =>
        new Promise((resolve, reject) => {
          const request = { signal, resolve, aborted: false };
          requests.push(request);
          signal.addEventListener(
            'abort',
            () => {
              request.aborted = true;
              reject(signal.reason);
            },
            { once: true },
          );
        }),
    ),
  );
  const states: SearchState[] = [];
  const controller = createSearchController((state) => states.push(state));
  controller.input('sp');
  await vi.advanceTimersByTimeAsync(300);
  controller.input('spain');
  expect(requests[0]?.signal.aborted).toBe(true);
  expect(requests[0]?.aborted).toBe(true);
  await vi.advanceTimersByTimeAsync(300);
  requests[1]?.resolve({ ok: true, json: async () => [{ name: 'Spain' }] });
  await vi.advanceTimersByTimeAsync(0);
  requests[0]?.resolve({
    ok: true,
    json: async () => [{ name: 'Stale country' }],
  });
  await vi.advanceTimersByTimeAsync(0);
  expect(states.at(-1)).toMatchObject({
    status: 'results',
    query: 'spain',
    countries: [{ name: 'Spain' }],
  });
  expect(states.some((state) => state.status === 'error')).toBe(false);
  controller.input('');
  expect(states.at(-1)?.status).toBe('idle');
  controller.dispose();
});
