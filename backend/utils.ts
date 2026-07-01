export function calculatePlatformFee(priceCents: number): number {
  return Math.round(priceCents * 0.20);
}
