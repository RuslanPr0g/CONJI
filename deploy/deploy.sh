#!/bin/bash

echo "Starting Angular deployment..."

echo "Minifying group JSON files..."

node minify-json.js
if [ $? -ne 0 ]; then
    echo "❌ JSON minification failed with exit code $?."
    exit $?
fi

echo "✅ JSON minification completed."

ng deploy --base-href=/CONJI/
if [ $? -ne 0 ]; then
    echo "❌ Deployment failed with exit code $?."
    exit $?
fi

echo "✅ Deployment completed successfully."
