'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// ── Monad Testnet chain definition ──────────────────────────
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://explorer-testnet.monad.xyz',
    },
  },
  testnet: true,
});

// ── Wagmi + RainbowKit config ───────────────────────────────
export const config = getDefaultConfig({
  appName: 'HyperStream',
  projectId: 'hyperstream-poc-monad', // WalletConnect project ID (placeholder)
  chains: [monadTestnet],
  ssr: true,
});
