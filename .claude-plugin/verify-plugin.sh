#!/bin/bash

echo "🌸 Miyabi Plugin Verification"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 (missing)"
        ((errors++))
        return 1
    fi
}

# Function to validate JSON
validate_json() {
    if [ -f "$1" ]; then
        if python3 -m json.tool "$1" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} $1 (valid JSON)"
            return 0
        else
            echo -e "${RED}✗${NC} $1 (invalid JSON)"
            ((errors++))
            return 1
        fi
    else
        echo -e "${RED}✗${NC} $1 (missing)"
        ((errors++))
        return 1
    fi
}

echo "📋 1. Required Files Check"
echo "----------------------------"
check_file "plugin.json"
check_file "marketplace.json"
check_file "README.md"
check_file "instructions.md"
check_file "context.md"
check_file "ignore.txt"
echo ""

echo "📋 2. JSON Validation"
echo "----------------------------"
validate_json "plugin.json"
validate_json "marketplace.json"
validate_json "commands.json"
validate_json "project.json"
echo ""

echo "📋 3. Commands Check"
echo "----------------------------"
cmd_count=$(find commands -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
echo "Found $cmd_count command files"
if [ "$cmd_count" -ge 8 ]; then
    echo -e "${GREEN}✓${NC} Commands directory ($cmd_count files)"
else
    echo -e "${YELLOW}⚠${NC} Expected at least 8 command files, found $cmd_count"
    ((warnings++))
fi

for cmd in commands/*.md; do
    if [ -f "$cmd" ]; then
        echo -e "${GREEN}  ✓${NC} $(basename $cmd)"
    fi
done
echo ""

echo "📋 4. Agents Check"
echo "----------------------------"
agent_count=$(find agents -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
echo "Found $agent_count agent files"
if [ "$agent_count" -ge 7 ]; then
    echo -e "${GREEN}✓${NC} Agents directory ($agent_count files)"
else
    echo -e "${YELLOW}⚠${NC} Expected 7 agent files, found $agent_count"
    ((warnings++))
fi

for agent in agents/*.md; do
    if [ -f "$agent" ]; then
        echo -e "${GREEN}  ✓${NC} $(basename $agent)"
    fi
done
echo ""

echo "📋 5. Hooks Check"
echo "----------------------------"
hook_count=$(find hooks -name "*.sh" -type f 2>/dev/null | wc -l | tr -d ' ')
echo "Found $hook_count hook files"
if [ "$hook_count" -ge 4 ]; then
    echo -e "${GREEN}✓${NC} Hooks directory ($hook_count files)"
else
    echo -e "${YELLOW}⚠${NC} Expected 4 hook files, found $hook_count"
    ((warnings++))
fi

for hook in hooks/*.sh; do
    if [ -f "$hook" ]; then
        if [ -x "$hook" ]; then
            echo -e "${GREEN}  ✓${NC} $(basename $hook) (executable)"
        else
            echo -e "${YELLOW}  ⚠${NC} $(basename $hook) (not executable)"
            ((warnings++))
        fi
    fi
done
echo ""

echo "📋 6. Version Consistency Check"
echo "----------------------------"
plugin_version=$(grep -o '"version": *"[^"]*"' plugin.json | head -1 | grep -o '"[^"]*"$' | tr -d '"')
marketplace_version=$(grep -o '"version": *"[^"]*"' marketplace.json | head -1 | grep -o '"[^"]*"$' | tr -d '"')
project_version=$(grep -o '"version": *"[^"]*"' project.json | head -1 | grep -o '"[^"]*"$' | tr -d '"')

echo "plugin.json:      $plugin_version"
echo "marketplace.json: $marketplace_version"
echo "project.json:     $project_version"

if [ "$plugin_version" = "$marketplace_version" ] && [ "$plugin_version" = "$project_version" ]; then
    echo -e "${GREEN}✓${NC} All versions match ($plugin_version)"
else
    echo -e "${RED}✗${NC} Version mismatch detected"
    ((errors++))
fi
echo ""

echo "📋 7. Content Validation"
echo "----------------------------"

# Check plugin.json has required fields
if grep -q '"name"' plugin.json && grep -q '"description"' plugin.json && grep -q '"version"' plugin.json; then
    echo -e "${GREEN}✓${NC} plugin.json has required fields"
else
    echo -e "${RED}✗${NC} plugin.json missing required fields"
    ((errors++))
fi

# Check marketplace.json has plugins array
if grep -q '"plugins"' marketplace.json; then
    echo -e "${GREEN}✓${NC} marketplace.json has plugins array"
else
    echo -e "${RED}✗${NC} marketplace.json missing plugins array"
    ((errors++))
fi

# Check README.md is not empty
readme_size=$(wc -c < README.md 2>/dev/null || echo 0)
if [ "$readme_size" -gt 1000 ]; then
    echo -e "${GREEN}✓${NC} README.md has substantial content ($readme_size bytes)"
else
    echo -e "${YELLOW}⚠${NC} README.md seems small ($readme_size bytes)"
    ((warnings++))
fi
echo ""

echo "================================"
echo "📊 Summary"
echo "================================"
echo -e "Errors:   ${RED}$errors${NC}"
echo -e "Warnings: ${YELLOW}$warnings${NC}"
echo ""

if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ Plugin verification passed!${NC}"
    echo ""
    echo "🚀 Ready to distribute. Users can install with:"
    echo "   /plugin marketplace add ShunsukeHayashi/Miyabi"
    echo "   /plugin install miyabi"
    exit 0
else
    echo -e "${RED}❌ Plugin verification failed with $errors error(s)${NC}"
    echo ""
    echo "Please fix the errors above before distributing."
    exit 1
fi
