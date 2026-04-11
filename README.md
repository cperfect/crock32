Typescript Crock32
==================
A typescript library implementing [Dougls Crockfords's Crock32 Encoding Alogrithm](https://www.crockford.com/base32.html) encoding algorithm.

> Base 32 is a textual 32-symbol notation for expressing numbers in a form that can be conveniently and accurately transmitted between humans and computer systems. It can be used for out of band communication of public keys.

This package can be used to encode data of arbitrary length. This is a bit of overkill for most crock32 use cases but it gives me an excuse to play with sliding window algorithms.

**NOTE: crock32 is not an encryption scheme and sensitive data should be encrypted appropriately before being crock32 encoded!**

## Features
* Encode and Decode binary data (Uint8Array) and strings of any length (subject to resource limites).
* Checksum - though this does add significant overhead for large data sets.
* No external dependencies

## Usage

### Encoding and decoding

```typescript
import { encode, decode, encodeString, decodeString } from 'crock32';

// Binary data
const encoded = encode(Uint8Array.from([0x62, 0x61, 0x73, 0x65])); // 'C9GQ6S8'
const decoded = decode('C9GQ6S8'); // Uint8Array

// Strings
const encodedStr = encodeString('hello'); // crock32 string
const decodedStr = decodeString(encodedStr); // 'hello'

// With checksum validation
const withChecksum = encode(Uint8Array.from([0x62, 0x61, 0x73, 0x65]), true); // 'C9GQ6S8J'
decode('C9GQ6S8J', true); // validates checksum, throws if corrupt
```

### Human-readable IDs

Encoding random bytes produces URL-safe, case-insensitive IDs. For a fixed character length, choose a byte length where `bytes × 8` is divisible by 5 (e.g. 5 bytes → 8 characters, 10 bytes → 16 characters):

```typescript
import { encode } from 'crock32';
import { randomBytes } from 'crypto';

// 5 bytes produces exactly 8 characters
const id = encode(randomBytes(5)); // e.g. 'X7KQ2M4P'
```

Hyphens are ignored during decoding, so IDs can be formatted for readability:

```typescript
decodeString('X7KQ-2M4P'); // same as decoding 'X7KQ2M4P'
```

## API

All functions are named exports from the package root.

### `encode(uint8: Uint8Array, checked?: boolean): string`

Encodes a byte array as a Crockford Base32 string. If `checked` is `true`, a checksum symbol is appended to the output.

### `encodeString(str: string, checked?: boolean): string`

Encodes a UTF-8 string as a Crockford Base32 string. Equivalent to `encode(new TextEncoder().encode(str), checked)`.

### `decode(c32: string, checked?: boolean): Uint8Array`

Decodes a Crockford Base32 string to a byte array. Hyphens are silently stripped and may appear anywhere in the input as separators. Input is case-insensitive; visually confusable characters are accepted (`O`/`o` → 0, `I`/`i`/`L`/`l` → 1). If `checked` is `true`, the final symbol is treated as a checksum and validated before returning.

Throws if any symbol is invalid or, when `checked=true`, if the checksum does not match.

### `decodeString(c32: string, checked?: boolean): string`

Decodes a Crockford Base32 string to a UTF-8 string. Equivalent to `new TextDecoder().decode(decode(c32, checked))`.

## Implementation

### Encoding algorithm

Crockford Base32 encodes 5 bits per symbol. Since bytes are 8 bits and 5 does not divide 8 evenly, encoding arbitrary binary data requires re-slicing the raw bit stream. Every 5 bytes of input produces exactly 8 symbols (LCM(8, 5) = 40 bits), so the output is always `⌈(bytes × 8) / 5⌉` symbols long.

A sliding window advances 5 bits at a time across the input. When a window boundary falls mid-byte it produces a left partial (bits from the current byte, carried forward) and a right partial (bits from the start of the next byte). The two halves are merged to form a complete 5-bit chunk. If the total bit count is not a multiple of 5, the final chunk is zero-padded on the right.

### Symbol alphabet

The encoding alphabet omits `I`, `L`, `O`, and `U` to avoid visual confusion with `1`, `1`, `0`, and `V` respectively. The decoding tables accept case-insensitive input and map confusable glyphs to their canonical values (`O`/`o` → 0, `I`/`i`/`L`/`l` → 1), so encoded strings are robust to manual transcription errors.

### Checksum

When `checked=true`, a single checksum symbol is appended. The checksum is computed as `toBigInt(bytes) % 37`, where 37 is prime and larger than the 32 data symbols plus 5 checksum-only symbols, guaranteeing a unique check value for every possible remainder. BigInt is used because the input can be arbitrarily long. The 5 checksum symbols (`* ~ $ = U`) are distinct from the data alphabet.

