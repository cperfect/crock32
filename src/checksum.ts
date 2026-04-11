// 37 is prime and larger than the 32 data symbols + 5 checksum symbols,
// making it the modulus chosen by Crockford to produce unique check values.
const CHECKSUM_MODULUS = 37n;

// Join the bytes into one BigInt for modulo arithmetic.
// BigInt is required as the data can be arbitrarily large.
// We shift and OR each byte in directly to avoid an intermediate string.
const toBigInt = (uint8: Uint8Array): bigint =>
  uint8.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n);

export const calculateChecksum = (uint8: Uint8Array): number => {
  if (!uint8.length) {
    return 0;
  }
  const big = toBigInt(uint8);
  return Number(big % CHECKSUM_MODULUS);
};

export const validateChecksum = (
  uint8: Uint8Array,
  checksum: number,
): boolean => {
  if (!uint8.length) {
    return true;
  }
  return calculateChecksum(uint8) === checksum;
};
