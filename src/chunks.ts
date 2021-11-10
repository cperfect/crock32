// masks for bitwise copying
export const getCopyMask = (
    start: number, end: number, bitLength: number,
): string => {
  if (start < 1 || start > bitLength || end <= start || end > bitLength) {
    throw new Error(`Invalid start & end : ${start} & ${end}`);
  }
  let mask = '';
  for (let i = 1; i <= bitLength; i++) {
    if (i < start) {
      mask = mask.concat('0');
    } else if (start <= i && i <= end) {
      mask = mask.concat('1');
    } else {
      mask = mask.concat('0');
    }
  }
  return mask;
};

const sigBits = (val: number): number => {
  return Math.floor(Math.log(val)/Math.log(2))+1;
};

export type PartialChunk = {
  bits: number;
  length: number; // num of bits needed (starting from right/least sig inc.)
}

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

export const byteToChunk = (val: number, mask: string): number => {
  const maskNum = Number.parseInt(mask, 2);
  const trailingZeroIndex = mask.replace(/^0+/, '-')
      .indexOf('0'); // we will get -1 if no trailing zeros
  const shift = trailingZeroIndex !== -1 ? 8 - trailingZeroIndex: 0;
  const bits = val & maskNum;
  return bits >> shift;
};

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
        length: 5 - (endChunk - startChunk),
      });
      chunks.push(chunk);
      startChunk = endChunk + 1;
      endChunk = (startChunk + 5) <= 8 ? (startChunk + 5) : 8;
    }

    if (startChunk + 5 <= 8) {
      const mask = getCopyMask(startChunk, endChunk, 8);
      chunks.push(byteToChunk(byte, mask));
      startChunk = endChunk + 1;
      endChunk = (startChunk + 5) < 8 ? (startChunk + 5) : 8;
    }

    if (startChunk < 8) { // we have a 'left' partial
      const mask = getCopyMask(startChunk, endChunk, 8);
      if (idx == uint8.length - 1) {
        // we are out of bytes so pad this chunk out
        let chunk = byteToChunk(byte, mask);
        chunk = byteToChunk(chunk, getCopyMask(0, sigBits(chunk)-1, 8));
        chunks.push(chunk);
      } else {
        // we expect to find the 'right' partial in the next byte
        partialChunk = {
          bits: byteToChunk(byte, mask),
          length: 5 - (endChunk - startChunk),
        };
      }
      endChunk = (startChunk + 5) % 8;
      startChunk = 1;
    }
  });
  return chunks;
};

// export const fromChunks = (chunks: number[]): Uint8Array => {

// };
