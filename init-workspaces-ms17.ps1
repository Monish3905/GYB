$packages = @(
  "identity-platform",
  "authentication",
  "authorization",
  "identity-providers",
  "identity-provider-keycloak",
  "identity-provider-auth0",
  "secrets",
  "encryption",
  "key-management",
  "certificate-management",
  "governance",
  "security-monitor",
  "security-audit",
  "zero-trust",
  
  # Governance & Policies
  "policy-engine", "compliance-policies", "security-policies",
  
  # Security Sub-domains
  "session-management", "mfa-platform", "device-trust", "api-security", "oauth-server",
  "jwt-platform", "sso-gateway", "audit-logger", "threat-detection",
  
  # Secrets backends
  "secrets-vault", "secrets-aws", "secrets-azure",
  
  # IAM
  "iam-users", "iam-roles", "iam-permissions", "iam-tenants", "iam-organizations"
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

Write-Output "Successfully initialized $($packages.Length) packages for Milestone 17."
