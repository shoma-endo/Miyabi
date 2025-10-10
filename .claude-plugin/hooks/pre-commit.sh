#!/bin/bash
# Miyabi Pre-Commit Hook
# Run linting and tests before commit

set -e

echo "🌸 Miyabi Pre-Commit Hook"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules not found. Run 'npm install' first."
  exit 1
fi

# Run linter
echo "🔍 Running linter..."
if npm run lint; then
  echo "✅ Lint check passed"
else
  echo "❌ Lint check failed"
  echo ""
  echo "Fix linting errors before committing."
  echo "Run: npm run lint -- --fix"
  exit 1
fi

# Run type check
echo ""
echo "🔍 Running type check..."
if npm run typecheck; then
  echo "✅ Type check passed"
else
  echo "❌ Type check failed"
  echo ""
  echo "Fix type errors before committing."
  exit 1
fi

# Run tests
echo ""
echo "🧪 Running tests..."
if npm test; then
  echo "✅ Tests passed"
else
  echo "❌ Tests failed"
  echo ""
  echo "Fix failing tests before committing."
  echo "Run: npm test -- --reporter=verbose"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All pre-commit checks passed!"
echo "🌸 Ready to commit"

exit 0
