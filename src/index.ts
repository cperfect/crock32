import {calculateChecksum, validateChecksum} from './checksum';
import {fromChunks, toChunks} from './chunks';
import {
  Decodings,
  DecodingsWithChecksum,
  Encodings,
  EncodingsWithChecksum,
  Ignore,
} from './symbols';

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
      .reduce((prev, curr) => prev.concat(curr));
  }

  return chunks.map((chunk) => Encodings[chunk])
    .reduce((prev, curr) => prev.concat(curr));
};

export const encodeString = (
  str: string,
  checked: boolean = false,
): string => {
  const enc = new TextEncoder();
  return encode(enc.encode(str), checked);
};

export const decode = (
  c32: string,
  checked: boolean = false,
): Uint8Array => {
  // user can add hyphens anywhere and they should be ignored
  c32 = c32.replace(Ignore, '');
  if (checked) {
    const chunks = c32.split('').map((char) => {
      const symbols = DecodingsWithChecksum.find((decoding) => decoding.includes(char));
      if (!symbols) {
        throw new Error(`${char} is not a valid crock32 (inc. checksum) symbol`);
      }
      return DecodingsWithChecksum.indexOf(symbols);
    });
    const check = chunks[chunks.length - 1];
    const data = chunks.slice(0, chunks.length - 1);
    const uint8 = fromChunks(data);
    if (!validateChecksum(uint8, check)) {
      throw new Error('Checksum validation failed');
    }
    return uint8;
  }
  const chunks = c32.split('').map((char) => {
    const symbols = Decodings.find((decoding) => decoding.includes(char));
    if (!symbols) {
      throw new Error(`${char} is not a valid crock32 symbol`);
    }
    return Decodings.indexOf(symbols);
  });
  return fromChunks(chunks);
};

export const decodeString = (
  c32: string,
  checked: boolean = false,
): string => {
  const dec = new TextDecoder();
  return dec.decode(decode(c32, checked));
};
