import { Decodings, Encodings, ignore } from "./symbols";

const toValArray = (uint8: Uint8Array): number[] => {
  //const numBlocks = Math.ceil(uint8.length * 8 / 5);
  const cutOff = uint8.length * 8 % 5;
  if (cutOff) {
    const padded = new Uint8Array(uint8.length+1);
    uint8.forEach((b, idx) => padded[idx] = b);
    padded[padded.length-1] = 0;
    uint8 = padded;
  }

  const vals = [] as number[];
  let rem = 0;
  // for (let i = uint8.length-1; i >= 0; i++) {

  // }
  uint8.forEach((byte, idx) => {
    byte = (byte ) || rem;
    vals.push(byte && 31); //grab the 5 left most bits
    rem = byte << 5;
    if (rem) {

    }
  });
  
  
  // for (let i = 0; i < numBlocks; i++) {
  //   vals.push(uint8[i] << 5); //grab the 5 left most bits
  // }
  // for (const byte of uint8) {
  //   const n = byte % 32;
  // } 
  return vals;
}

export const encode = (uint8: Uint8Array): string => {
  const vals = toValArray(uint8);
  const s = '';
  return vals.map((v) => Encodings[v])
    .reduce((prev, curr) => prev.concat(curr));  
}

const fromValArray = (vals: number[]): Uint8Array => {
  const numBytes = Math.ceil(vals.length * 5 / 8);
  const uint8 = new Uint8Array(numBytes);
  
}

export const decode = (c32: string): Uint8Array => {
  c32 = c32.replace(ignore,''); //user can add as hyphens anywhere and they should be ignored
  const uint8 = new Uint8Array(c32.length);
  const vals = c32.split('').map((c) => {
    const symbols = Decodings.find((d) => d.includes(c));
    if (!symbols) {
      throw new Error(`${c} is not a valid crock32 symbol`);
    }
    return Decodings.indexOf(symbols);
  });
  return fromValArray(vals);
}

export const encodeString = (str: string): string => {
  const enc = new TextEncoder();
  return encode(enc.encode(str));
}

export const decodeString = (c32: string): string => {
  const dec = new TextDecoder();
  return dec.decode(decode(c32));
}