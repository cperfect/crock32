// masks for bitwise copying
export type CopyMask = {
  bits: number;
  leftShift: number;
}

export const getCopyMask = (
    start: number, end: number, bitLength: number,
): CopyMask => {
  if (start < 1 || start > bitLength || end < start || end > bitLength) {
    throw new Error(`Invalid start & end : ${start} & ${end}`);
  }
  let leftShift = 0;
  let mask = '';
  for (let i = 1; i <= bitLength; i++) {
    if (i < start) {
      mask = mask.concat('0');
    } else if (start <= i && i <= end) {
      mask = mask.concat('1');
    } else {
      leftShift = leftShift + 1;
      mask = mask.concat('0');
    }
  }
  return {
    bits: Number.parseInt(mask, 2),
    leftShift,
  };
};

// less than 5 bits of data
export type PartialChunk = {
  bits: number;
  length: number; // num of bits needed (starting from right/least sig inc.)
}

// combine two partial chunks into a complete chunk
export const combinePartials = (
    left: PartialChunk,
    right: PartialChunk,
): number => {
  if (left.length + right.length != 5) {
    // eslint-disable-next-line max-len
    throw new Error(`Combined length of partial chunks must be 5 (${left.length} + ${right.length} != 5)`);
  }
  return (left.bits << right.length) + right.bits;
};

// extrack a chunk from a byte based on a mask
export const byteToChunk = (val: number, mask: CopyMask): number => {
  const bits = val & mask.bits;
  return bits >> mask.leftShift;
};

// get the next chunk end boundary
// from a starting position
const getEndChunk = (
    start: number,
    acrossByte?: boolean, // true if there will be byte boundary in between
): number => {
  if (acrossByte) {
    return start + 5 <= 8 ? start + 5 : (start + 5) % 8;
  }
  return start + 5 <= 8 ? start + 5 : 8;
};

// split array of bytes into 5 bit chunks (2^5 = 32)
export const toChunks = (uint8: Uint8Array): number[] => {
  const chunks = [] as number[];
  let startChunk = 1; // 1 index on a byte
  let endChunk = 5;
  let partialChunk: PartialChunk | null = null;
  uint8.forEach((byte, idx) => {
    if (endChunk < 5) { // we have a 'right' partial at the front
      const mask = getCopyMask(startChunk, endChunk, 8);
      if (!partialChunk) {
        // eslint-disable-next-line max-len
        throw new Error(`Found right partial without left partial in byte ${idx}`);
      }
      const chunk = combinePartials(partialChunk, {
        bits: byteToChunk(byte, mask),
        length: (endChunk - startChunk)+1,
      });
      chunks.push(chunk);
      startChunk = endChunk + 1;
      endChunk = getEndChunk(endChunk);
    }

    if (startChunk + 5 <= 8) { // we have entire chunk
      const mask = getCopyMask(startChunk, endChunk, 8);
      chunks.push(byteToChunk(byte, mask));
      startChunk = endChunk + 1;
      endChunk = getEndChunk(endChunk);
    }

    if (startChunk <= 8) { // we have a 'left' partial
      const mask = getCopyMask(startChunk, endChunk, 8);
      partialChunk = {
        bits: byteToChunk(byte, mask),
        length: (endChunk - startChunk)+1,
      };
      if (idx == uint8.length - 1) {
        const padding = {
          bits: 0,
          length: 5 - partialChunk.length,
        };
        const chunk = combinePartials(partialChunk, padding);
        chunks.push(chunk);
      } else {
        endChunk = getEndChunk(startChunk-1, true);
        startChunk = 1;
      }
    }
  });
  return chunks;
};

// export const fromChunks = (chunks: number[]): Uint8Array => {

// };
