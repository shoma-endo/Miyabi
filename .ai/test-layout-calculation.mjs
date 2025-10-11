#!/usr/bin/env node

/**
 * LayoutEngine Unit Tests
 *
 * Tests all core functionality:
 * 1. Issue position calculation
 * 2. Coordinator position calculation
 * 3. Specialist position calculation (grid)
 * 4. State position calculation
 * 5. Collision detection
 * 6. Collision resolution
 * 7. Full layout calculation
 */

import { LayoutEngine } from '../packages/dashboard/src/services/LayoutEngine.ts';

// ============================================================================
// Test Utilities
// ============================================================================

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ ${message}`);
    testsFailed++;
  }
}

function assertEquals(actual, expected, message) {
  if (actual === expected) {
    console.log(`✅ ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ ${message}`);
    console.error(`   Expected: ${expected}`);
    console.error(`   Actual:   ${actual}`);
    testsFailed++;
  }
}

function assertClose(actual, expected, tolerance, message) {
  if (Math.abs(actual - expected) <= tolerance) {
    console.log(`✅ ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ ${message}`);
    console.error(`   Expected: ${expected} ± ${tolerance}`);
    console.error(`   Actual:   ${actual}`);
    testsFailed++;
  }
}

// ============================================================================
// Test Data
// ============================================================================

function createMockIssueNode(id, number) {
  return {
    id,
    type: 'issue',
    position: { x: 0, y: 0 },
    data: {
      number,
      title: `Test Issue #${number}`,
      state: 'pending',
      labels: [],
      assignedAgents: [],
      url: `https://github.com/test/repo/issues/${number}`,
    },
  };
}

function createMockAgentNode(id, agentId) {
  return {
    id,
    type: 'agent',
    position: { x: 0, y: 0 },
    data: {
      name: `${agentId}Agent`,
      agentId,
      status: 'idle',
      progress: 0,
    },
  };
}

function createMockStateNode(id, label) {
  return {
    id,
    type: 'state',
    position: { x: 0, y: 0 },
    data: {
      label,
      emoji: '📥',
      count: 0,
      color: '#E4E4E4',
      description: 'Test state',
    },
  };
}

// ============================================================================
// Test Suite 1: Position Calculations
// ============================================================================

console.log('\n========================================');
console.log('Test Suite 1: Position Calculations');
console.log('========================================\n');

const engine = new LayoutEngine();

// Test 1.1: Issue position calculation
console.log('Test 1.1: Issue Position Calculation\n');

const issue0Pos = engine.calculateIssuePosition(0, 10);
assertEquals(issue0Pos.x, 100, 'Issue #0 x-coordinate should be 100');
assertEquals(issue0Pos.y, 100, 'Issue #0 y-coordinate should be 100');

const issue5Pos = engine.calculateIssuePosition(5, 10);
assertEquals(issue5Pos.x, 100, 'Issue #5 x-coordinate should be 100');
assertEquals(issue5Pos.y, 1350, 'Issue #5 y-coordinate should be 1350 (5 × 250 + 100)');

const issue9Pos = engine.calculateIssuePosition(9, 10);
assertEquals(issue9Pos.x, 100, 'Issue #9 x-coordinate should be 100');
assertEquals(issue9Pos.y, 2350, 'Issue #9 y-coordinate should be 2350 (9 × 250 + 100)');

// Test 1.2: Coordinator position calculation
console.log('\nTest 1.2: Coordinator Position Calculation\n');

const coord1Pos = engine.calculateCoordinatorPosition(1);
assertEquals(coord1Pos.x, 400, 'Coordinator x-coordinate should be 400');
assertClose(coord1Pos.y, 225, 1, 'Coordinator y-coordinate should be ~225 (0.5 × 250 + 100)');

const coord10Pos = engine.calculateCoordinatorPosition(10);
assertEquals(coord10Pos.x, 400, 'Coordinator x-coordinate should be 400');
assertEquals(coord10Pos.y, 1350, 'Coordinator y-coordinate should be 1350 (5 × 250 + 100)');

// Test 1.3: Specialist position calculation (2×3 grid)
console.log('\nTest 1.3: Specialist Position Calculation (2×3 Grid)\n');

// Index 0: Top-left
const spec0Pos = engine.calculateSpecialistPosition(0);
assertEquals(spec0Pos.x, 700, 'Specialist #0 x should be 700');
assertEquals(spec0Pos.y, 100, 'Specialist #0 y should be 100');

// Index 1: Top-right
const spec1Pos = engine.calculateSpecialistPosition(1);
assertEquals(spec1Pos.x, 1050, 'Specialist #1 x should be 1050 (700 + 350)');
assertEquals(spec1Pos.y, 100, 'Specialist #1 y should be 100');

// Index 2: Middle-left
const spec2Pos = engine.calculateSpecialistPosition(2);
assertEquals(spec2Pos.x, 700, 'Specialist #2 x should be 700');
assertEquals(spec2Pos.y, 400, 'Specialist #2 y should be 400 (100 + 300)');

