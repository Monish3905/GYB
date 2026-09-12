$apps = @(
  "api-gateway",
  "remittance-web",
  "operations-console"
)

$baseDir = "c:\Users\Monish\Remittance\apps"
if (-not (Test-Path -Path $baseDir)) {
  New-Item -ItemType Directory -Force -Path $baseDir | Out-Null
}

foreach ($app in $apps) {
  $appDir = "$baseDir\$app"
  if (-not (Test-Path -Path $appDir)) {
    New-Item -ItemType Directory -Force -Path $appDir\src | Out-Null
    Set-Content -Path "$appDir\package.json" -Value @"
{
  "name": "@payment-os/$app",
  "version": "1.0.0",
  "main": "src/index.ts",
  "license": "UNLICENSED"
}
"@
    Set-Content -Path "$appDir\tsconfig.json" -Value @"
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"]
}
"@
    Set-Content -Path "$appDir\src\index.ts" -Value ""
  }
}
Write-Output "Successfully initialized MS27 Application workspaces."
