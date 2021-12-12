export const addChecksum = (chunks: number[]): number[] => {
  if (!chunks.length) {
    return chunks;
  }
  const sum: bigint = chunks
      .map((c) => BigInt(c))
      .reduce((prev, curr) => prev + curr);
  const checksum = Number(sum % 37n);
  return [
    ...chunks,
    checksum,
  ];
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
