import { chromium } from 'playwright';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendEvent(data) {
  await fetch('http://localhost:3001/api/agent-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('http://localhost:5173');
  await sleep(3000);
  
  console.log('💻 Starting CodeGenAgent...');
  await sendEvent({
    eventType: 'started',
    agentId: 'codegen',
    issueNumber: 58,
    parameters: {
      taskTitle: 'Fix incomplete setup logic',
      taskDescription: 'Implement validation',
      priority: 'P1-High'
    }
  });
  
  await sleep(3000);
  
  // Inspect the CodeGenAgent node data
  const nodeData = await page.evaluate(() => {
    // Find all ReactFlow nodes
    const nodes = window.__REACT_FLOW_STATE__?.nodes || [];
    const codegenNode = nodes.find(n => n.data?.agentId === 'codegen');
    
    // Also check DOM
    const codegenElement = document.querySelector('[data-id="agent-codegen"]');
    const allText = codegenElement?.textContent || '';
    
    return {
      hasReactFlowState: !!window.__REACT_FLOW_STATE__,
      nodeFound: !!codegenNode,
      nodeData: codegenNode?.data,
      domText: allText.substring(0, 500),
      hasCurrentIssue: allText.includes('Issue #'),
      hasProgress: allText.includes('Progress'),
      hasPercentage: /\d+%/.test(allText)
    };
  });
  
  console.log('\n📊 Node Inspection Results:');
  console.log(JSON.stringify(nodeData, null, 2));
  
  console.log('\n📈 Sending progress 70%...');
  await sendEvent({ eventType: 'progress', agentId: 'codegen', issueNumber: 58, progress: 70 });
  await sleep(2000);
  
  // Check again after progress
  const afterProgress = await page.evaluate(() => {
    const el = document.querySelector('[data-id="agent-codegen"]');
    return {
      fullText: el?.textContent,
      hasProgressBar: !!el?.querySelector('.bg-gray-800'),
      progressBarWidth: el?.querySelector('.bg-gradient-to-r.from-green-400')?.style?.width
    };
  });
  
  console.log('\n📊 After Progress Update:');
  console.log(JSON.stringify(afterProgress, null, 2));
  
  await page.screenshot({ path: '.ai/deep-inspect.png' });
  console.log('\n📸 Screenshot saved');
  
  await sleep(3000);
  await browser.close();
})();
