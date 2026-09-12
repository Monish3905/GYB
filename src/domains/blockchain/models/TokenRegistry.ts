export interface TokenConfig {
  symbol: string;
  mintAddress: string;
  decimals: number;
}

export const DEVNET_TOKENS: Record<string, TokenConfig> = {
  'USDC': {
    symbol: 'USDC',
    mintAddress: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // Official USDC Devnet Mint
    decimals: 6
  },
  'EURC': {
    symbol: 'EURC',
    mintAddress: 'HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcSy7qTepZbd', // Official EURC Devnet Mint
    decimals: 6
  }
};

export const MAINNET_TOKENS: Record<string, TokenConfig> = {
  'USDC': {
    symbol: 'USDC',
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC Mainnet Mint
    decimals: 6
  },
  'EURC': {
    symbol: 'EURC',
    mintAddress: 'HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcSy7qTepZbd', // EURC Mainnet Mint
    decimals: 6
  }
};

export function getTokenConfig(symbol: string, isMainnet: boolean = false): TokenConfig | undefined {
  if (symbol === 'SOL') return undefined; // SOL is native
  
  const registry = isMainnet ? MAINNET_TOKENS : DEVNET_TOKENS;
  return registry[symbol.toUpperCase()];
}
