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
export const combinePartialChunks = (
    left: PartialChunk,
    right: PartialChunk,
): number => {
  if (left.length + right.length != 5) {
    // eslint-disable-next-line max-len
    throw new Error(`Combined length of partial chunks must be 5: (${left.length} + ${right.length} != 5)`);
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

// copy an array of bytes into an array of 5 bit chunks (2^5 = 32)
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
      const chunk = combinePartialChunks(partialChunk, {
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
      // if we are on the last byte
      if (idx == uint8.length - 1) {
        // right pad any left over space in last chunk
        const padding = {
          bits: 0,
          length: 5 - partialChunk.length,
        };
        const chunk = combinePartialChunks(partialChunk, padding);
        chunks.push(chunk);
      } else {
        endChunk = getEndChunk(startChunk-1, true);
        startChunk = 1;
      }
    }
  });
  return chunks;
};

const partialBytesLength = (
    partials: PartialChunk[],
): number => {
  return partials.length ?
    partials
        .map((p) => p.length)
        .reduce((prev, curr) => prev + curr) :
    0;
};

// combine two or three partial bytes into a complete byte
export const combinePartialBytes = (
    partials: PartialChunk[],
): number => {
  const length = partialBytesLength(partials);
  if (length > 8) {
    // eslint-disable-next-line max-len
    throw new Error(`Combined length of partial bytes must be 8 bits or less: was ${length})`);
  } else if (length < 8) {
    // pad with 0
    partials = [...partials, {
      bits: 0,
      length: 8 - length,
    }];
  }
  return partials.reduce((left, right) => {
    return {
      bits: (left.bits << right.length) + right.bits,
      length: left.length + right.length,
    };
  }).bits;
};

const getEndByte = (
    start: number,
    partialBits: number,
): number => {
  const toEndOfByte = 8 - partialBits;
  if (toEndOfByte >= 5) {
    return 5;
  } else {
    return start + (toEndOfByte - 1);
  }
};

// copy an array of 5 bit chunks into an array of bytes
export const fromChunks = (chunks: number[]): Uint8Array => {
  const bytes = [] as number[];
  let startByte = 1; // 1 index on a chunk
  let endByte = 5;
  let partialBytes = [] as PartialChunk[];

  const mayfinishByte = () => {
    if (partialBytesLength(partialBytes) === 8) {
      bytes.push(combinePartialBytes(partialBytes));
      partialBytes = [] as PartialChunk[];
    }
  };

  chunks.forEach((chunk, idx) => {
    if (startByte === 1 && endByte < 5) {
      // we need less than the full chunk
      const mask = getCopyMask(startByte, endByte, 5);
      partialBytes.push({
        bits: byteToChunk(chunk, mask),
        length: (endByte - startByte)+1,
      });
      mayfinishByte();
      startByte = endByte + 1;
      endByte = getEndByte(startByte, partialBytesLength(partialBytes));
    } else if (startByte > 1 && endByte < 5) {
      // we need a inner segment of the chunk
      const mask = getCopyMask(startByte, endByte, 5);
      partialBytes.push({
        bits: byteToChunk(chunk, mask),
        length: (endByte - startByte)+1,
      });
      mayfinishByte();
      startByte = endByte+1;
      endByte = getEndByte(startByte, partialBytesLength(partialBytes));
    }

    if (startByte === 1 && endByte === 5) {
      // we need the entire chunk
      const mask = getCopyMask(startByte, endByte, 5);
      partialBytes.push({
        bits: byteToChunk(chunk, mask),
        length: (endByte - startByte)+1,
      });
      mayfinishByte();
      startByte = 1;
      endByte = getEndByte(startByte, partialBytesLength(partialBytes));
    } else if (startByte > 1 && endByte === 5) {
      if (idx !== chunks.length - 1 || partialBytes.length) {
        // we need the rest of the chunk
        const mask = getCopyMask(startByte, endByte, 5);
        partialBytes.push({
          bits: byteToChunk(chunk, mask),
          length: (endByte - startByte)+1,
        });
        mayfinishByte();
        startByte = 1;
        endByte = getEndByte(startByte, partialBytesLength(partialBytes));
      } // otherwise this is just padding
      // TODO should we be checking that the rest of the chunk is zeros?
    }
  });
  if (partialBytes.length) {
    // if we have left over partials then combine them into a byte
    bytes.push(combinePartialBytes(partialBytes));
  }
  return Uint8Array.from(bytes);
};
