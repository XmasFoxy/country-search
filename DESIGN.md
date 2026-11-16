# Country Search design

## Cancellation and state

`src/controller.ts` owns requests independently of the DOM. Every input event
aborts the active `AbortController` immediately and cancels the previous debounce
timer, including when the input is cleared. Waiting for debounce before aborting
would leave a 300 ms window in which an old response could render below new text.
The implementation cancels network work rather than relying on an index or flag
to hide a race after it has happened. `signal.throwIfAborted()` also guards the
post-fetch mapping stage when cancellation occurs while a response is being read.

A separate timeout controller aborts with a `TimeoutError` after 10 seconds.
`AbortSignal.any` combines this with the input controller. The timer is cleared in
`finally`. User cancellation is silent; timeout, HTTP and network failures show
distinct useful messages and a retry button. The controller retains the latest
trimmed input, so retry always uses that query. Disposal aborts work and prevents
further rendering.

`searchCountries` checks `response.ok`: 404 returns an empty array; other failed
statuses throw `HttpError` with the status. Network failures retain their original
error identity. Empty input performs no network work.

## Debounce

300 ms is long enough to group normal bursts of typing while keeping search
responsive. Removing the delay would send a request on every keystroke, increasing
network traffic and unnecessary cancellations. A much longer delay would make the
interface feel unresponsive. Suggestions and explicit form submission can start
search without waiting for the timer. The cancelable debounce is handwritten.

## Complexity

`mapCountryResponse` is pure and does not mutate the source. For one country it
takes O(B + L + C) time and output space, where B is the number of borders, L the
number of languages and C the number of currencies (or total string lengths if
string copying is counted). Other fields require constant work. Mapping N
countries adds the work across their records. Caching and shared-request
deduplication are not included; each controller owns its own request.

## Clean code and boundaries

- `src/debounce.ts`: one reusable concern, typed arguments, explicit cancellation.
- `src/search.ts`: transport and HTTP semantics without DOM dependencies.
- `src/country.ts`: pure normalization of unknown external data into a typed model;
  optional data has readable defaults and flag URLs require HTTPS.
- `src/controller.ts`: request lifecycle and state transitions in one place;
  `classifyError` handles error presentation independently from transport.
- `src/main.ts`: DOM-only view, reusable element and facts builders, native dialog,
  keyboard accessible buttons, associated search label and live status updates.
  Dynamic text uses `textContent`; no HTML string injection is used.

## Verification and commit history

Vitest runs isolated tests with fake timers and mocked fetch, with no real network.
The four required units each have a red test commit before their green
implementation commit. `tests/race.test.ts` is a separate later commit: its mock
rejects with the signal reason immediately on abort, the later response resolves
first, and an attempted late completion of the earlier request cannot replace it.
The assertion checks that the earlier signal is already aborted before the next
debounce delay elapses. `tests/controller.test.ts` covers timeout, 404, retry and
empty input. Husky pre-commit runs only lint-staged; pre-push runs the test suite.

The main branch retains only the initial README. The solution lives on
`country-search`; its pull request must remain unmerged. The repository is public
at the owner's explicit request so GitHub Pages can serve the assignment.
