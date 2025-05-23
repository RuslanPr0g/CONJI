@echo off
echo Starting Angular deployment...

echo Minifying group JSON files...

REM Run the node minify-json script
node minify-json.js
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ JSON minification failed with exit code %ERRORLEVEL%.
    exit /b %ERRORLEVEL%
)

echo ✅ JSON minification completed.

REM Run Angular deploy with base href
ng deploy --base-href=/CONJI/
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Deployment failed with exit code %ERRORLEVEL%.
    exit /b %ERRORLEVEL%
)

echo ✅ Deployment completed successfully.

