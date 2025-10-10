# Test Improvement Plan

**Created**: 2025-10-10
**Status**: Active
**Current Coverage**: 86.3% (202/234 tests passing)

## Executive Summary

This document outlines the strategy to improve test reliability and coverage for the Miyabi autonomous development platform. The main focus is on refactoring failing tests while maintaining or improving overall coverage.

## Current Status

### Test Suite Overview

| Category | Passing | Failing | Total | Pass Rate |
|----------|---------|---------|-------|-----------|
| E2E Workflows | 7 | 0 | 7 | 100% ✅ |
| System Integration | 13 | 0 | 13 | 100% ✅ |
| Claude Config | 9 | 32 | 41 | 22% ⚠️ |
| GitHub Integration | 4 | 6 | 10 | 40% ⚠️ |
| Other Tests | 169 | 0 | 169 | 100% ✅ |
| **TOTAL** | **202** | **38** | **234** | **86.3%** |

### Critical Issues

1. **Claude Config Tests** (`packages/cli/src/setup/__tests__/claude-config.test.ts`)
   - **Problem**: Complex path validation mocking
   - **Impact**: 32 failing tests
   - **Priority**: High
   - **Status**: Needs refactoring

2. **GitHub Integration Tests** (`tests/integration/github-os-integration.test.ts`)
   - **Problem**: Missing GITHUB_TOKEN in test environment
   - **Impact**: 6 failing tests
   - **Priority**: Medium
   - **Status**: Needs environment setup

3. **GitHub Projects Client** (`packages/github-projects/src/client.test.ts`)
   - **Problem**: Client initialization or mocking issues
   - **Impact**: Unknown (test file failing)
   - **Priority**: Medium
   - **Status**: Needs investigation

## Improvement Strategy

### Phase 1: Quick Wins (Week 1)

#### 1.1 GitHub Integration Tests
**Goal**: Fix environment-dependent tests

**Actions**:
- [ ] Create `.env.test` with mock tokens
- [ ] Add test fixtures for GitHub API responses
- [ ] Mock GitHub API calls instead of requiring real tokens
- [ ] Add skip logic for integration tests without credentials

**Files**:
- `tests/integration/github-os-integration.test.ts`

**Expected Impact**: +6 passing tests (→ 208/234, 88.9%)

#### 1.2 GitHub Projects Client
**Goal**: Identify and fix client test issues

**Actions**:
- [ ] Review test failure details
- [ ] Fix import/export issues
- [ ] Add proper mocking for Octokit
- [ ] Ensure test isolation

**Files**:
- `packages/github-projects/src/client.test.ts`

**Expected Impact**: Depends on test count in file

### Phase 2: Major Refactoring (Week 2-3)

#### 2.1 Claude Config Test Refactoring
**Goal**: Replace path mocking with real filesystem operations

**Current Approach** (Problematic):
```typescript
// Complex mocking that doesn't handle all edge cases
vi.mock('path');
vi.mocked(path.normalize).mockImplementation(/* ... */);
```

**New Approach** (Recommended):
```typescript
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

describe('claude-config', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create real temp directory
    tempDir = await mkdtemp(join(tmpdir(), 'miyabi-test-'));
  });

  afterEach(async () => {
    // Clean up
    await rm(tempDir, { recursive: true, force: true });
  });

  it('should deploy .claude directory', async () => {
    // Use real filesystem with temp directory
    await deployClaudeConfig({
      projectPath: tempDir,
      projectName: 'test-project'
    });

    // Verify files exist
    expect(existsSync(join(tempDir, '.claude'))).toBe(true);
    expect(existsSync(join(tempDir, 'CLAUDE.md'))).toBe(true);
  });
});
```

**Benefits**:
- Tests actual filesystem behavior
- No complex mocking
- More reliable and maintainable
- Catches real path issues

**Actions**:
- [ ] Create test helper for temp directory management
- [ ] Refactor deployClaudeConfig tests
- [ ] Refactor copyDirectoryRecursive tests
- [ ] Refactor deployClaudeConfigToGitHub tests (with GitHub API mocking)
- [ ] Refactor collectDirectoryFiles tests
- [ ] Refactor verifyClaudeConfig tests

**Files**:
- `packages/cli/src/setup/__tests__/claude-config.test.ts`
- New: `packages/cli/src/setup/__tests__/helpers/temp-fs.ts`

**Expected Impact**: +32 passing tests (→ 234/234, 100%)

### Phase 3: Coverage Expansion (Week 4)

#### 3.1 Add Missing Test Cases
**Goal**: Achieve 90%+ coverage

**Actions**:
- [ ] Identify uncovered code paths with `npm run test:coverage`
- [ ] Add tests for error handling
- [ ] Add tests for edge cases
- [ ] Add tests for new features

#### 3.2 Performance Testing
**Goal**: Add performance benchmarks

**Actions**:
- [ ] Add benchmark tests for agent execution
- [ ] Add load tests for parallel operations
- [ ] Add memory leak detection tests

#### 3.3 End-to-End Scenarios
**Goal**: Add more real-world E2E tests

**Actions**:
- [ ] Complete Issue → PR workflow
- [ ] Multi-agent coordination scenarios
- [ ] Error recovery scenarios
- [ ] Long-running task scenarios

## Implementation Guidelines

