export const calculateChecksum = (uint8: Uint8Array): number => {
  if (!uint8.length) {
    return 0;
  }

  // join the bytes into one binary number
  // represented as a string
  // left padding bytes to 8 digits if necessary
  // Note: can't use map/reduce here
  // as uint8 is a TypedArray and
  // TypedArray.map returns a TypedArray
  let binStr = '0b'; // start with binary literal indicator
  uint8.forEach((b) => {
    binStr = binStr.concat(b.toString(2).padStart(8, '0'));
  });
  // calculate modulo 37
  return Number(BigInt(binStr) % 37n);
};

export const validateChecksum = (
    chunks: number[],
    checksum: number,
): boolean => {
  if (!chunks.length) {
    return true;
  }
  const sum: bigint = chunks
      .map((c) => BigInt(c))
      .reduce((prev, curr) => prev + curr);
  const check = Number(sum % 37n);
  return check === checksum;
};
