#!/bin/bash
# Miyabi Pre-PR Hook
# Verify PR readiness before creation

set -e

echo "🌸 Miyabi Pre-PR Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
TARGET_BRANCH=${1:-main}

echo "📋 PR Check: $CURRENT_BRANCH → $TARGET_BRANCH"
echo ""

# Check if branch is up to date with target
echo "🔍 Checking if branch is up to date..."
git fetch origin $TARGET_BRANCH --quiet

if ! git merge-base --is-ancestor origin/$TARGET_BRANCH HEAD; then
  echo "⚠️  Warning: Branch is behind origin/$TARGET_BRANCH"
  echo ""
  echo "Recommended actions:"
  echo "  1. git fetch origin $TARGET_BRANCH"
  echo "  2. git rebase origin/$TARGET_BRANCH"
  echo "  3. Resolve any conflicts"
  echo "  4. Try creating PR again"
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  echo "✅ Branch is up to date with origin/$TARGET_BRANCH"
fi

# Verify tests pass
echo ""
echo "🧪 Running tests..."
if npm test; then
  echo "✅ All tests passed"
else
  echo "❌ Tests failed"
  echo ""
  echo "Fix failing tests before creating PR."
  exit 1
fi

# Check test coverage
echo ""
echo "📊 Checking test coverage..."
if npm run test -- --coverage --reporter=json > coverage-summary.json 2>/dev/null; then
  COVERAGE=$(cat coverage-summary.json | grep -oP '"statements":\{"pct":\K[0-9.]+' | head -1 || echo "0")
  rm -f coverage-summary.json

  if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
    echo "✅ Coverage: $COVERAGE% (>= 80%)"
  else
    echo "⚠️  Coverage: $COVERAGE% (< 80%)"
    echo ""
    read -p "Coverage is below 80%. Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
fi

# Verify commit messages follow Conventional Commits
echo ""
echo "📝 Checking commit messages..."
COMMITS=$(git log origin/$TARGET_BRANCH..HEAD --oneline)
INVALID_COMMITS=$(echo "$COMMITS" | grep -v -E "^[a-f0-9]+ (feat|fix|docs|style|refactor|perf|test|chore|ci|build)(\(.+\))?: .+" || true)

if [ -n "$INVALID_COMMITS" ]; then
  echo "⚠️  Some commits don't follow Conventional Commits format:"
  echo "$INVALID_COMMITS"
  echo ""
  echo "Expected format: type(scope): description"
  echo "Example: feat(auth): add login functionality"
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  echo "✅ All commits follow Conventional Commits"
fi

# Check for merge conflicts
echo ""
echo "🔍 Checking for merge conflicts..."
if git merge-tree $(git merge-base origin/$TARGET_BRANCH HEAD) origin/$TARGET_BRANCH HEAD | grep -q "<<<<<<<"; then
  echo "⚠️  Potential merge conflicts detected"
  echo ""
  echo "Rebase your branch to resolve conflicts:"
  echo "  git rebase origin/$TARGET_BRANCH"
  exit 1
else
  echo "✅ No merge conflicts detected"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All pre-PR checks passed!"
echo ""
echo "Ready to create PR:"
echo "  Branch: $CURRENT_BRANCH → $TARGET_BRANCH"
echo "  Commits: $(git log origin/$TARGET_BRANCH..HEAD --oneline | wc -l)"
echo ""
echo "Create PR with:"
echo "  gh pr create --title \"Your PR title\" --body \"Description\""
echo ""
echo "🌸 Good luck with your PR!"

exit 0