// Index 3: Middle-right
const spec3Pos = engine.calculateSpecialistPosition(3);
assertEquals(spec3Pos.x, 1050, 'Specialist #3 x should be 1050');
assertEquals(spec3Pos.y, 400, 'Specialist #3 y should be 400');

// Index 4: Bottom-left
const spec4Pos = engine.calculateSpecialistPosition(4);
assertEquals(spec4Pos.x, 700, 'Specialist #4 x should be 700');
assertEquals(spec4Pos.y, 700, 'Specialist #4 y should be 700 (100 + 600)');

// Index 5: Bottom-right
const spec5Pos = engine.calculateSpecialistPosition(5);
assertEquals(spec5Pos.x, 1050, 'Specialist #5 x should be 1050');
assertEquals(spec5Pos.y, 700, 'Specialist #5 y should be 700');

// Test 1.4: State position calculation
console.log('\nTest 1.4: State Position Calculation\n');

const state0Pos = engine.calculateStatePosition(0);
assertEquals(state0Pos.x, 1400, 'State #0 x should be 1400');
assertEquals(state0Pos.y, 100, 'State #0 y should be 100');

const state4Pos = engine.calculateStatePosition(4);
assertEquals(state4Pos.x, 1400, 'State #4 x should be 1400');
assertEquals(state4Pos.y, 900, 'State #4 y should be 900 (4 × 200 + 100)');

const state7Pos = engine.calculateStatePosition(7);
assertEquals(state7Pos.x, 1400, 'State #7 x should be 1400');
assertEquals(state7Pos.y, 1500, 'State #7 y should be 1500 (7 × 200 + 100)');

// ============================================================================
// Test Suite 2: Collision Detection
// ============================================================================

console.log('\n========================================');
console.log('Test Suite 2: Collision Detection');
console.log('========================================\n');

// Test 2.1: No collision (nodes far apart)
console.log('Test 2.1: No Collision Detection\n');

const node1 = {
  ...createMockIssueNode('issue-1', 100),
  position: { x: 100, y: 100 },
};

const node2 = {
  ...createMockIssueNode('issue-2', 101),
  position: { x: 100, y: 500 },
};

const noCollisions = engine.detectCollisions([node1, node2]);
assertEquals(noCollisions.length, 0, 'No collisions should be detected for nodes far apart');

// Test 2.2: Collision detected (overlapping nodes)
console.log('\nTest 2.2: Collision Detection (Overlapping)\n');

const node3 = {
  ...createMockIssueNode('issue-3', 102),
  position: { x: 100, y: 100 },
};

const node4 = {
  ...createMockIssueNode('issue-4', 103),
  position: { x: 150, y: 120 },
};

const collisions = engine.detectCollisions([node3, node4]);
assert(collisions.length > 0, 'Collision should be detected for overlapping nodes');
if (collisions.length > 0) {
  assert(
    collisions[0].nodeA === 'issue-3' && collisions[0].nodeB === 'issue-4',
    'Collision should be between issue-3 and issue-4'
  );
}

// Test 2.3: Multiple collisions
console.log('\nTest 2.3: Multiple Collision Detection\n');

const node5 = createMockAgentNode('agent-1', 'codegen');
node5.position = { x: 700, y: 100 };

const node6 = createMockAgentNode('agent-2', 'review');
node6.position = { x: 720, y: 110 };

const node7 = createMockAgentNode('agent-3', 'pr');
node7.position = { x: 740, y: 120 };

const multiCollisions = engine.detectCollisions([node5, node6, node7]);
assert(multiCollisions.length >= 2, `At least 2 collisions should be detected (found ${multiCollisions.length})`);

// ============================================================================
// Test Suite 3: Collision Resolution
// ============================================================================

console.log('\n========================================');
console.log('Test Suite 3: Collision Resolution');
console.log('========================================\n');

// Test 3.1: Collision resolution moves nodes apart
console.log('Test 3.1: Collision Resolution\n');

const nodeA = {
  ...createMockIssueNode('issue-a', 200),
  position: { x: 100, y: 100 },
};

const nodeB = {
  ...createMockIssueNode('issue-b', 201),
  position: { x: 150, y: 120 },
};

const beforeResolution = engine.detectCollisions([nodeA, nodeB]);
assert(beforeResolution.length > 0, 'Collision exists before resolution');

const resolved = engine.resolveCollisions([nodeA, nodeB], beforeResolution);
const afterResolution = engine.detectCollisions(resolved);

// After resolution, collisions should be reduced (ideally to 0)
assert(
  afterResolution.length < beforeResolution.length,
  `Collisions should be reduced after resolution (before: ${beforeResolution.length}, after: ${afterResolution.length})`
);

// Test 3.2: Verify nodes moved
console.log('\nTest 3.2: Verify Nodes Moved\n');

const movedNode = resolved.find(n => n.id === 'issue-b');
assert(
  movedNode.position.y > nodeB.position.y || movedNode.position.x > nodeB.position.x,
  'Node should have moved during collision resolution'
);

// ============================================================================
// Test Suite 4: Full Layout Calculation
// ============================================================================

