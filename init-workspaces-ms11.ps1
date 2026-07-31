$packages = @(
  "identity",
  "kyc",
  "kyb",
  "document-verification",
  "compliance",
  "compliance-events",
  "aml",
  "sanctions",
  "watchlists",
  "fraud",
  "behavior-analysis",
  "device-fingerprint",
  "velocity-engine",
  "risk-engine",
  "risk-models",
  "customer-risk",
  "wallet-risk",
  "provider-risk",
  "corridor-risk",
  "country-regulations",
  "regulatory-policies",
  "travel-rule",
  "blockchain-analytics",
  "wallet-screening",
  "decision-engine",
  "rule-engine",
  "case-management",
  "alerting",
  "compliance-reporting",
  "audit-compliance",
  "transaction-monitor"
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
  
  # Create an empty index.ts
  Set-Content -Path "$pkgDir\src\index.ts" -Value ""
}

Write-Output "Successfully initialized $($packages.Length) packages for Milestone 11."
