# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contribution guidelines

Follow all guidelines in [CONTRIBUTING.md](./CONTRIBUTING.md), except any sections that explicitly exclude agents.

## Commands

```bash
npm run tests       # run all tests
npm run lint        # lint src/ TypeScript
npm run lint:fix    # auto-fix lint issues
npm run build       # compile TypeScript to dist/
```

To run a single test file:
```bash
npx mocha --require ts-node/register test/chunks.test.ts
```

The `prepublishOnly` script runs tests and lint; `prepare` runs the build. Tests use Mocha + Chai; source is compiled to `dist/` (CommonJS, ES2020 target).

## Architecture

This is a TypeScript implementation of [Crockford's Base32](https://www.crockford.com/base32.html) encoding for arbitrary-length binary data.

**Core data flow:** `Uint8Array` → 5-bit chunks → symbol lookup → encoded string (and reverse).

**Source files (`src/`):**
- `chunks.ts` — sliding-window bit manipulation: `toChunks` splits bytes into 5-bit chunks, `fromChunks` reassembles them. Uses bitmask helpers (`getCopyMask`, `copyBits`) and partial-chunk combiners to handle misaligned byte/chunk boundaries.
- `symbols.ts` — the encoding/decoding symbol tables. Encodings map values 0–31 to Crockford's alphabet (no I/L/O/U to avoid confusion). Decodings accept case-insensitive variants and confusable characters (e.g. `'0Oo'` all decode to 0). Checksum symbols (values 32–36) use `* ~ $ = U`. Hyphens are the `Ignore` character (stripped before decoding).
- `checksum.ts` — computes checksum as `bigint(bytes) % 37`, appended as a single extra symbol when `checked=true`.
- `index.ts` — public API: `encode`/`decode` (binary) and `encodeString`/`decodeString` (UTF-8 strings). Both accept an optional `checked` boolean for checksum mode.

**`src/examples/`** contains usage examples (not exported from the package).

**Published output:** only `dist/**/*` is included in the npm package (see `files` in `package.json`). The `main` entry point is `index.js` at the package root, so `dist/` must be built before publishing.
