/**
 * Maps each 5-bit value (0–31) to its Crockford Base32 symbol.
 * The alphabet omits I, L, O, and U to avoid visual confusion with
 * 1, 1, 0, and V respectively.
 */
export const Encodings: readonly string[] = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K',
  'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X',
  'Y', 'Z',
];

/** Maps each checksum value (0–4, representing 32–36) to its Crockford checksum symbol. */
export const ChecksumEncodings: readonly string[] = [
  '*', '~', '$', '=', 'U',
];

/** Combined encoding table covering both data symbols (0–31) and checksum symbols (32–36). */
export const EncodingsWithChecksum: readonly string[] = [
  ...Encodings,
  ...ChecksumEncodings,
];

/**
 * Maps each 5-bit value (0–31) to the set of characters that decode to it.
 * Multiple characters per entry handle case-insensitivity and visually
 * confusable glyphs (e.g. `'0Oo'` all decode to 0, `'1IiLl'` all decode to 1).
 */
export const Decodings: readonly string[] = [
  '0Oo', '1IiLl', '2', '3', '4', '5', '6', '7', '8', '9',
  'Aa', 'Bb', 'Cc', 'Dd', 'Ee', 'Ff', 'Gg', 'Hh', 'Jj', 'Kk',
  'Mm', 'Nn', 'Pp', 'Qq', 'Rr', 'Ss', 'Tt', 'Vv', 'Ww', 'Xx',
  'Yy', 'Zz',
];

/** Maps each checksum value (0–4, representing 32–36) to its accepted input characters. */
export const ChecksumDecodings: readonly string[] = [
  '*', '~', '$', '=', 'Uu',
];

/** Combined decoding table covering both data symbols (0–31) and checksum symbols (32–36). */
export const DecodingsWithChecksum: readonly string[] = [
  ...Decodings,
  ...ChecksumDecodings,
];

/** Regex that matches all symbols that are ignored during decoding - e.g. hyphens. */
// Ignore all hyphens
export const IgnorePattern = /-/g;
