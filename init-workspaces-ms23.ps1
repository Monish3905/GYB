$packages = @(
  # Core Orchestration
  "platform-orchestrator", "automation-platform", "resource-scheduler",
  "auto-scaling", "self-healing", "service-discovery",
  "distributed-coordinator", "backup-platform", "disaster-recovery",
  "configuration-platform", "deployment-platform", "chaos-engine",
  "platform-optimizer", "runtime-policies",

  # Orchestration Sub-modules
  "orchestration-workflows", "orchestration-scheduler", "orchestration-audit",
  "conditional-workflows", "approval-workflows",

  # Scaling Sub-modules
  "cpu-scaler", "memory-scaler", "queue-scaler", "tps-scaler", "latency-scaler",

  # Self-Healing Sub-modules
  "circuit-reset-healer", "consumer-recovery", "workload-rebalancer",
  "provider-failover-healer", "service-restarter",

  # Discovery & Coordination
  "health-discovery", "dynamic-routing-discovery", "leader-election",
  "distributed-locks", "cluster-consensus",

  # Backup & DR Sub-modules
  "db-backup", "event-replay-checkpoint", "config-snapshot",
  "region-failover", "cluster-recovery", "db-recovery",

  # Deployment & Delivery
  "canary-deployer", "blue-green-deployer", "rolling-deployer",
  "rollback-engine", "deployment-gate",

  # Configuration
  "feature-flags", "environment-profiles", "dynamic-config",

  # Chaos Sub-modules
  "chaos-provider-failure", "chaos-db-failure", "chaos-network-partition",
  "chaos-event-bus-failure", "chaos-regional-outage",

  # Optimization
  "compute-optimizer", "queue-optimizer", "provider-selector-optimizer",
  "infra-utilization-optimizer"
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
Write-Output "Successfully initialized Orchestration packages for Milestone 23."
