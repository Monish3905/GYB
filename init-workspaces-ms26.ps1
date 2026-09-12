$packages = @(
  "financial-connectivity",
  "fx-connectivity",
  "beneficiary-validation",
  "transaction-limits",
  "connector-health"
)

$baseDir = "c:\Users\Monish\Remittance\packages"
foreach ($pkg in $packages) {
  $pkgDir = "$baseDir\$pkg"
  if (-not (Test-Path -Path $pkgDir)) {
    New-Item -ItemType Directory -Force -Path $pkgDir\src | Out-Null
    Set-Content -Path "$pkgDir\package.json" -Value @"
{
  "name": "@payment-os/$pkg",
  "version": "1.0.0",
  "main": "src/index.ts",
  "license": "UNLICENSED"
}
"@
    Set-Content -Path "$pkgDir\tsconfig.json" -Value @"
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"]
}
"@
    Set-Content -Path "$pkgDir\src\index.ts" -Value ""
  }
}
Write-Output "Successfully initialized MS26 Financial Connectivity packages."
