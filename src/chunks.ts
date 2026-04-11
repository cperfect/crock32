// Bit positions throughout this file are 1-indexed from the most significant bit
// (position 1 = MSB, position N = LSB). This matches the left-to-right visual
// representation of binary numbers and makes the mask construction loop in
// getCopyMask read naturally as a scan from left to right across the bits.

/** A bitmask used to extract a contiguous range of bits from a value. */
export type CopyMask = {
  /** The bitmask, with 1s in the positions to copy. */
  bits: number;
  /** The number of positions to right-shift after applying the mask to align the result to LSB. */
  leftShift: number;
}

/**
 * Builds a {@link CopyMask} for extracting bits `start` through `end` (inclusive, 1-indexed from MSB)
 * from a value of `bitLength` bits.
 * @param start - First bit to include (1 = MSB).
 * @param end - Last bit to include (inclusive).
 * @param bitLength - Total number of bits in the source value.
 * @throws {Error} If `start` or `end` are out of range, or `end < start`.
 */
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

/** A fragment of a byte or chunk — fewer bits than the full unit. */
export type Partial = {
  bits: number;
  /** Number of significant bits, counted from the LSB. */
  length: number;
}

/**
 * Merges two {@link Partial} fragments into a complete 5-bit chunk value.
 * @throws {Error} If `left.length + right.length !== 5`.
 */
export const combinePartialChunks = (
  left: Partial,
  right: Partial,
): number => {
  if (left.length + right.length !== 5) {
    throw new Error(`Combined length of partial chunks must be 5: (${left.length} + ${right.length} != 5)`);
  }
  return (left.bits << right.length) + right.bits;
};

/**
 * Extracts the bits selected by `mask` from `val`, right-aligning the result.
 * @param val - The source value to extract bits from.
 * @param mask - A {@link CopyMask} describing which bits to copy.
 */
export const copyBits = (val: number, mask: CopyMask): number => {
  const bits = val & mask.bits;
  return bits >> mask.leftShift;
};

// get the next chunk end boundary from a starting position within a byte
const getEndChunk = (start: number, length: number = 5): number =>
  start + (length - 1) <= 8 ? start + (length - 1) : 8;

/**
 * Splits a byte array into an array of 5-bit values (chunks).
 * If the total bit count is not a multiple of 5, the final chunk is zero-padded on the right.
 */
export const toChunks = (uint8: Uint8Array): number[] => {
  const chunks = [] as number[];
  let startChunk = 1; // 1 index on a byte
  let endChunk = 5;
  let partialChunk: Partial | null = null;

  uint8.forEach((byte, idx) => {
    if (endChunk < 5) {
      // we have a 'right' partial at the front
      const mask = getCopyMask(startChunk, endChunk, 8);
      if (!partialChunk) {
        throw new Error(`Found right partial without left partial in byte ${idx}`);
      }
      const chunk = combinePartialChunks(partialChunk, {
        bits: copyBits(byte, mask),
        length: (endChunk - startChunk) + 1,
      });
      partialChunk = null;
      chunks.push(chunk);
      startChunk = endChunk + 1;
      endChunk = getEndChunk(startChunk);
    }

    if ((8 - startChunk) + 1 >= 5) {
      // we have entire chunk
      const mask = getCopyMask(startChunk, endChunk, 8);
      chunks.push(copyBits(byte, mask));
      startChunk = endChunk === 8 ? 1 : endChunk + 1;
      endChunk = getEndChunk(startChunk);
    }

    if (endChunk === 8) {
      // we have a 'left' partial
      const mask = getCopyMask(startChunk, endChunk, 8);
      partialChunk = {
        bits: copyBits(byte, mask),
        length: (endChunk - startChunk) + 1,
      };
      startChunk = 1;
      endChunk = getEndChunk(startChunk, (5 - partialChunk.length));
    }
  });

  if (partialChunk !== null) {
    // if we have a partial chunk left then right pad with zeros
    const padding = {
      bits: 0,
      // use bracket notation to workaround https://github.com/microsoft/TypeScript/issues/11498
      length: 5 - partialChunk['length'],
    };
    const chunk = combinePartialChunks(partialChunk, padding);
    chunks.push(chunk);
  }
  return chunks;
};

const partialsLength = (
  partials: Partial[],
): number => {
  return partials.length ?
    partials
      .map((partial) => partial.length)
      .reduce((prev, curr) => prev + curr) :
    0;
};

/**
 * Merges an array of {@link Partial} fragments into a single byte value.
 * @throws {Error} If the combined bit length is not exactly 8.
 */
export const combinePartialBytes = (
  partials: Partial[],
): number => {
  const length = partialsLength(partials);
  if (length !== 8) {
    throw new Error(`Combined length of partial bytes must be 8 bits: was ${length})`);
  }
  return partials.reduce((left, right) => {
    return {
      bits: (left.bits << right.length) + right.bits,
      length: left.length + right.length,
    };
  }).bits;
};

// get the next byte end boundary from a starting position within a chunk
const getEndByte = (start: number, partialBits: number): number => {
  const toEndOfByte = 8 - partialBits;
  return toEndOfByte >= 5 ? 5 : start + (toEndOfByte - 1);
};

/**
 * Reassembles a byte array from an array of 5-bit chunk values.
 * Trailing zero-padding introduced by {@link toChunks} is silently consumed;
 * non-zero padding or incomplete bytes cause an error.
 * @throws {Error} If the chunk data contains non-zero padding bits or an incomplete final byte.
 */
export const fromChunks = (chunks: number[]): Uint8Array => {
  const bytes = [] as number[];
  let startByte = 1; // 1 index on a chunk
  let endByte = 5;
  let partialBytes = [] as Partial[];

  const consumeBits = (chunk: number, startByte: number, endByte: number) => {
    const mask = getCopyMask(startByte, endByte, 5);
    partialBytes.push({
      bits: copyBits(chunk, mask),
      length: (endByte - startByte) + 1,
    });
    if (partialsLength(partialBytes) === 8) {
      bytes.push(combinePartialBytes(partialBytes));
      partialBytes = [] as Partial[];
    }
  };

  chunks.forEach((chunk, idx) => {
    if (endByte < 5) {
      // we need less than the full chunk
      consumeBits(chunk, startByte, endByte);
      startByte = endByte + 1;
      endByte = getEndByte(startByte, partialsLength(partialBytes));
    }

    if (endByte === 5) {
      // we (may) need the rest of the byte
      if ((startByte === 1) || // if we need the entire chunk
        (
          idx !== chunks.length - 1 ||
          partialBytes.length
        )// or we are not on the last chunk with a partial byte
      ) {
        // we *do* need the rest of the byte
        consumeBits(chunk, startByte, endByte);
        startByte = 1;
        endByte = getEndByte(startByte, partialsLength(partialBytes));
      } else {
        // the rest is padding — validate it is zeros
        const paddingMask = getCopyMask(startByte, 5, 5);
        if (copyBits(chunk, paddingMask) !== 0) {
          throw new Error('Non-zero padding bits in encoded data');
        }
      }
    }
  });

  if (partialBytes.length) {
    // if we have left over partials then our chunk data is currupt
    throw new Error('Found an incomplete byte in chunk data');
  }

  return Uint8Array.from(bytes);
};
