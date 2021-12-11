import {fromChunks, toChunks} from './chunks';
import {Decodings, Encodings, Ignore} from './symbols';

export const encode = (uint8: Uint8Array): string => {
  const chunks = toChunks(uint8);
  // const s = '';
  return chunks.map((c) => Encodings[c])
      .reduce((prev, curr) => prev.concat(curr));
};

export const encodeString = (str: string): string => {
  const enc = new TextEncoder();
  return encode(enc.encode(str));
};

export const decode = (c32: string): Uint8Array => {
  // user can add hyphens anywhere and they should be ignored
  c32 = c32.replace(Ignore, '');
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
