Typescript Crock32
==================
> Base 32 is a textual 32-symbol notation for expressing numbers in a form that can be conveniently and accurately transmitted between humans and computer systems. It can be used for out of band communication of public keys.

A typescript library implementing [Dougls Crockfords's Crock32 Encoding Alogrithm](https://www.crockford.com/base32.html) encoding algorithm.

This package can be used to encode data of arbitrary length. This is a bit of overkill for most crock32 use cases but it gives me an excuse to play with sliding window algorithms.

**NOTE: crock32 is not an encryption scheme and sensitive data should be encrypted appropriately before being crock32 encoded!**

## Features
* Encode and Decode binary data (Uint8Array) and strings of any length (subject to resource limites).
* Checksum - though this does add significant overhead for large data sets.

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

## Dependencies
No external dependencies but it does use BigInt so ES2020 is required.

