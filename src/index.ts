import {addChecksum, validateChecksum} from './checksum';
import {fromChunks, toChunks} from './chunks';
import {
  ChecksumDecodings,
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
    const checkedChunks = addChecksum(chunks);
    return checkedChunks.map((c) => EncodingsWithChecksum[c])
        .reduce((prev, curr) => prev.concat(curr));
  }

  return chunks.map((c) => Encodings[c])
      .reduce((prev, curr) => prev.concat(curr));
};

export const encodeString = (
    str: string,
    checked: boolean = false,
): string => {
  const enc = new TextEncoder();
  return encode(enc.encode(str), checked);
};

export const decode = (c32: string): Uint8Array => {
  // user can add hyphens anywhere and they should be ignored
  c32 = c32.replace(Ignore, '');
  const checked = ChecksumDecodings
      .find((cd) => cd.includes(c32.charAt(c32.length - 1)));
  if (checked) {
    const chunks = c32.split('').map((c) => {
      const symbols = DecodingsWithChecksum.find((d) => d.includes(c));
      if (!symbols) {
        throw new Error(`${c} is not a valid crock32 (inc. checksum) symbol`);
      }
      return Decodings.indexOf(symbols);
    });
    const check = chunks[chunks.length - 1];
    const data = chunks.slice(0, chunks.length - 2);
    if (!validateChecksum(data, check)) {
      throw new Error(`Checksum validation failed`);
    }
    return fromChunks(data);
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
