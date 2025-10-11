#!/usr/bin/env node

/**
 * Event Validation Tests
 *
 * Tests all Zod schemas and validation functions:
 * 1. Basic schema validation (AgentId, Progress, Timestamp, etc.)
 * 2. Event-specific schema validation (10 events)
 * 3. Discriminated union validation
 * 4. Error handling and error messages
 * 5. Type guards and utility functions
 */

import {
  validateDashboardEvent,
  validateAgentId,
  validateProgress,
  validateTimestamp,
  validateIssueNumber,
  validateEventType,
  isDashboardEvent,
  isEventType,
  getEventType,
  AgentIdSchema,
  ProgressSchema,
  TimestampSchema,
  IssueNumberSchema,
  DashboardEventSchema,
} from '../packages/dashboard-server/src/validation/event-validators.ts';

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

// ============================================================================
// Test Suite 1: Basic Schema Validation
// ============================================================================

console.log('\n========================================');
console.log('Test Suite 1: Basic Schema Validation');
console.log('========================================\n');

// Test 1.1: Valid AgentId
console.log('Test 1.1: AgentId Validation\n');

const validAgentIds = ['coordinator', 'codegen', 'review', 'issue', 'pr', 'deployment', 'test'];
validAgentIds.forEach(agentId => {
  const result = validateAgentId(agentId);
  assert(result.success, `Valid agentId "${agentId}" should pass validation`);
});

const invalidAgentId = validateAgentId('invalid-agent');
assert(!invalidAgentId.success, 'Invalid agentId should fail validation');
assert(invalidAgentId.error?.errors.length > 0, 'Invalid agentId should have error messages');

// Test 1.2: Progress Validation
console.log('\nTest 1.2: Progress Validation\n');

const validProgresses = [0, 25, 50, 75, 100];
validProgresses.forEach(progress => {
  const result = validateProgress(progress);
  assert(result.success, `Valid progress ${progress} should pass validation`);
});

const invalidProgresses = [-1, 101, 50.5, '50', NaN];
invalidProgresses.forEach(progress => {
  const result = validateProgress(progress);
  assert(!result.success, `Invalid progress ${progress} should fail validation`);
});

// Test 1.3: Timestamp Validation
console.log('\nTest 1.3: Timestamp Validation\n');

const validTimestamps = [
  '2025-10-12T12:34:56.789Z',
  '2025-01-01T00:00:00.000Z',
  new Date().toISOString(),
];
validTimestamps.forEach(timestamp => {
  const result = validateTimestamp(timestamp);
  assert(result.success, `Valid timestamp "${timestamp}" should pass validation`);
});

const invalidTimestamps = [
  '2025-10-12',
  '12:34:56',
  'invalid-date',
  '',
  null,
];
invalidTimestamps.forEach(timestamp => {
  const result = validateTimestamp(timestamp);
  assert(!result.success, `Invalid timestamp "${timestamp}" should fail validation`);
});

// Test 1.4: IssueNumber Validation
console.log('\nTest 1.4: IssueNumber Validation\n');

const validIssueNumbers = [1, 100, 999, 12345];
validIssueNumbers.forEach(issueNumber => {
  const result = validateIssueNumber(issueNumber);
  assert(result.success, `Valid issue number ${issueNumber} should pass validation`);
});

const invalidIssueNumbers = [0, -1, 1.5, '100', null];
invalidIssueNumbers.forEach(issueNumber => {
  const result = validateIssueNumber(issueNumber);
  assert(!result.success, `Invalid issue number ${issueNumber} should fail validation`);
});

// ============================================================================
// Test Suite 2: Event Schema Validation
// ============================================================================

console.log('\n========================================');
console.log('Test Suite 2: Event Schema Validation');
console.log('========================================\n');

// Test 2.1: Valid agent:started Event
console.log('Test 2.1: agent:started Event\n');

const validAgentStarted = {
  eventType: 'started',
  timestamp: '2025-10-12T12:34:56.789Z',
  agentId: 'codegen',
  issueNumber: 100,
  parameters: {
    taskTitle: 'Implement new feature',
    priority: 'P1-High',
  },
};

const startedResult = validateDashboardEvent(validAgentStarted);
assert(startedResult.success, 'Valid agent:started event should pass validation');

// Test 2.2: Invalid agent:started Event (missing required field)
const invalidAgentStarted = {
  eventType: 'started',
  timestamp: '2025-10-12T12:34:56.789Z',
  agentId: 'codegen',
  // missing issueNumber
};

