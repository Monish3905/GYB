$packages = @(
  # Treasury Core
  "treasury", "treasury-engine", "treasury-policies", "treasury-alerts", "treasury-events", "treasury-monitoring",
  
  # Liquidity
  "liquidity-engine", "liquidity-pools", "pool-allocator", "liquidity-forecasting", "liquidity-reservation", "emergency-liquidity", "corridor-liquidity", "provider-liquidity",
  
  # Prefunding
  "prefund-engine", "prefund-allocator", "corridor-prefunding", "provider-prefunding", "wallet-prefunding", "prefund-thresholds",
  
  # FX & Hedging
  "fx-exposure", "fx-hedging", "hedge-execution", "currency-imbalance", "settlement-risk", "exposure-reporting",
  
  # Accounts
  "nostro-accounts", "vostro-accounts", "reserve-accounts", "settlement-accounts", "operational-accounts", "treasury-accounts",
  
  # Cash Management
  "cash-position", "country-balances", "currency-balances", "operational-balances", "reserve-balances", "provider-balances",
  
  # Capital Optimization
  "capital-optimizer", "idle-capital", "provider-allocation", "liquidity-balancing", "settlement-optimization", "execution-cost",
  
  # Financial Operations
  "funding-requests", "funding-workflow", "reconciliation-automation", "financial-reporting", "treasury-dashboards", "treasury-audit",
  
  # Integration tests
  "treasury-simulator", "treasury-stress-test", "liquidity-stress-test"
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

Write-Output "Successfully initialized $($packages.Length) packages for Milestone 16."
