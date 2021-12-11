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

export const validateChecksum = (chunks: number[]): boolean => {
  if (!chunks.length) {
    return true;
  }
  const check = chunks[chunks.length - 1];
  const data = chunks.slice(0, (chunks.length - 2));
  const sum: bigint = data
      .map((c) => BigInt(c))
      .reduce((prev, curr) => prev + curr);
  const checksum = Number(sum % 37n);
  return check === checksum;
};