const invalidStartedResult = validateDashboardEvent(invalidAgentStarted);
assert(!invalidStartedResult.success, 'Invalid agent:started event (missing field) should fail validation');
assert(
  invalidStartedResult.error?.errors.some(e => e.field.includes('issueNumber')),
  'Error should mention missing issueNumber field'
);

// Test 2.3: Valid agent:progress Event
console.log('\nTest 2.3: agent:progress Event\n');

const validAgentProgress = {
  eventType: 'progress',
  timestamp: '2025-10-12T12:35:10.123Z',
  agentId: 'codegen',
  issueNumber: 100,
  progress: 45,
  message: 'Generating code...',
  substeps: {
    current: 2,
    total: 5,
    description: 'Compiling',
  },
};

const progressResult = validateDashboardEvent(validAgentProgress);
assert(progressResult.success, 'Valid agent:progress event should pass validation');

// Test 2.4: Invalid agent:progress Event (invalid progress value)
const invalidAgentProgress = {
  ...validAgentProgress,
  progress: 150, // Out of range
};

const invalidProgressResult = validateDashboardEvent(invalidAgentProgress);
assert(!invalidProgressResult.success, 'Invalid agent:progress event (progress > 100) should fail validation');

// Test 2.5: Valid agent:completed Event
console.log('\nTest 2.5: agent:completed Event\n');

const validAgentCompleted = {
  eventType: 'completed',
  timestamp: '2025-10-12T12:37:30.456Z',
  agentId: 'codegen',
  issueNumber: 100,
  result: {
    success: true,
    duration: 120,
    outputSummary: 'Generated 5 files with 200 lines of code',
    metrics: {
      linesChanged: 200,
      filesModified: 5,
      qualityScore: 85,
    },
    artifacts: {
      prUrl: 'https://github.com/test/repo/pull/123',
    },
  },
};

const completedResult = validateDashboardEvent(validAgentCompleted);
assert(completedResult.success, 'Valid agent:completed event should pass validation');

// Test 2.6: Valid agent:error Event
console.log('\nTest 2.6: agent:error Event\n');

const validAgentError = {
  eventType: 'error',
  timestamp: '2025-10-12T12:36:15.789Z',
  agentId: 'codegen',
  issueNumber: 100,
  error: {
    code: 'COMPILE_ERROR',
    message: 'TypeScript compilation failed',
    severity: 'error',
    recoverable: true,
    suggestedAction: 'Fix type errors and retry',
  },
};

const errorResult = validateDashboardEvent(validAgentError);
assert(errorResult.success, 'Valid agent:error event should pass validation');

// Test 2.7: Valid state:transition Event
console.log('\nTest 2.7: state:transition Event\n');

const validStateTransition = {
  eventType: 'state:transition',
  timestamp: '2025-10-12T12:35:45.123Z',
  issueNumber: 100,
  fromState: 'analyzing',
  toState: 'implementing',
  triggeredBy: {
    agentId: 'coordinator',
    event: 'coordinator:assigning',
  },
};

const transitionResult = validateDashboardEvent(validStateTransition);
assert(transitionResult.success, 'Valid state:transition event should pass validation');

// Test 2.8: Valid task:discovered Event
console.log('\nTest 2.8: task:discovered Event\n');

const validTaskDiscovered = {
  eventType: 'task:discovered',
  timestamp: '2025-10-12T12:34:00.000Z',
  issueNumber: 100,
  taskDetails: {
    title: 'New feature request',
    description: 'Implement user authentication',
    priority: 'P0-Critical',
    type: 'feature',
    estimatedComplexity: 'high',
    labels: ['feature', 'authentication'],
  },
};

const discoveredResult = validateDashboardEvent(validTaskDiscovered);
assert(discoveredResult.success, 'Valid task:discovered event should pass validation');

// Test 2.9: Valid coordinator:analyzing Event
console.log('\nTest 2.9: coordinator:analyzing Event\n');

const validCoordinatorAnalyzing = {
  eventType: 'coordinator:analyzing',
  timestamp: '2025-10-12T12:34:10.000Z',
  issueNumber: 100,
  analysisDetails: {
    complexity: 'high',
    requiredAgents: ['codegen', 'review', 'test'],
    estimatedDuration: 3600,
    dependencies: [99, 98],
    risks: ['API breaking change', 'Database migration required'],
  },
};

const analyzingResult = validateDashboardEvent(validCoordinatorAnalyzing);
assert(analyzingResult.success, 'Valid coordinator:analyzing event should pass validation');

