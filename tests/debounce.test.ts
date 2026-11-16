import { afterEach, expect, it, vi } from 'vitest';
import { debounce } from '../src/debounce.js';

afterEach(() => vi.useRealTimers());
it('delays execution and resets the timer with the latest arguments', () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const delayed = debounce(fn, 300);
  delayed('s');
  vi.advanceTimersByTime(200);
  delayed('spain');
  vi.advanceTimersByTime(299);
  expect(fn).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(fn).toHaveBeenCalledExactlyOnceWith('spain');
});
it('can cancel pending work', () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const delayed = debounce(fn, 300);
  delayed();
  delayed.cancel();
  vi.runAllTimers();
  expect(fn).not.toHaveBeenCalled();
});