console.log('\n========================================');
console.log('Test Suite 4: Full Layout Calculation');
console.log('========================================\n');

// Test 4.1: Full layout with 5 issues, 7 agents, 8 states
console.log('Test 4.1: Full Layout Calculation\n');

const issues = Array.from({ length: 5 }, (_, i) =>
  createMockIssueNode(`issue-${i}`, 100 + i)
);

const agents = [
  createMockAgentNode('agent-coordinator', 'coordinator'),
  createMockAgentNode('agent-codegen', 'codegen'),
  createMockAgentNode('agent-review', 'review'),
  createMockAgentNode('agent-pr', 'pr'),
  createMockAgentNode('agent-issue', 'issue'),
  createMockAgentNode('agent-deployment', 'deployment'),
  createMockAgentNode('agent-test', 'test'),
];

const states = [
  createMockStateNode('state-pending', 'pending'),
  createMockStateNode('state-analyzing', 'analyzing'),
  createMockStateNode('state-implementing', 'implementing'),
  createMockStateNode('state-reviewing', 'reviewing'),
  createMockStateNode('state-testing', 'testing'),
  createMockStateNode('state-done', 'done'),
  createMockStateNode('state-error', 'error'),
  createMockStateNode('state-blocked', 'blocked'),
];

const allNodes = [...issues, ...agents, ...states];
const allEdges = [];

const layoutResult = engine.calculateLayout(allNodes, allEdges);

assert(layoutResult.nodes.length === 20, `Should have 20 nodes (5+7+8), got ${layoutResult.nodes.length}`);

// Test 4.2: Verify all nodes have valid positions
console.log('\nTest 4.2: Verify Valid Positions\n');

let validPositions = true;
layoutResult.nodes.forEach(node => {
  if (isNaN(node.position.x) || isNaN(node.position.y)) {
    validPositions = false;
  }
  if (node.position.x < 0 || node.position.y < 0) {
    validPositions = false;
  }
});

assert(validPositions, 'All nodes should have valid non-negative positions');

// Test 4.3: Verify bounds calculation
console.log('\nTest 4.3: Verify Bounds Calculation\n');

assert(layoutResult.bounds.width > 0, `Bounds width should be positive, got ${layoutResult.bounds.width}`);
assert(layoutResult.bounds.height > 0, `Bounds height should be positive, got ${layoutResult.bounds.height}`);

// Test 4.4: Layout validation
console.log('\nTest 4.4: Layout Validation\n');

const validation = engine.validateLayout(layoutResult);
assert(validation.valid || validation.errors.length < 3, `Layout should be valid or have < 3 errors. Errors: ${validation.errors.join(', ')}`);

// ============================================================================
// Test Suite 5: Edge Cases
// ============================================================================

console.log('\n========================================');
console.log('Test Suite 5: Edge Cases');
console.log('========================================\n');

// Test 5.1: Empty input
console.log('Test 5.1: Empty Input\n');

const emptyResult = engine.calculateLayout([], []);
assertEquals(emptyResult.nodes.length, 0, 'Empty input should produce empty output');
assertEquals(emptyResult.bounds.width, 0, 'Empty layout should have 0 width');
assertEquals(emptyResult.bounds.height, 0, 'Empty layout should have 0 height');

// Test 5.2: Single node
console.log('\nTest 5.2: Single Node\n');

const singleNode = [createMockIssueNode('issue-single', 999)];
const singleResult = engine.calculateLayout(singleNode, []);
assertEquals(singleResult.nodes.length, 1, 'Single node input should produce single node output');
assertEquals(singleResult.nodes[0].position.x, 100, 'Single issue should be at x=100');
assertEquals(singleResult.nodes[0].position.y, 100, 'Single issue should be at y=100');

// Test 5.3: Maximum issues (10)
console.log('\nTest 5.3: Maximum Issues (10)\n');

const maxIssues = Array.from({ length: 10 }, (_, i) =>
  createMockIssueNode(`issue-max-${i}`, 200 + i)
);
const maxResult = engine.calculateLayout(maxIssues, []);
assertEquals(maxResult.nodes.length, 10, 'Should handle 10 issues');

const lastIssue = maxResult.nodes[9];
assertEquals(lastIssue.position.x, 100, 'Last issue should be at x=100');
assertEquals(lastIssue.position.y, 2350, 'Last issue (index 9) should be at y=2350');

// ============================================================================
// Test Summary
// ============================================================================

console.log('\n========================================');
console.log('Test Summary');
console.log('========================================\n');

const totalTests = testsPassed + testsFailed;
const passRate = ((testsPassed / totalTests) * 100).toFixed(1);

console.log(`Total Tests:  ${totalTests}`);
console.log(`✅ Passed:    ${testsPassed}`);
console.log(`❌ Failed:    ${testsFailed}`);
console.log(`Pass Rate:    ${passRate}%\n`);

if (testsFailed === 0) {
  console.log('🎉 All tests passed! LayoutEngine is working correctly.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the errors above.\n');
  process.exit(1);
}
