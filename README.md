Typescript Crock32
==================

A typescript library implementing [Dougls Crockfords's Crock32 Encoding Alogrithm](https://www.crockford.com/base32.html) encoding algorithm.

> Base 32 is a textual 32-symbol notation for expressing numbers in a form that can be conveniently and accurately transmitted between humans and computer systems. It can be used for out of band communication of public keys.

**NOTE: crock32 is not an encryption scheme and sensitive data should be encrypted appropriately before being crock32 encoded!**
## Features
* Encode and Decode binary data (Uint8Array) and strings of any length (subject to resource limites).
* Checksum - though this does add significant overhead for large data sets.

## Dependencies
No external dependencies but it does use BigInt so ES2020 is required.

