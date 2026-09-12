$packages = @(
  "enterprise-governance", "enterprise-risk", "control-framework", "policy-management",
  "regulatory-intelligence", "regulatory-mapping", "evidence-management", "audit-platform",
  "continuous-compliance", "privacy-governance", "data-governance", "third-party-risk",
  "business-continuity", "operational-resilience", "certification-readiness",
  "governance-reporting", "governance-dashboard", "governance-events",
  "governance-approvals", "governance-copilot",

  # Additional sub-modules for compliance and evidence
  "policy-authoring", "policy-versioning",
  "risk-assessment", "risk-treatment", "risk-scoring",
  "control-testing", "control-remediation",
  "evidence-collection", "evidence-verification", "evidence-storage",
  "audit-planning", "audit-findings", "audit-remediation",
  "regulatory-changes", "jurisdiction-mapping", "compliance-alerts",
  "data-classification", "data-retention", "consent-management",
  "vendor-assessments", "vendor-monitoring",
  "bcp-planning", "recovery-testing",
  "certification-mapping", "soc2-framework", "pci-dss-framework",
  "iso27001-framework", "gdpr-framework",
  "compliance-reports", "risk-reports", "audit-reports",
  "executive-grc-dashboard", "security-grc-dashboard", "operations-grc-dashboard",
  "governance-event-bus", "approval-workflows", "approval-gates",
  "copilot-findings-summarizer", "copilot-remediation-advisor"
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
Write-Output "Successfully initialized Enterprise Governance packages for Milestone 24."
