// 37 is prime and larger than the 32 data symbols + 5 checksum symbols,
// making it the modulus chosen by Crockford to produce unique check values.
const CHECKSUM_MODULUS = 37n;

// Join the bytes into one BigInt for modulo arithmetic.
// BigInt is required as the data can be arbitrarily large.
// We shift and OR each byte in directly to avoid an intermediate string.
const toBigInt = (uint8: Uint8Array): bigint =>
  uint8.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n);

/**
 * Calculates the Crockford checksum for the given bytes.
 * Returns a value in the range 0–36, used as the final symbol when encoding with `checked=true`.
 */
export const calculateChecksum = (uint8: Uint8Array): number => {
  if (!uint8.length) {
    return 0;
  }
  const big = toBigInt(uint8);
  return Number(big % CHECKSUM_MODULUS);
};

/**
 * Validates that the given checksum matches the calculated checksum for the given bytes.
 * Returns `true` for empty input — an empty payload has no data to verify against.
 */
export const validateChecksum = (
  uint8: Uint8Array,
  checksum: number,
): boolean => {
  if (!uint8.length) {
    return true;
  }
  return calculateChecksum(uint8) === checksum;
};