### Test Structure Standards

```typescript
/**
 * Test file naming: *.test.ts
 * Location: Adjacent to source file or in tests/
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';

describe('ComponentName', () => {
  // Group related tests
  describe('methodName', () => {
    // Setup
    beforeEach(() => {
      // Initialize test data
    });

    // Cleanup
    afterEach(() => {
      // Clean up resources
    });

    // Test cases
    test('should handle normal case', () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = methodName(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });

    test('should handle error case', () => {
      expect(() => methodName(invalidInput)).toThrow();
    });

    test('should handle edge case', () => {
      // Test boundary conditions
    });
  });
});
```

### Mocking Best Practices

1. **Mock External Dependencies**
   ```typescript
   vi.mock('@octokit/rest');
   ```

2. **Use Real Filesystem for File Operations**
   ```typescript
   // Instead of mocking fs
   const tempDir = await mkdtemp(join(tmpdir(), 'test-'));
   ```

3. **Mock Network Calls**
   ```typescript
   vi.mocked(fetch).mockResolvedValue(mockResponse);
   ```

4. **Avoid Over-Mocking**
   - Mock only what's necessary
   - Use real implementations when safe

### Test Data Management

```typescript
// tests/fixtures/index.ts
export const mockIssue = {
  number: 123,
  title: 'Test issue',
  body: 'Test description',
  labels: ['bug', 'priority:high']
};

export const mockPR = {
  number: 456,
  title: 'Test PR',
  state: 'open'
};
```

## Success Metrics

### Short-term (Week 1-2)
- [ ] Pass rate: 90%+ (210/234 tests)
- [ ] GitHub integration tests: 100%
- [ ] E2E tests: 100%
- [ ] System integration: 100%

### Medium-term (Week 3-4)
- [ ] Pass rate: 95%+ (222/234 tests)
- [ ] Claude config tests: 80%+
- [ ] Code coverage: 85%+

### Long-term (Month 2+)
- [ ] Pass rate: 100% (234/234 tests)
- [ ] Code coverage: 90%+
- [ ] Performance benchmarks established
- [ ] E2E coverage: 20+ scenarios

## Risk Assessment

### High Risk
- **Claude Config Refactoring**: Large scope, could break existing functionality
  - **Mitigation**: Incremental refactoring, keep old tests until new ones pass

### Medium Risk
- **GitHub API Mocking**: Complex API interactions
  - **Mitigation**: Use recorded fixtures, comprehensive test cases

### Low Risk
- **Environment Setup**: Simple configuration
  - **Mitigation**: Clear documentation, example files

## Timeline

```
Week 1: GitHub Integration + Quick Wins
├─ Day 1-2: Environment setup
├─ Day 3-4: GitHub integration tests
└─ Day 5: Validation and documentation

Week 2-3: Claude Config Refactoring
├─ Day 1-3: Create temp filesystem helpers
├─ Day 4-7: Refactor deployClaudeConfig tests
├─ Day 8-10: Refactor remaining claude-config tests
└─ Day 11-12: Integration and validation

Week 4: Coverage Expansion
├─ Day 1-2: Coverage analysis
├─ Day 3-4: Add missing test cases
└─ Day 5: Performance testing setup
```

## Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Node.js Testing Guide](https://nodejs.org/en/docs/guides/testing)

### Tools
- **Vitest**: Test runner
- **V8 Coverage**: Code coverage
- **tsx**: TypeScript execution
- **temp**: Temporary directory management

### Team
- **Primary**: Development team
- **Reviewer**: Tech lead
- **Stakeholder**: Project maintainer

## Appendix

### A. Test Helper Template

```typescript
// tests/helpers/temp-fs.ts
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export async function createTempDir(prefix: string = 'miyabi-test-'): Promise<string> {
  return await mkdtemp(join(tmpdir(), prefix));
}

export async function cleanupTempDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
}

export function withTempDir(testFn: (dir: string) => Promise<void>) {
  return async () => {
    const dir = await createTempDir();
    try {
      await testFn(dir);
    } finally {
      await cleanupTempDir(dir);
    }
  };
}
```

### B. GitHub API Mock Template

```typescript
// tests/mocks/github-api.ts
export const mockOctokit = {
  repos: {
    get: vi.fn().mockResolvedValue({
      data: { name: 'test-repo', owner: { login: 'test-owner' } }
    }),
    create: vi.fn().mockResolvedValue({
      data: { name: 'new-repo', html_url: 'https://github.com/...' }
    })
  },
  issues: {
    create: vi.fn().mockResolvedValue({
      data: { number: 123, title: 'Test Issue' }
    })
  }
};
```

### C. Fixture Example

```typescript
// tests/fixtures/github-responses.ts
export const issueResponse = {
  id: 1,
  number: 123,
  title: 'Test Issue',
  body: 'Test description',
  state: 'open',
  labels: [
    { name: 'bug', color: 'd73a4a' },
    { name: 'priority:high', color: 'e99695' }
  ],
  user: { login: 'test-user', id: 456 },
  created_at: '2025-10-10T00:00:00Z',
  updated_at: '2025-10-10T00:00:00Z'
};
```

---

**Last Updated**: 2025-10-10
**Next Review**: 2025-10-17

For questions or suggestions, please open an issue or contact the maintainers.
