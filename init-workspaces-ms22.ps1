$packages = @(
  # Core Data Platform
  "data-platform", "stream-processing", "data-warehouse",
  "executive-analytics", "financial-intelligence", "customer-intelligence",
  "merchant-intelligence", "compliance-analytics", "treasury-analytics",
  "network-intelligence", "kpi-engine", "forecasting-platform",
  "dashboard-engine", "report-engine",

  # Data Lake & Storage
  "data-lake", "event-store", "object-storage-adapter",
  "data-retention", "data-archival",

  # Stream Processing Sub-modules
  "stream-aggregator", "stream-enricher", "stream-router",
  "rolling-metrics", "time-series-engine",

  # Data Warehouse Sub-modules
  "fact-payments", "fact-settlements", "fact-treasury", "fact-compliance",
  "dim-customer", "dim-merchant", "dim-provider", "dim-currency",
  "dim-country", "dim-time", "slowly-changing-dims",

  # Analytics Sub-modules
  "revenue-analytics", "margin-analytics", "volume-analytics",
  "growth-analytics", "retention-analytics", "churn-predictor",
  "ltv-calculator", "activity-scorer",

  # Intelligence Sub-modules
  "cash-flow-intelligence", "fx-exposure-analytics", "provider-cost-analytics",
  "settlement-performance-analytics", "corridor-analytics",

  # KPI & Forecasting
  "kpi-calculator", "kpi-snapshots", "forecast-volume", "forecast-revenue",
  "forecast-liquidity", "forecast-network",

  # Reporting Sub-modules
  "csv-exporter", "excel-exporter", "pdf-exporter",
  "regulatory-reports", "audit-reports",

  # Dashboard Sub-modules
  "dashboard-cache", "dashboard-widgets", "dashboard-refresh"
)

$baseDir = "c:\Users\Monish\Remittance\packages"
foreach ($pkg in $packages) {
  $pkgDir = "$baseDir\$pkg"
  if (-not (Test-Path -Path $pkgDir)) {
    New-Item -ItemType Directory -Force -Path $pkgDir\src | Out-Null
    $pj = @"
{
  "name": "@payment-os/$pkg",
  "version": "1.0.0",
  "main": "src/index.ts",
  "license": "UNLICENSED"
}
"@
    Set-Content -Path "$pkgDir\package.json" -Value $pj
    $tc = @"
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"]
}
"@
    Set-Content -Path "$pkgDir\tsconfig.json" -Value $tc
    Set-Content -Path "$pkgDir\src\index.ts" -Value ""
  }
}
Write-Output "Successfully initialized Financial Intelligence packages for Milestone 22."
