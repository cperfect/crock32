// each index represents a value from 0-31 (inc.)
export const Encodings: readonly string[] = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K',
  'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X',
  'Y', 'Z',
];

export const ChecksumEncodings: readonly string[] = [
  '*', '~', '$', '=', 'U',
];

export const EncodingsWithChecksum: readonly string[] = [
  ...Encodings,
  ...ChecksumEncodings,
];

// each index represents a value from 0-31 (inc.)
export const Decodings: readonly string[] = [
  '0Oo', '1IiLl', '2', '3', '4', '5', '6', '7', '8', '9',
  'Aa', 'Bb', 'Cc', 'Dd', 'Ee', 'Ff', 'Gg', 'Hh', 'Jj', 'Kk',
  'Mm', 'Nn', 'Pp', 'Qq', 'Rr', 'Ss', 'Tt', 'Vv', 'Ww', 'Xx',
  'Yy', 'Zz',
];

export const ChecksumDecodings: readonly string[] = [
  '*', '~', '$', '=', 'Uu',
];

export const DecodingsWithChecksum: readonly string[] = [
  ...Decodings,
  ...ChecksumDecodings,
];

// Ignore all hyphens
export const IgnorePattern = /-/g;
