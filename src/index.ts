import {calculateChecksum, validateChecksum} from './checksum';
import {fromChunks, toChunks} from './chunks';
import {
  Decodings,
  DecodingsWithChecksum,
  Encodings,
  EncodingsWithChecksum,
  IgnorePattern,
} from './symbols';

// module-level singletons — both are stateless so safe to share across calls,
// avoiding repeated allocation on hot paths
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const encode = (
  uint8: Uint8Array,
  checked: boolean = false,
): string => {
  const chunks = toChunks(uint8);

  if (checked) {
    const checkedChunks = [
      ...chunks,
      calculateChecksum(uint8),
    ];
    return checkedChunks.map((chunk) => EncodingsWithChecksum[chunk])
      .join('');
  }

  return chunks.map((chunk) => Encodings[chunk])
    .join('');
};

export const encodeString = (
  str: string,
  checked: boolean = false,
): string => {
  return encode(encoder.encode(str), checked);
};

export const decode = (
  c32: string,
  checked: boolean = false,
): Uint8Array => {
  // user can add hyphens anywhere and they should be ignored
  // use a new const rather than reassigning the parameter — mutating parameters
  // obscures intent and risks bugs if the original value is needed later
  const sanitised = c32.replace(IgnorePattern, '');
  if (checked && sanitised.length === 0) {
    throw new Error('Input must contain at least one checksum symbol');
  }
  if (checked) {
    const chunks = sanitised.split('').map((char) => {
      // findIndex resolves the character to its value index in a single O(n) pass,
      // avoiding the two-pass find + indexOf pattern
      const value = DecodingsWithChecksum.findIndex((decoding) => decoding.includes(char));
      if (value === -1) {
        throw new Error(`${char} is not a valid crock32 (inc. checksum) symbol`);
      }
      return value;
    });
    const check = chunks[chunks.length - 1];
    const data = chunks.slice(0, chunks.length - 1);
    const uint8 = fromChunks(data);
    if (!validateChecksum(uint8, check)) {
      throw new Error('Checksum validation failed');
    }
    return uint8;
  }
  const chunks = sanitised.split('').map((char) => {
    // findIndex resolves the character to its value index in a single O(n) pass,
    // avoiding the two-pass find + indexOf pattern
    const value = Decodings.findIndex((decoding) => decoding.includes(char));
    if (value === -1) {
      throw new Error(`${char} is not a valid crock32 symbol`);
    }
    return value;
  });
  return fromChunks(chunks);
};

export const decodeString = (
  c32: string,
  checked: boolean = false,
): string => {
  return decoder.decode(decode(c32, checked));
};
