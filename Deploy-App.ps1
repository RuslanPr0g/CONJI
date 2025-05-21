Write-Host "Starting Angular deployment..."

ng deploy --base-href=/CONJI/

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment completed successfully."
} else {
    Write-Host "❌ Deployment failed with exit code $LASTEXITCODE."
    exit $LASTEXITCODE
}
