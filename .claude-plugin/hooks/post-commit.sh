#!/bin/bash
# Miyabi Post-Commit Hook
# Notify about commit and update project state

set -e

echo "🌸 Miyabi Post-Commit Hook"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get commit information
COMMIT_HASH=$(git log -1 --pretty=%H)
COMMIT_HASH_SHORT=$(git log -1 --pretty=%h)
COMMIT_MESSAGE=$(git log -1 --pretty=%B)
COMMIT_AUTHOR=$(git log -1 --pretty=%an)
COMMIT_DATE=$(git log -1 --pretty=%ad --date=short)

# Display commit info
echo "📝 Commit successful!"
echo ""
echo "Hash: $COMMIT_HASH_SHORT"
echo "Author: $COMMIT_AUTHOR"
echo "Date: $COMMIT_DATE"
echo ""
echo "Message:"
echo "$COMMIT_MESSAGE"
echo ""

# Count files changed
FILES_CHANGED=$(git diff-tree --no-commit-id --name-only -r HEAD | wc -l)
INSERTIONS=$(git show --stat HEAD | tail -1 | grep -oP '\d+(?= insertion)' || echo "0")
DELETIONS=$(git show --stat HEAD | tail -1 | grep -oP '\d+(?= deletion)' || echo "0")

echo "📊 Changes:"
echo "  Files: $FILES_CHANGED"
echo "  Insertions: +$INSERTIONS"
echo "  Deletions: -$DELETIONS"
echo ""

# Check if main/master branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
  echo "⚠️  Warning: Direct commit to $CURRENT_BRANCH branch"
  echo "   Consider using feature branches and Pull Requests"
  echo ""
fi

# Optional: Update project metrics
if command -v npx &> /dev/null; then
  if [ -f "package.json" ] && grep -q '"miyabi"' package.json; then
    echo "📊 Updating project metrics..."
    npx miyabi metrics update --silent 2>/dev/null || true
  fi
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Commit recorded successfully"
echo "🌸 Next: git push origin $CURRENT_BRANCH"
echo ""

exit 0
