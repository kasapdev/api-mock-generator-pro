# API Mock Generator Pro

[![CI](https://github.com/kasapdev/api-mock-generator-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/kasapdev/api-mock-generator-pro/actions/workflows/ci.yml)

Generate realistic fake JSON records from a type-spec or an inferred example object — mock API responses without standing up a backend.

> A premium, zero-dependency mock-data workbench for backend and frontend developers alike. Write a lightweight type-spec (or paste a real example object and let it infer one), pick a record count, and get pretty-printed, realistic fake JSON — instantly, entirely in your browser, with nothing ever leaving your machine.

## Overview

API Mock Generator Pro is part of the **Web Utility Suite**. It runs entirely in the browser with no build step, no frameworks, and no network calls — open `index.html` from disk and it works. It ships its own small hand-built fake-data engine (names, emails, words, dates, UUIDs, URLs, phone numbers, sentences) so you can stub out API responses, seed a UI with placeholder data, or hand a frontend team a realistic payload before an endpoint exists — all without a live backend.

## Features

- **Two input modes** — write a **type-spec** directly (`{"id":"uuid","name":"string","email":"email"}`), or paste a real **example object** and generate from its inferred shape.
- **Schema inference** — the "Infer schema" button reads a pasted example object and detects each field's type: strings are checked against UUID / email / URL / date / datetime patterns, numbers are split into `number` vs `float`, arrays infer their element type, and nested objects recurse.
- **Rich type vocabulary** — `string`, `number`/`int`/`float`, `boolean`, `email`, `name`/`firstname`/`lastname`, `date`/`datetime`, `uuid`, `url`, `phone`, `city`, `word`/`sentence`/`paragraph`, plus `type[]` for arrays of any of the above and nested objects/arrays-of-objects for deeper shapes.
- **Own fake-data engine** — hand-built banks of first/last names, words, domains and cities; no external faker library, no CDN, no network calls.
- **Configurable record count** (1–500), a one-click **Regenerate** that re-rolls fresh data against the same schema, and pretty-printed 2-space JSON output with syntax highlighting.
- **Copy** and **download `.json`** the generated array.
- **Auto-persist** — your last schema, mode, and record count are saved to `localStorage` and restored on return.
- **Dark & light themes**, fully responsive down to 360px, accessible, and keyboard-driven.

## Installation

No dependencies, no build step.

```bash
git clone https://github.com/kasapdev/api-mock-generator-pro.git
cd api-mock-generator-pro
```

Then simply open `index.html` in any modern browser (double-click it, or `file://` it). That's it.

## Usage

1. Choose **Type-spec** to write the shape yourself, or **Example object** to paste a real sample record.
2. In example mode, click **Infer schema** to auto-detect field types and drop the resulting type-spec into the editor.
3. Set the desired **Records** count and click **Generate** (or press <kbd>Ctrl/⌘</kbd>+<kbd>Enter</kbd>).
4. Click **Regenerate** (<kbd>Ctrl/⌘</kbd>+<kbd>R</kbd>) any time to roll a fresh batch against the same schema.
5. **Copy** the output or **Download** it as a `.json` file (<kbd>Ctrl/⌘</kbd>+<kbd>S</kbd>).

## Keyboard Shortcuts

| Action               | Shortcut                       |
| -------------------- | ------------------------------ |
| Generate records     | <kbd>Ctrl/⌘</kbd> + <kbd>Enter</kbd> |
| Regenerate           | <kbd>Ctrl/⌘</kbd> + <kbd>R</kbd> |
| Download as `.json`  | <kbd>Ctrl/⌘</kbd> + <kbd>S</kbd> |
| Show shortcuts help  | <kbd>?</kbd>                    |
| Close dialog         | <kbd>Esc</kbd>                  |

## Screenshots

> _Screenshots coming soon._

## Roadmap

- [ ] CSV / SQL insert-statement export alongside JSON
- [ ] Custom value ranges and enums per field (e.g. restrict a `status` field to a fixed list)
- [ ] Locale-aware name/word banks
- [ ] Seeded/deterministic generation for reproducible fixtures
- [ ] REST endpoint mode — serve the generated array from a local mock server snippet

## License

MIT Licensed. Part of the [Web Utility Suite](../index.html).