// Test 2.10: Valid coordinator:decomposing Event
console.log('\nTest 2.10: coordinator:decomposing Event\n');

const validCoordinatorDecomposing = {
  eventType: 'coordinator:decomposing',
  timestamp: '2025-10-12T12:34:20.000Z',
  issueNumber: 100,
  decomposition: {
    subtasks: [
      {
        id: 'subtask-1',
        title: 'Implement authentication API',
        assignTo: 'codegen',
        dependencies: [],
        estimatedDuration: 1800,
      },
      {
        id: 'subtask-2',
        title: 'Write unit tests',
        assignTo: 'test',
        dependencies: ['subtask-1'],
        estimatedDuration: 900,
      },
    ],
    parallelGroups: [['subtask-1'], ['subtask-2']],
    criticalPath: ['subtask-1', 'subtask-2'],
  },
};

const decomposingResult = validateDashboardEvent(validCoordinatorDecomposing);
assert(decomposingResult.success, 'Valid coordinator:decomposing event should pass validation');

// Test 2.11: Valid coordinator:assigning Event
console.log('\nTest 2.11: coordinator:assigning Event\n');

const validCoordinatorAssigning = {
  eventType: 'coordinator:assigning',
  timestamp: '2025-10-12T12:34:30.000Z',
  issueNumber: 100,
  assignments: [
    {
      subtaskId: 'subtask-1',
      agentId: 'codegen',
      priority: 10,
      scheduledStart: '2025-10-12T12:35:00.000Z',
    },
    {
      subtaskId: 'subtask-2',
      agentId: 'test',
      priority: 5,
      scheduledStart: '2025-10-12T13:00:00.000Z',
    },
  ],
};

const assigningResult = validateDashboardEvent(validCoordinatorAssigning);
assert(assigningResult.success, 'Valid coordinator:assigning event should pass validation');

// Test 2.12: Valid graph:update Event
console.log('\nTest 2.12: graph:update Event\n');

const validGraphUpdate = {
  eventType: 'graph:update',
  timestamp: '2025-10-12T12:34:56.789Z',
  nodes: [
    {
      id: 'issue-100',
      type: 'issue',
      label: 'Issue #100',
      status: 'idle',
      position: { x: 100, y: 100 },
    },
    {
      id: 'agent-codegen',
      type: 'agent',
      label: 'CodeGen',
      status: 'running',
      position: { x: 700, y: 100 },
      metadata: { progress: 45 },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'issue-100',
      target: 'agent-codegen',
      type: 'assignment',
      animated: true,
    },
  ],
};

const graphUpdateResult = validateDashboardEvent(validGraphUpdate);
assert(graphUpdateResult.success, 'Valid graph:update event should pass validation');

// ============================================================================
// Test Suite 3: Discriminated Union
// ============================================================================

console.log('\n========================================');
console.log('Test Suite 3: Discriminated Union');
console.log('========================================\n');

// Test 3.1: Event type discrimination
console.log('Test 3.1: Event Type Discrimination\n');

const allValidEvents = [
  validGraphUpdate,
  validAgentStarted,
  validAgentProgress,
  validAgentCompleted,
  validAgentError,
  validStateTransition,
  validTaskDiscovered,
  validCoordinatorAnalyzing,
  validCoordinatorDecomposing,
  validCoordinatorAssigning,
];

allValidEvents.forEach(event => {
  const result = validateDashboardEvent(event);
  assert(result.success, `Event type "${event.eventType}" should be properly discriminated`);
});

// Test 3.2: Wrong event type field
console.log('\nTest 3.2: Wrong Event Type Field\n');

const wrongEventType = {
  eventType: 'invalid-type',
  timestamp: '2025-10-12T12:34:56.789Z',
  agentId: 'codegen',
  issueNumber: 100,
};

const wrongTypeResult = validateDashboardEvent(wrongEventType);
assert(!wrongTypeResult.success, 'Invalid event type should fail validation');
assert(
  wrongTypeResult.error?.errors.some(e => e.message.includes('Invalid enum value')),
  'Error should mention invalid enum value'
);

// ============================================================================
// Test Suite 4: Type Guards and Utilities
// ============================================================================

console.log('\n========================================');
console.log('Test Suite 4: Type Guards and Utilities');
console.log('========================================\n');

// Test 4.1: isDashboardEvent type guard
console.log('Test 4.1: isDashboardEvent Type Guard\n');

