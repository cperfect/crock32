// masks for bitwise copying
export const getCopyMask = (start: number, end: number): string => {
  if (start < 1 || start > 8 || end <= start || end > 8) {
    throw new Error(`Invalid start & end : ${start} & ${end}`);
  }
  let mask = '';
  for (let i = 1; i <= 8; i++) {
    if (i < start) {
      mask = mask.concat('0');
    } else if (start <= i && i <= end) {
      mask = mask.concat('1');
    } else {
      mask = mask.concat('0');
    }
  }
  //return Number.parseInt(mask, 2);
  return mask;
}

const sigBits = (val: number): number => {
  return Math.floor(Math.log(val)/Math.log(2))+1;
}

export const combinePartials = (left: number, right: number): number => {
  const chunk = left + right;
  if (chunk > 0b11111) { 
    throw new Error(`Invalid partials: ${left} + ${right} greater than 31 (0b11111)`);
  }
  return chunk;
}

export const copyBits = (val: number, mask: string): number => {
  const maskNum = Number.parseInt(mask, 2);
  const shift = 8 - (mask.replace(/^0+/, '-').indexOf('0'));
  let bits = val & maskNum;
  return bits >> shift;
}

export const toChunks = (uint8: Uint8Array): number[] => {
  const chunks = [] as number[];
  let startChunk = 1; //1 index on a byte
  let endChunk = 5; 
  uint8.forEach((byte, idx) => {
    if (endChunk < 5) { // we have a partial at the front
      const mask = getCopyMask(startChunk, endChunk);
      chunks[chunks.length-1] = combinePartials(chunks[chunks.length-1], copyBits(byte, mask));
      startChunk = endChunk + 1;
      endChunk = (startChunk + 5) % 8;
    }

    if (startChunk + 5 <= 8) {
      let mask = getCopyMask(startChunk, endChunk);
      chunks.push(copyBits(byte, mask));
      startChunk = endChunk + 1;
      endChunk = (startChunk + 5) < 8 ? (startChunk + 5) : 8;
    }

    if (startChunk < 8) {
      let mask = getCopyMask(startChunk, 8);
      let chunk = copyBits(byte, mask);
      if (idx == uint8.length - 1) {
        //right pad the last chunk with 0 if necessary
        chunk = copyBits(chunk, getCopyMask(0, sigBits(chunk)-1));
      }
      chunks.push(copyBits(byte, mask));
      endChunk = (startChunk + 5) % 8;
      startChunk = 1;
    }
  });
  return chunks;
};

// export const fromChunks = (chunks: number[]): Uint8Array => {

// };
