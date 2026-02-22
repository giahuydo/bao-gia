export const ORGANIZATION_PLANS = {
  free: {
    name: 'Free',
    monthlyTokenLimit: 100_000,
    priceUsd: 0,
  },
  starter: {
    name: 'Starter',
    monthlyTokenLimit: 1_000_000,
    priceUsd: 29,
  },
  professional: {
    name: 'Professional',
    monthlyTokenLimit: 5_000_000,
    priceUsd: 99,
  },
  enterprise: {
    name: 'Enterprise',
    monthlyTokenLimit: Infinity,
    priceUsd: 299,
  },
} as const;

export const TOKEN_OVERAGE_RATE_PER_1K = 0.02; // USD

export const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
