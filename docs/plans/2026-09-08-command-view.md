# Command view

Build the approved status board with response excerpts and a side preview.

- [x] Add a read-only server snapshot for recent root threads. Read saved assistant text with bounded file reads; never open or wake a terminal.
- [x] Add Command navigation and a responsive board with project/search/time filters, status labels, empty/error states, and an optional response pane.
- [x] Test response parsing, status precedence, recency, filtering, and no-wake behavior. Build the web and server bundles and verify the dev view.

Keep existing thread routes and manual titles. Use actual response text, not generated summaries. Unknown inactive sessions must not be labeled asleep. Limit the snapshot to 100 recent threads and bound response/cache sizes. Do not run fmt, lint, or typecheck without a user request.

Validation: response/status/limit tests (12), Codex metadata tests (6), board filter tests (4), browser tests (3), and the read-only WebSocket test pass. Web, contracts, and server builds pass. The live dev snapshot returns 11 threads. The existing shell fallback test fails with this machine’s /usr/bin/zsh path and passes with SHELL=/bin/zsh. Full fmt, lint, and typecheck remain pending under the project instruction.
