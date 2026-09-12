# MS27 Demo Start Script
# Starts API Gateway, Remittance Web App, and Operations Console concurrently

Write-Output "Starting GYB MS27 Full Stack..."

$apiPath = "c:\Users\Monish\Remittance\apps\api-gateway"
$webPath = "c:\Users\Monish\Remittance\apps\remittance-web"
$opsPath = "c:\Users\Monish\Remittance\apps\operations-console"

# We use Start-Process to run them in background windows (or we can use concurrently in Node, but native PS is fine for demo)
Start-Process powershell -ArgumentList "-NoExit -Command cd $apiPath; npm run dev" -WindowStyle Normal
Write-Output "API Gateway starting on port 4000..."

Start-Process powershell -ArgumentList "-NoExit -Command cd $webPath; npm run dev -- --port 3000" -WindowStyle Normal
Write-Output "Remittance Web App starting on port 3000..."

Start-Process powershell -ArgumentList "-NoExit -Command cd $opsPath; npm run dev -- --port 3001" -WindowStyle Normal
Write-Output "Operations Console starting on port 3001..."

Write-Output "Stack initialized. Please check the new terminal windows."