assert(isDashboardEvent(validAgentStarted), 'Valid event should pass isDashboardEvent');
assert(!isDashboardEvent({ invalid: 'data' }), 'Invalid data should fail isDashboardEvent');
assert(!isDashboardEvent(null), 'Null should fail isDashboardEvent');
assert(!isDashboardEvent(undefined), 'Undefined should fail isDashboardEvent');

// Test 4.2: isEventType type guard
console.log('\nTest 4.2: isEventType Type Guard\n');

assert(isEventType(validAgentStarted, 'started'), 'Event should match its type');
assert(!isEventType(validAgentStarted, 'progress'), 'Event should not match wrong type');
assert(isEventType(validAgentProgress, 'progress'), 'Progress event should match progress type');

// Test 4.3: getEventType utility
console.log('\nTest 4.3: getEventType Utility\n');

assertEquals(getEventType(validAgentStarted), 'started', 'getEventType should return "started"');
assertEquals(getEventType(validAgentProgress), 'progress', 'getEventType should return "progress"');
assertEquals(getEventType({ invalid: 'data' }), null, 'getEventType should return null for invalid data');
assertEquals(getEventType(null), null, 'getEventType should return null for null');

// ============================================================================
// Test Suite 5: Error Messages
// ============================================================================

console.log('\n========================================');
console.log('Test Suite 5: Error Messages');
console.log('========================================\n');

// Test 5.1: Detailed error messages
console.log('Test 5.1: Detailed Error Messages\n');

const invalidEvent = {
  eventType: 'started',
  timestamp: 'invalid-timestamp',
  agentId: 'invalid-agent',
  issueNumber: -1,
};

const errorMessages = validateDashboardEvent(invalidEvent);
assert(!errorMessages.success, 'Invalid event should fail validation');
assert(errorMessages.error?.errors.length >= 3, 'Should have multiple validation errors');

// Check that errors include field names
const hasTimestampError = errorMessages.error?.errors.some(e => e.field.includes('timestamp'));
const hasAgentIdError = errorMessages.error?.errors.some(e => e.field.includes('agentId'));
const hasIssueNumberError = errorMessages.error?.errors.some(e => e.field.includes('issueNumber'));

assert(hasTimestampError, 'Error should mention timestamp field');
assert(hasAgentIdError, 'Error should mention agentId field');
assert(hasIssueNumberError, 'Error should mention issueNumber field');

// Test 5.2: Missing required fields
console.log('\nTest 5.2: Missing Required Fields\n');

const missingFields = {
  eventType: 'started',
  // missing timestamp, agentId, issueNumber
};

const missingFieldsResult = validateDashboardEvent(missingFields);
assert(!missingFieldsResult.success, 'Event with missing fields should fail validation');
assert(missingFieldsResult.error?.errors.length >= 3, 'Should report all missing fields');

// ============================================================================
// Test Suite 6: Edge Cases
// ============================================================================

console.log('\n========================================');
console.log('Test Suite 6: Edge Cases');
console.log('========================================\n');

// Test 6.1: Empty object
console.log('Test 6.1: Empty Object\n');

const emptyResult = validateDashboardEvent({});
assert(!emptyResult.success, 'Empty object should fail validation');

// Test 6.2: Null and undefined
console.log('\nTest 6.2: Null and Undefined\n');

const nullResult = validateDashboardEvent(null);
assert(!nullResult.success, 'Null should fail validation');

const undefinedResult = validateDashboardEvent(undefined);
assert(!undefinedResult.success, 'Undefined should fail validation');

// Test 6.3: Extra fields (should be allowed)
console.log('\nTest 6.3: Extra Fields\n');

const extraFields = {
  ...validAgentStarted,
  extraField: 'should be ignored',
  anotherExtra: 123,
};

const extraFieldsResult = validateDashboardEvent(extraFields);
assert(extraFieldsResult.success, 'Extra fields should not cause validation failure');

// Test 6.4: Optional fields
console.log('\nTest 6.4: Optional Fields\n');

const minimalAgentStarted = {
  eventType: 'started',
  timestamp: '2025-10-12T12:34:56.789Z',
  agentId: 'codegen',
  issueNumber: 100,
  // parameters is optional
};

const minimalResult = validateDashboardEvent(minimalAgentStarted);
assert(minimalResult.success, 'Event without optional fields should pass validation');

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
  console.log('🎉 All validation tests passed! Event validators are working correctly.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the errors above.\n');
  process.exit(1);
}
