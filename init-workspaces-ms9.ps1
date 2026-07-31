$packages = @(
  "database",
  "postgres",
  "migrations",
  "repositories",
  "unit-of-work",
  "transaction-manager",
  "event-store",
  "outbox",
  "read-models",
  "snapshot-store",
  "cache",
  "database-monitor",
  "database-events",
  "database-health"
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

Write-Output "Successfully initialized $($packages.Length) packages for Milestone 9."
