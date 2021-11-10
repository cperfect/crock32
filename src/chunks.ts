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
  // return Number.parseInt(mask, 2);
  return mask;
};

const sigBits = (val: number): number => {
  return Math.floor(Math.log(val)/Math.log(2))+1;
};

// const countTrailingZeros = (val: number) => {
//   let count = 0;
//   for (let i = 1; i < 5; i++) {
//     const notAZero = val % Math.pow(2, i);
//     if (notAZero) {
//       break;
//     }
//     count++;
//   }
//   return count;
// };

export type PartialChunk = {
  bits: number;
  length: number; // necessary because leading 0 will be dropped
}

export const combinePartials = (
    left: PartialChunk,
    right: PartialChunk,
): number => {
  if (left.length + right.length != 5) {
    // eslint-disable-next-line max-len
    throw new Error(`Combined length of partial chunks must be 5 (${left.length} + ${right.length} != 5)`);
  }
  // const leftSigBits = sigBits(left.bits);
  // const rightSigBits = sigBits(right.bits);
  // const leftShift = left.length < leftSigBits
  // if ((sigBits(left.bits) + sigBits(right.bits)) > 5) {
  // eslint-disable-next-line max-len
  //   throw new Error(`Combined significant bits of partial chunks must be less than 5 (${sigBits(left.bits)} + ${right.bits} >= 5)`);
  // }
  return (left.bits << right.length) + right.bits;
  // const leftSigBits = sigBits(left.bits);
  // const rightSigBits = sigBits(right.bits);
  // // const leftShift = leftSigBits < left.length
  // // ? (5 - left.length) + (left.length - leftSigBits) : 5 - left.length;
  // // const leftShift = rightSigBits < leftSigBits ? rightSigBits :
  // const leftShift = right.length;
  // const lVal = left.bits << length;

  // // const lVal = sigBits(left.bits) === left.length ?
  // // left.bits << 5 - left.length : left.bits << sigBits(left.bits);
  // // const rVal = sigBits(right.bits) === right.length ?
  // // right.bits >>> 5 - right.length : right.bits >>> sigBits(right.bits);
  // // const lVal = left.bits << left.length;
  // // const rVal = right.bits >>> right.length;
  // return lVal & rVal;
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
      // eslint-disable-next-line max-len
      // chunks[chunks.length-1] = combinePartialsOld(chunks[chunks.length-1], partialChunk);
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
        // right pad the last chunk with 0 if necessary
        // eslint-disable-next-line max-len
        // partialChunk = byteToChunk(partialChunk, getCopyMask(0, sigBits(partialChunk)-1, 8));//tehnically a complete chunk
      } else { // we expect to find the 'right' partial in the next byte
        partialChunk = {
          bits: byteToChunk(byte, mask),
          length: 5 - (endChunk - startChunk),
        };
      }
      // chunks.push(partialChunk);
      endChunk = (startChunk + 5) % 8;
      startChunk = 1;
    }
  });
  return chunks;
};

// export const fromChunks = (chunks: number[]): Uint8Array => {

// };
