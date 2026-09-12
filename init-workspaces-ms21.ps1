$packages = @(
  # Core Framework & Marketplace
  "plugin-framework", "plugin-sdk", "marketplace", "workflow-engine",
  "workflow-runtime", "integration-hub", "embedded-finance", "low-code",
  "plugin-security", "developer-toolkit", "plugin-events",

  # Plugin Sub-modules
  "plugin-loader", "plugin-registry", "plugin-resolver", "plugin-isolator",
  "plugin-versioning", "plugin-lifecycle", "plugin-sandbox",

  # SDK Sub-modules
  "sdk-events", "sdk-api", "sdk-ui", "sdk-storage", "sdk-auth", "sdk-workflow",

  # Marketplace Sub-modules
  "marketplace-publisher", "marketplace-reviews", "marketplace-billing",
  "marketplace-categories", "marketplace-search", "marketplace-analytics",
  "marketplace-licensing", "marketplace-moderation",

  # Workflow Sub-modules
  "workflow-triggers", "workflow-conditions", "workflow-actions",
  "workflow-scheduler", "workflow-templates", "workflow-visual-builder",
  "workflow-yaml-parser",

  # Integration Sub-modules
  "integration-crm", "integration-erp", "integration-accounting",
  "integration-banking", "integration-saas", "integration-hr",

  # Embedded Finance Sub-modules
  "embedded-payments", "embedded-wallets", "embedded-treasury",
  "embedded-compliance", "embedded-identity",

  # Low-Code Sub-modules
  "form-builder", "rule-builder", "api-builder", "dashboard-builder",

  # Developer Experience
  "plugin-cli", "local-emulator", "plugin-debugger", "testing-toolkit",
  "sdk-generator", "docs-generator",

  # Security & Permissions
  "extension-permissions", "resource-quotas", "secret-isolation",
  "api-permissions", "event-permissions",

  # Analytics & Audit
  "plugin-metrics", "workflow-metrics", "developer-activity",
  "marketplace-statistics", "plugin-health", "plugin-runtime-monitor"
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
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"]
}
"@
    Set-Content -Path "$pkgDir\tsconfig.json" -Value $tsConfig
    Set-Content -Path "$pkgDir\src\index.ts" -Value ""
  }
}

Write-Output "Successfully initialized Developer Ecosystem packages for Milestone 21."
