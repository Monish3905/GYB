$packages = @(
  # Core Network Infrastructure
  "gyb-network", "network-participants", "network-accounts", 
  "clearing-engine", "network-settlement", "network-liquidity", 
  "network-messaging", "network-router", "network-directory", 
  "settlement-finality", "network-governance", "payment-rail", 
  "network-monitor",
  
  # Clearing & Settlement Sub-modules
  "rtgs-settlement", "dns-settlement", "clearing-positions", "clearing-cycles",
  "settlement-windows", "settlement-queues", "settlement-retry",
  
  # Network Messaging & Routing
  "iso20022-parser", "network-message-broker", "geographic-router", 
  "currency-router", "network-failover",
  
  # Liquidity Sub-modules
  "intraday-liquidity", "interbank-liquidity", "auto-borrowing", "auto-repayment",
  
  # Participant Management
  "participant-onboarding", "compliance-verifier", "operational-status",
  
  # Network Services & Governance
  "fee-engine", "network-policies", "protocol-versioning",
  "network-audit", "network-health", "network-metrics", "network-alerts",
  
  # Network Account sub-modules
  "settlement-accounts-ledger", "reserve-accounts-ledger", "liquidity-accounts-ledger"
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

Write-Output "Successfully initialized GYB Network packages for Milestone 19."
