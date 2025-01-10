#!/bin/bash

# Build TypeScript files
echo "Building TypeScript files..."
npx tsc

# Run performance tests
echo "Running performance tests..."
node scripts/performance-test.js

# Check exit status
if [ $? -eq 0 ]; then
    echo "Performance tests completed successfully"
else
    echo "Performance tests failed"
    exit 1
fi
