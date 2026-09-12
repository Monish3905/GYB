$packages = @(
  # Core NOC & Intelligence
  "network-operations", "platform-monitor", "alert-engine", 
  "incident-management", "automation-engine", "capacity-planning", 
  "operations-analytics", "service-topology", "operations-copilot", 
  "platform-health", "executive-dashboard",

  # Monitoring Sub-modules
  "service-health-monitor", "api-health-monitor", "provider-health-monitor",
  "network-health-monitor", "treasury-health-monitor", "settlement-health-monitor",
  "compliance-health-monitor", "infrastructure-health-monitor",

  # Alert Sub-modules
  "critical-alerts", "warning-alerts", "operational-alerts", 
  "security-alerts", "treasury-alerts", "compliance-alerts", 

  # Incident & Workflow
  "incident-workflows", "severity-classifier", "ownership-assigner",
  "postmortem-generator", "provider-restarter", "circuit-resetter",
  "queue-recovery", "retry-manager", "auto-scaler",

  # Analytics & Dashboard
  "throughput-analyzer", "success-rate-analyzer", "settlement-performance-analyzer",
  "treasury-utilization", "customer-activity-tracker",
  "revenue-flow-dashboard", "payment-volume-dashboard", "liquidity-dashboard",

  # Topology & Copilot
  "service-graph", "event-flow-mapper", "api-dependency-graph",
  "incident-summarizer", "root-cause-analyzer", "capacity-recommender"
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

Write-Output "Successfully initialized Platform Operations packages for Milestone 20."
