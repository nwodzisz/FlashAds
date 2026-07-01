import { calculatePlatformFee } from '../utils';

describe('calculatePlatformFee', () => {
  it('should calculate exactly 20% of the price in cents', () => {
    // 1-day tier: $25 = 2500 cents
    expect(calculatePlatformFee(2500)).toBe(500);
    // 3-day tier: $60 = 6000 cents
    expect(calculatePlatformFee(6000)).toBe(1200);
    // 7-day tier: $120 = 12000 cents
    expect(calculatePlatformFee(12000)).toBe(2400);
    // Edge case with rounding: $25.99 = 2599 cents -> 519.8 -> 520
    expect(calculatePlatformFee(2599)).toBe(520);
  });
});
