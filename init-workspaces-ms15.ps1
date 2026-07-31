$packages = @(
  # Provider Framework
  "provider-framework", "provider-contracts", "provider-registry", "provider-loader", "provider-discovery", "provider-selection", "provider-capabilities", "provider-health", "provider-monitor", "provider-metrics", "provider-failover", "provider-routing",
  # Blockchain Providers
  "ethereum-provider", "polygon-provider", "solana-provider", "avalanche-provider", "arbitrum-provider", "optimism-provider", "base-provider", "tron-provider", "bsc-provider",
  # Stablecoins
  "usdc-provider", "usdt-provider", "eurc-provider", "stablecoin-router",
  # Banking Rails
  "swift-provider", "ach-provider", "sepa-provider", "fps-provider", "rtp-provider", "fednow-provider", "wire-provider", "upi-provider", "imps-provider", "neft-provider", "rtgs-provider",
  # Card Networks
  "visa-provider", "mastercard-provider", "amex-provider", "rupay-provider",
  # Wallet Providers
  "stripe-provider", "paypal-provider", "wise-provider", "payoneer-provider", "razorpay-provider",
  # FX
  "fx-provider", "exchange-rates", "liquidity-provider", "quote-engine",
  # Monitoring
  "provider-events", "provider-audit", "provider-reconciliation", "network-events",
  # Testing
  "provider-simulator", "sandbox-providers", "integration-tests",
  # Additional execution
  "multi-rail-router", "execution-adapters", "provider-retries",
  # Compliance
  "provider-compliance", "provider-kyc", "provider-risk"
)

$baseDir = "c:\Users\Monish\Remittance\packages"

foreach ($pkg in $packages) {
  $pkgDir = "$baseDir\$pkg"
  New-Item -ItemType Directory -Force -Path $pkgDir\src | Out-Null
  
  $packageJson = @"
{
  "name": "@payment-os/$pkg",
  "version": "1.0.0",
  "main": "src/index.ts",
  "license": "UNLICENSED"
}
"@
  Set-Content -Path "$pkgDir\package.json" -Value $packageJson

  $tsConfig = @"
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
"@
  Set-Content -Path "$pkgDir\tsconfig.json" -Value $tsConfig
  
  Set-Content -Path "$pkgDir\src\index.ts" -Value ""
}

Write-Output "Successfully initialized $($packages.Length) packages for Milestone 15."
