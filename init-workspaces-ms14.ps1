$packages = @(
  # Customer
  "customers", "customer-profiles", "customer-preferences", "customer-wallets", "customer-verification", "customer-notifications",
  # Merchant
  "merchants", "merchant-profiles", "merchant-onboarding", "merchant-wallets", "merchant-settlements", "merchant-analytics",
  # Accounts
  "accounts-service", "organizations-service", "teams", "users", "invitations", "access-management",
  # Wallets
  "wallets", "wallet-balances", "wallet-transactions", "wallet-history", "wallet-limits", "wallet-statements",
  # Payments
  "payment-orders", "invoices", "payment-links", "qr-payments", "recurring-payments", "subscriptions",
  # Payouts
  "payouts", "beneficiaries", "payout-batches", "payout-approvals", "payout-schedules",
  # Notifications
  "notifications", "email-service", "sms-service", "push-notifications", "templates", "notification-preferences",
  # Support
  "support", "tickets", "chat", "knowledge-base", "feedback",
  # Dashboards
  "dashboard", "reporting-dashboard", "finance-dashboard", "merchant-dashboard", "customer-dashboard",
  # Operations
  "operations", "operations-console", "workflow-engine", "manual-actions", "approvals",
  # Files
  "file-storage", "document-center", "uploads",
  # Search
  "search", "global-search",
  # Audit
  "activity-log", "user-audit", "admin-audit"
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

Write-Output "Successfully initialized $($packages.Length) packages for Milestone 14."
