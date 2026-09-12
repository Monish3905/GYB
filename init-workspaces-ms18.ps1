$packages = @(
  # Core Treasury & Liquidity
  "treasury", "liquidity", "liquidity-optimizer", "treasury-accounts", 
  "cash-position", "fx-treasury", "reconciliation", "accounting", 
  "financial-reporting", "forecasting", "treasury-risk", "provider-balances",
  "treasury-automation",

  # Extended Treasury Operations
  "treasury-limits", "treasury-transfers", "internal-capital", "treasury-events-stream",
  
  # Extended Liquidity
  "prefunding-engine", "working-capital", "emergency-liquidity-manager", "locked-liquidity",
  "liquidity-movements", "liquidity-alerts",
  
  # Optimization Sub-modules
  "cross-provider-balancer", "cross-bank-balancer", "currency-balancer", "lowest-cost-router",
  
  # Reconciliation Sub-modules
  "provider-statements", "bank-statements", "blockchain-reconciliation", "auto-matcher",
  "exception-handler", "reconciliation-jobs",
  
  # Accounting Sub-modules
  "general-ledger", "journal-posting", "trial-balance", "balance-sheet", 
  "profit-and-loss", "revenue-recognition", "fee-accounting", "tax-entries",
  
  # Reporting & Forecasting Sub-modules
  "cash-flow-reports", "daily-settlement-reports", "executive-dashboards",
  "volume-forecaster", "provider-capacity",
  
  # Treasury Risk Sub-modules
  "concentration-risk", "currency-risk", "counterparty-risk", "country-risk"
)

$baseDir = "c:\Users\Monish\Remittance\packages"

foreach ($pkg in $packages) {
  $pkgDir = "$baseDir\$pkg"
  if (-not (Test-Path -Path $pkgDir)) {
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
}

Write-Output "Successfully initialized treasury and financial operation packages for Milestone 18."
