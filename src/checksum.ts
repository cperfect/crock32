// join the bytes into one binary number
const toBigInt = (uint8: Uint8Array): bigint => {
  // represented as a string
  // left padding bytes to 8 digits if necessary
  // Note: can't use map/reduce here
  // as uint8 is a TypedArray and
  // TypedArray.map returns a TypedArray
  let binStr = '0b'; // start with binary literal indicator
  uint8.forEach((byte) => {
    binStr = binStr.concat(byte.toString(2).padStart(8, '0'));
  });
  return BigInt(binStr);
};

export const calculateChecksum = (uint8: Uint8Array): number => {
  if (!uint8.length) {
    return 0;
  }
  const big = toBigInt(uint8);
  // calculate modulo 37
  return Number(big % 37n);
};

export const validateChecksum = (
  uint8: Uint8Array,
  checksum: number,
): boolean => {
  if (!uint8.length) {
    return true;
  }
  const big = toBigInt(uint8);
  const check = Number(big % 37n);
  return check === checksum;
};
