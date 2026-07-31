$packages = @(
  "ai-core",
  "ai-models",
  "model-serving",
  "model-registry",
  "model-monitor",
  "feature-store",
  "feature-engineering",
  "online-features",
  "offline-features",
  "anomaly-detection",
  "fraud-prediction",
  "graph-intelligence",
  "graph-risk",
  "entity-resolution",
  "mule-detection",
  "behavioral-ml",
  "sequence-analysis",
  "adaptive-risk",
  "explainability",
  "recommendation-engine",
  "ai-decision",
  "llm-copilot",
  "investigation-assistant",
  "case-summarizer",
  "report-generator",
  "suspicious-patterns",
  "typology-engine",
  "drift-detection",
  "retraining",
  "model-validation",
  "synthetic-data",
  "graph-database",
  "embeddings",
  "vector-search",
  "ai-events",
  "ai-audit"
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

Write-Output "Successfully initialized $($packages.Length) packages for Milestone 12."
