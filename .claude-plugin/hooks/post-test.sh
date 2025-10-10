#!/bin/bash
# Miyabi Post-Test Hook
# Generate coverage report and update metrics

set -e

echo "🌸 Miyabi Post-Test Hook"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if tests passed (exit code from previous command)
TEST_EXIT_CODE=${1:-$?}

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ Tests passed"
else
  echo "❌ Tests failed (exit code: $TEST_EXIT_CODE)"
fi

echo ""

# Generate coverage report
echo "📊 Generating test coverage report..."

if npm run test -- --coverage --reporter=json --reporter=html > /dev/null 2>&1; then
  echo "✅ Coverage report generated"

  # Parse coverage summary
  if [ -f "coverage/coverage-summary.json" ]; then
    STATEMENTS=$(cat coverage/coverage-summary.json | grep -oP '"statements":\{"total":\d+,"covered":\d+,"skipped":\d+,"pct":\K[0-9.]+' | head -1 || echo "0")
    BRANCHES=$(cat coverage/coverage-summary.json | grep -oP '"branches":\{"total":\d+,"covered":\d+,"skipped":\d+,"pct":\K[0-9.]+' | head -1 || echo "0")
    FUNCTIONS=$(cat coverage/coverage-summary.json | grep -oP '"functions":\{"total":\d+,"covered":\d+,"skipped":\d+,"pct":\K[0-9.]+' | head -1 || echo "0")
    LINES=$(cat coverage/coverage-summary.json | grep -oP '"lines":\{"total":\d+,"covered":\d+,"skipped":\d+,"pct":\K[0-9.]+' | head -1 || echo "0")

    echo ""
    echo "📈 Coverage Summary:"
    echo "  Statements: $STATEMENTS%"
    echo "  Branches:   $BRANCHES%"
    echo "  Functions:  $FUNCTIONS%"
    echo "  Lines:      $LINES%"
    echo ""

    # Check if coverage meets thresholds
    THRESHOLD=80
    BELOW_THRESHOLD=0

    if (( $(echo "$STATEMENTS < $THRESHOLD" | bc -l) )); then
      echo "⚠️  Statements coverage below $THRESHOLD%"
      BELOW_THRESHOLD=1
    fi

    if (( $(echo "$BRANCHES < 75" | bc -l) )); then
      echo "⚠️  Branches coverage below 75%"
      BELOW_THRESHOLD=1
    fi

    if (( $(echo "$FUNCTIONS < $THRESHOLD" | bc -l) )); then
      echo "⚠️  Functions coverage below $THRESHOLD%"
      BELOW_THRESHOLD=1
    fi

    if (( $(echo "$LINES < $THRESHOLD" | bc -l) )); then
      echo "⚠️  Lines coverage below $THRESHOLD%"
      BELOW_THRESHOLD=1
    fi

    if [ $BELOW_THRESHOLD -eq 1 ]; then
      echo ""
      echo "💡 Tip: Add more tests to improve coverage"
      echo "   Coverage report: coverage/index.html"
    else
      echo "✅ All coverage thresholds met!"
    fi
  fi

  # Open coverage report in browser (optional)
  if [ -f "coverage/index.html" ]; then
    echo ""
    echo "📄 Coverage report available at:"
    echo "   file://$(pwd)/coverage/index.html"

    # Uncomment to auto-open in browser
    # if command -v open &> /dev/null; then
    #   open coverage/index.html
    # elif command -v xdg-open &> /dev/null; then
    #   xdg-open coverage/index.html
    # fi
  fi
else
  echo "⚠️  Could not generate coverage report"
fi

# Update test metrics
echo ""
echo "📊 Updating test metrics..."

if command -v npx &> /dev/null; then
  if [ -f "package.json" ] && grep -q '"miyabi"' package.json; then
    npx miyabi metrics test-results --exit-code $TEST_EXIT_CODE --silent 2>/dev/null || true
    echo "✅ Metrics updated"
  fi
fi

# Archive test results
echo ""
echo "💾 Archiving test results..."

if [ ! -d ".ai/test-results" ]; then
  mkdir -p .ai/test-results
fi

TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
TEST_ARCHIVE=".ai/test-results/test-$TIMESTAMP"

if [ -f "coverage/coverage-summary.json" ]; then
  mkdir -p "$TEST_ARCHIVE"
  cp coverage/coverage-summary.json "$TEST_ARCHIVE/"
  echo "✅ Test results archived to $TEST_ARCHIVE"
fi

# Cleanup old archives (keep last 30 days)
find .ai/test-results -type d -mtime +30 -exec rm -rf {} + 2>/dev/null || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ Post-test processing complete"
  echo "🌸 All tests passed successfully!"
else
  echo "❌ Post-test processing complete"
  echo "🌸 Fix failing tests and try again"
fi

echo ""

exit 0
