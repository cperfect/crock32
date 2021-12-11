import { addChecksum, validateChecksum } from './checksum';
import {fromChunks, toChunks} from './chunks';
import {ChecksumDecodings, Decodings, Encodings, EncodingsWithChecksum, Ignore} from './symbols';

export const encode = (
    uint8: Uint8Array,
    checksum: boolean = false,
): string => {
  const chunks = toChunks(uint8);

  if (checksum) {
    const checkedChunks = addChecksum(chunks);
    return checkedChunks.map((c) => EncodingsWithChecksum[c])
        .reduce((prev, curr) => prev.concat(curr));
  }

  return chunks.map((c) => Encodings[c])
      .reduce((prev, curr) => prev.concat(curr));
};

export const encodeString = (
    str: string,
    checksum: boolean = false,
): string => {
  const enc = new TextEncoder();
  return encode(enc.encode(str), checksum);
};

export const decode = (c32: string): Uint8Array => {
  // user can add hyphens anywhere and they should be ignored
  c32 = c32.replace(Ignore, '');
  const checked = ChecksumDecodings
      .find((cd) => cd.includes(c32.charAt(c32.length - 1 )));
  if (checked) {
    const chunks = c32.split('').map((c) => {
      const symbols = Decodings.find((d) => d.includes(c));
      if (!symbols) {
        throw new Error(`${c} is not a valid crock32 symbol`);
      }
      return Decodings.indexOf(symbols);
    });
    if (!validateChecksum(chunks))
    return fromChunks(chunks);
  }
  const chunks = c32.split('').map((c) => {
    const symbols = Decodings.find((d) => d.includes(c));
    if (!symbols) {
      throw new Error(`${c} is not a valid crock32 symbol`);
    }
    return Decodings.indexOf(symbols);
  });
  return fromChunks(chunks);
};

export const decodeString = (c32: string): string => {
  const dec = new TextDecoder();
  return dec.decode(decode(c32));
};
