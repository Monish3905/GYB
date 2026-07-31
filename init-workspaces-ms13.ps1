$packages = @(
  "api-gateway", "api-routing", "api-contracts", "api-versioning", "api-errors", "api-middlewares", "api-responses", "api-health",
  "auth", "oauth", "jwt", "api-keys", "permissions", "roles", "organizations", "tenants",
  "rate-limiter", "idempotency", "request-validation", "request-signing", "response-signing", "encryption", "secrets", "cors", "csrf",
  "rest-api", "openapi", "swagger-ui",
  "graphql-api", "graphql-schema", "graphql-resolvers",
  "webhooks", "webhook-delivery", "webhook-subscriptions", "webhook-signatures", "webhook-retries",
  "sdk-generator", "sdk-typescript", "sdk-python", "sdk-java", "sdk-go",
  "connectors", "erp-connectors", "crm-connectors", "accounting-connectors",
  "developer-portal", "api-documentation", "api-playground", "examples", "postman",
  "api-monitor", "api-metrics", "api-analytics", "api-audit"
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

Write-Output "Successfully initialized $($packages.Length) packages for Milestone 13."
