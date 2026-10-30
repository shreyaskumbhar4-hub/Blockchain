/**
 * Interactive Network Topology & Freeze Intervention Simulation
 * Exactly renders and animates:
 * 1. Centralized Star Topology (Bank / Master Server with 8 Peripheral Clients)
 * 2. Decentralized Peer Equivalence Mesh (8 Interconnected Sovereign Nodes)
 */

// Global State
const state = {
  speedMultiplier: 1.0,
  activeMode: null, // 'normal' | 'intervention' | null
  currentStep: 0,
  isSimulating: false,
  animationFrameId: null,
  
  // Packets in transit
  centralizedPackets: [],
  decentralizedPackets: [],
  
  // Node states
  centralized: {
    status: 'idle', // 'idle' | 'processing' | 'frozen' | 'success'
    centerNodeStatus: 'normal', // 'normal' | 'flagged' | 'frozen' | 'success'
    peripheralStatus: Array(8).fill('normal'), // 'normal' | 'transmitting' | 'blocked' | 'success'
    procRate: '0%',
    ledgerState: 'Synchronized',
    overrideState: 'Armed'
  },
  
  decentralized: {
    status: 'idle', // 'idle' | 'broadcasting' | 'validating' | 'quorumpassed' | 'mined'
    peerStatus: Array(8).fill('normal'), // 'normal' | 'validating' | 'malicious_freeze' | 'confirmed'
    honestCount: 8,
    quorum: 'Standby',
    minedBlock: '#884,912'
  }
};

// Canvas references
const centCanvas = document.getElementById('centralizedCanvas');
const centCtx = centCanvas.getContext('2d');
const decCanvas = document.getElementById('decentralizedCanvas');
const decCtx = decCanvas.getContext('2d');

// DPR adjustment for crisp canvas rendering
function setupHiDPICanvas(canvas, ctx, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);
}

const CANVAS_WIDTH = 560;
const CANVAS_HEIGHT = 420;

setupHiDPICanvas(centCanvas, centCtx, CANVAS_WIDTH, CANVAS_HEIGHT);
setupHiDPICanvas(decCanvas, decCtx, CANVAS_WIDTH, CANVAS_HEIGHT);

// Topology Geometry Definitions
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2 - 10;
const RADIUS = 145;
const NODE_RADIUS = 14;

// Calculate 8 peripheral node coordinates for circular layout
function getCircularNodes(count, radius, cx, cy) {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    // Top node starts at -PI/2 (Peer 3 in prompt image or Peer 0)
    // In prompt's decentralized image: Peer 3 is at 12 o'clock, Peer 2 at 1:30, Peer 1 at 3 o'clock, etc.
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
    nodes.push({
      id: i,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      angle
    });
  }
  return nodes;
}

const peripheralNodes = getCircularNodes(8, RADIUS, CENTER_X, CENTER_Y);

// Mesh connections for Decentralized System (Octagon Ring + Inner Chord Bridge cross connections)
// Mirrors the prompt's mesh diagram where each node connects to neighbors and chords
const meshEdges = [];
for (let i = 0; i < 8; i++) {
  // Ring edge
  meshEdges.push([i, (i + 1) % 8]);
  // Chord connections (to i+2 and i+3)
  meshEdges.push([i, (i + 2) % 8]);
  meshEdges.push([i, (i + 3) % 8]);
}
// Remove duplicate undirected edges
const uniqueMeshEdges = [];
meshEdges.forEach(([u, v]) => {
  const [a, b] = u < v ? [u, v] : [v, u];
  if (!uniqueMeshEdges.some(([x, y]) => x === a && y === b)) {
    uniqueMeshEdges.push([a, b]);
  }
});

// UI Elements
const runNormalBtn = document.getElementById('runNormalBtn');
const runInterventionBtn = document.getElementById('runInterventionBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const speedSelect = document.getElementById('speedSelect');

// Telemetry & Pipelines
const centStatusBadge = document.getElementById('centralizedStatusBadge');
const decStatusBadge = document.getElementById('decentralizedStatusBadge');
const centLedgerState = document.getElementById('centLedgerState');
const centProcRate = document.getElementById('centProcRate');
const centOverrideState = document.getElementById('centOverrideState');
const decHonestNodes = document.getElementById('decHonestNodes');
const decQuorum = document.getElementById('decQuorum');
const decMinedBlock = document.getElementById('decMinedBlock');

const centPipelineSteps = document.querySelectorAll('#centralizedPipeline .pipeline-step');
const decPipelineSteps = document.querySelectorAll('#decentralizedPipeline .pipeline-step');

const centLog = document.getElementById('centralizedLog');
const decLog = document.getElementById('decentralizedLog');

// Audio-visual logs helper
function appendLog(element, text, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  const time = new Date().toLocaleTimeString();
  entry.innerText = `[${time}] ${text}`;
  element.appendChild(entry);
  element.scrollTop = element.scrollHeight;
}

// ----------------------------------------------------------------------------
// CANVAS DRAWING FUNCTIONS (MATCHING PROMPT IMAGE PALETTE & TOPOLOGY)
// ----------------------------------------------------------------------------

function drawCentralizedSystem() {
  centCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // 1. Draw Star Links
  peripheralNodes.forEach((node, idx) => {
    centCtx.beginPath();
    centCtx.moveTo(CENTER_X, CENTER_Y);
    centCtx.lineTo(node.x, node.y);
    
    // Line style based on status
    if (state.centralized.status === 'frozen') {
      centCtx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      centCtx.lineWidth = 1.5;
    } else if (state.centralized.status === 'processing') {
      centCtx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      centCtx.lineWidth = 2;
    } else {
      centCtx.strokeStyle = '#94a3b8'; // Grey-blue line as in prompt image
      centCtx.lineWidth = 1.6;
    }
    centCtx.stroke();
  });
  
  // 2. Draw in-flight packets
  state.centralizedPackets.forEach(p => {
    centCtx.beginPath();
    centCtx.arc(p.x, p.y, p.size || 5, 0, Math.PI * 2);
    centCtx.fillStyle = p.color;
    centCtx.shadowColor = p.color;
    centCtx.shadowBlur = 10;
    centCtx.fill();
    centCtx.shadowBlur = 0;
  });

  // 3. Draw Peripheral Client Nodes (Blue in prompt reference)
  peripheralNodes.forEach((node, idx) => {
    centCtx.beginPath();
    centCtx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
    
    let fillColor = '#38bdf8'; // Blue
    let strokeColor = '#0f172a';
    
    if (idx === 4) { // Node at bottom/left (Initiator Client)
      if (state.centralized.peripheralStatus[idx] === 'transmitting') {
        fillColor = '#60a5fa';
      } else if (state.centralized.peripheralStatus[idx] === 'blocked') {
        fillColor = '#ef4444'; // Frozen red
      }
    }
    
    centCtx.fillStyle = fillColor;
    centCtx.fill();
    centCtx.lineWidth = 2;
    centCtx.strokeStyle = strokeColor;
    centCtx.stroke();
    
    // Label for Sender
    if (idx === 4) {
      centCtx.font = '10px Inter';
      centCtx.fillStyle = '#94a3b8';
      centCtx.textAlign = 'center';
      centCtx.fillText('Client Tx Initiator', node.x, node.y + 26);
    }
  });

  // 4. Draw Center Node (Red in prompt reference: Central Server)
  centCtx.beginPath();
  centCtx.arc(CENTER_X, CENTER_Y, NODE_RADIUS + 2, 0, Math.PI * 2);
  
  let centerFill = '#ef4444'; // Red as in prompt image
  if (state.centralized.centerNodeStatus === 'flagged') {
    centerFill = '#dc2626';
    // Pulsing danger glow
    centCtx.shadowColor = '#ef4444';
    centCtx.shadowBlur = 18;
  } else if (state.centralized.centerNodeStatus === 'success') {
    centerFill = '#3b82f6';
    centCtx.shadowColor = '#3b82f6';
    centCtx.shadowBlur = 14;
  }
  
  centCtx.fillStyle = centerFill;
  centCtx.fill();
  centCtx.lineWidth = 2.5;
  centCtx.strokeStyle = '#0f172a';
  centCtx.stroke();
  centCtx.shadowBlur = 0;

  // 5. Draw Central Server Label Badge (as styled in prompt image)
  const badgeWidth = 140;
  const badgeHeight = 36;
  const badgeX = CENTER_X - badgeWidth / 2;
  const badgeY = CENTER_Y + 22;

  centCtx.fillStyle = 'rgba(239, 68, 68, 0.12)';
  centCtx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
  centCtx.lineWidth = 1;
  centCtx.beginPath();
  centCtx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 6);
  centCtx.fill();
  centCtx.stroke();

  centCtx.font = '10px Inter';
  centCtx.textAlign = 'center';
  centCtx.fillStyle = '#f87171';
  centCtx.fillText('Central Server', CENTER_X, badgeY + 15);
  centCtx.font = '9px Inter';
  centCtx.fillText('(Single Point of Failure)', CENTER_X, badgeY + 28);
}

function drawDecentralizedSystem() {
  decCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // 1. Draw Mesh Edges (Multi-peer mesh interconnects)
  uniqueMeshEdges.forEach(([u, v]) => {
    const p1 = peripheralNodes[u];
    const p2 = peripheralNodes[v];
    
    decCtx.beginPath();
    decCtx.moveTo(p1.x, p1.y);
    decCtx.lineTo(p2.x, p2.y);
    
    // Check if this connects to malicious node (Peer 2 / Node 2 at index 2)
    const isIntervenedEdge = (u === 2 || v === 2) && state.decentralized.peerStatus[2] === 'malicious_freeze';
    
    if (isIntervenedEdge) {
      decCtx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      decCtx.lineWidth = 1.2;
    } else if (state.decentralized.status === 'quorumpassed' || state.decentralized.status === 'mined') {
      decCtx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
      decCtx.lineWidth = 1.6;
    } else {
      decCtx.strokeStyle = '#94a3b8'; // Grey-blue mesh lines
      decCtx.lineWidth = 1.3;
    }
    decCtx.stroke();
  });

  // 2. Draw In-flight Gossip Packets
  state.decentralizedPackets.forEach(p => {
    decCtx.beginPath();
    decCtx.arc(p.x, p.y, p.size || 4.5, 0, Math.PI * 2);
    decCtx.fillStyle = p.color;
    decCtx.shadowColor = p.color;
    decCtx.shadowBlur = 8;
    decCtx.fill();
    decCtx.shadowBlur = 0;
  });

  // 3. Draw Peer Nodes (Green nodes from prompt diagram)
  // Matching numbering: 
  // Node 0: Peer 3 (12 o'clock)
  // Node 1: Peer 2 (1:30)
  // Node 2: Peer 1 (3 o'clock)
  // Node 3: Peer 8 (4:30)
  // Node 4: Peer 7 (6 o'clock)
  // Node 5: Peer 6 (7:30)
  // Node 6: Peer 5 (9 o'clock)
  // Node 7: Peer 4 (10:30)
  const peerLabels = ['Peer 3', 'Peer 2', 'Peer 1', 'Peer 8', 'Peer 7', 'Peer 6', 'Peer 5', 'Peer 4'];

  peripheralNodes.forEach((node, idx) => {
    decCtx.beginPath();
    decCtx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
    
    let fillColor = '#10b981'; // Vivid Green as in prompt image
    let strokeColor = '#0f172a';
    
    const nodeStatus = state.decentralized.peerStatus[idx];
    if (nodeStatus === 'malicious_freeze') {
      fillColor = '#ef4444'; // Compromised/intervened node turns red!
      decCtx.shadowColor = '#ef4444';
      decCtx.shadowBlur = 14;
    } else if (nodeStatus === 'confirmed') {
      fillColor = '#34d399';
      decCtx.shadowColor = '#10b981';
      decCtx.shadowBlur = 10;
    }
    
    decCtx.fillStyle = fillColor;
    decCtx.fill();
    decCtx.lineWidth = 2;
    decCtx.strokeStyle = strokeColor;
    decCtx.stroke();
    decCtx.shadowBlur = 0;

    // Draw Peer Label outside node
    decCtx.font = '10px Inter';
    decCtx.fillStyle = '#cbd5e1';
    decCtx.textAlign = 'center';
    
    // Offset label radially outward
    const labelDist = 24;
    const lx = node.x + labelDist * Math.cos(node.angle);
    const ly = node.y + labelDist * Math.sin(node.angle) + 3;
    decCtx.fillText(peerLabels[idx], lx, ly);

    // Extra Tag if Intervened
    if (nodeStatus === 'malicious_freeze') {
      decCtx.font = '9px Fira Code';
      decCtx.fillStyle = '#f87171';
      decCtx.fillText('[BLOCKED/VETO]', lx, ly + 13);
    }
  });
}

// ----------------------------------------------------------------------------
// SIMULATION ENGINE & SCENARIO LOGIC
// ----------------------------------------------------------------------------

function setSpeed(val) {
  state.speedMultiplier = parseFloat(val);
}

speedSelect.addEventListener('change', (e) => setSpeed(e.target.value));

function resetSimulation() {
  state.activeMode = null;
  state.isSimulating = false;
  state.centralizedPackets = [];
  state.decentralizedPackets = [];
  
  // Reset Centralized
  state.centralized = {
    status: 'idle',
    centerNodeStatus: 'normal',
    peripheralStatus: Array(8).fill('normal'),
    procRate: '0%',
    ledgerState: 'Synchronized',
    overrideState: 'Armed'
  };
  
  // Reset Decentralized
  state.decentralized = {
    status: 'idle',
    peerStatus: Array(8).fill('normal'),
    honestCount: 8,
    quorum: 'Standby',
    minedBlock: '#884,912'
  };
  
  // Reset UI Badges
  centStatusBadge.className = 'system-status';
  centStatusBadge.querySelector('.status-text').innerText = 'SYSTEM IDLE';
  
  decStatusBadge.className = 'system-status';
  decStatusBadge.querySelector('.status-text').innerText = 'NETWORK IDLE';
  
  centLedgerState.innerText = 'Synchronized';
  centProcRate.innerText = '0%';
  centProcRate.className = 'value';
  centOverrideState.innerText = 'Armed';
  centOverrideState.className = 'value danger-text';
  
  decHonestNodes.innerText = '8 / 8 (100%)';
  decHonestNodes.className = 'value success-text';
  decQuorum.innerText = 'Standby';
  decQuorum.className = 'value';
  decMinedBlock.innerText = '#884,912';
  decMinedBlock.className = 'value success-text';
  
  // Clear pipeline active classes
  centPipelineSteps.forEach(el => el.className = 'pipeline-step');
  decPipelineSteps.forEach(el => el.className = 'pipeline-step');
  
  // Re-render
  drawCentralizedSystem();
  drawDecentralizedSystem();
}

resetAllBtn.addEventListener('click', () => {
  resetSimulation();
  appendLog(centLog, 'System state reset to baseline idle.', 'system');
  appendLog(decLog, 'P2P network state synchronized to Genesis.', 'system');
});

// Helper for delays governed by speed multiplier
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms / state.speedMultiplier));
}

// Packet animation generator
function animatePacket(start, end, duration, color, updateFn, onComplete) {
  const startTime = performance.now();
  const adjustedDuration = duration / state.speedMultiplier;
  
  function frame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / adjustedDuration, 1);
    
    // Linear interpolation
    const currentX = start.x + (end.x - start.x) * progress;
    const currentY = start.y + (end.y - start.y) * progress;
    
    updateFn({ x: currentX, y: currentY, color, progress });
    
    if (progress < 1 && state.isSimulating) {
      requestAnimationFrame(frame);
    } else {
      onComplete && onComplete();
    }
  }
  requestAnimationFrame(frame);
}

// ----------------------------------------------------------------------------
// SCENARIO 1: NORMAL TRANSACTION SIMULATION
// ----------------------------------------------------------------------------

async function runNormalTransaction() {
  if (state.isSimulating) return;
  resetSimulation();
  state.isSimulating = true;
  state.activeMode = 'normal';
  
  appendLog(centLog, 'Transaction initiated by Client #4 ($500.00 transfer)...', 'info');
  appendLog(decLog, 'Broadcasting signed Tx 0x7a89f4b... to P2P Mempool...', 'info');
  
  // ----------------- Step 1: Client Submits -----------------
  centPipelineSteps[0].classList.add('active');
  decPipelineSteps[0].classList.add('active');
  
  centStatusBadge.className = 'system-status active';
  centStatusBadge.querySelector('.status-text').innerText = 'ROUTING TO GATEWAY';
  decStatusBadge.className = 'system-status active';
  decStatusBadge.querySelector('.status-text').innerText = 'MEMPOOL GOSSIP';

  state.centralized.peripheralStatus[4] = 'transmitting';
  
  // Centralized packet from client 4 to center
  const senderNode = peripheralNodes[4];
  const centerNode = { x: CENTER_X, y: CENTER_Y };
  
  let centP = { x: senderNode.x, y: senderNode.y, color: '#38bdf8' };
  state.centralizedPackets = [centP];
  
  // Decentralized packets: Peer 7 (node 4) gossips to its neighbors (peers 6, 8, 5, etc.)
  let decPackets = [];
  const senderDecNode = peripheralNodes[4];
  [3, 5, 2, 6].forEach(neighborIdx => {
    decPackets.push({
      start: senderDecNode,
      end: peripheralNodes[neighborIdx],
      curr: { x: senderDecNode.x, y: senderDecNode.y, color: '#10b981' }
    });
  });
  state.decentralizedPackets = decPackets.map(d => d.curr);
  
  animatePacket(senderNode, centerNode, 900, '#38bdf8', (p) => {
    centP.x = p.x;
    centP.y = p.y;
    drawCentralizedSystem();
  });
  
  decPackets.forEach(dp => {
    animatePacket(dp.start, dp.end, 900, '#10b981', (p) => {
      dp.curr.x = p.x;
      dp.curr.y = p.y;
      drawDecentralizedSystem();
    });
  });
  
  await wait(950);
  state.centralizedPackets = [];
  state.decentralizedPackets = [];
  
  // ----------------- Step 2: Verification -----------------
  centPipelineSteps[0].classList.remove('active');
  centPipelineSteps[0].classList.add('success');
  centPipelineSteps[1].classList.add('active');
  
  decPipelineSteps[0].classList.remove('active');
  decPipelineSteps[0].classList.add('success');
  decPipelineSteps[1].classList.add('active');
  
  appendLog(centLog, 'Master Server running admin checks: Account active, no sanctions.', 'info');
  appendLog(decLog, 'Full Nodes independently checking ECDSA signature & UTXO balance...', 'info');
  
  state.centralized.centerNodeStatus = 'processing';
  state.decentralized.peerStatus.fill('validating');
  drawCentralizedSystem();
  drawDecentralizedSystem();
  
  await wait(1000);
  
  // ----------------- Step 3: Quorum / Mutation -----------------
  centPipelineSteps[1].classList.remove('active');
  centPipelineSteps[1].classList.add('success');
  centPipelineSteps[2].classList.add('active');
  
  decPipelineSteps[1].classList.remove('active');
  decPipelineSteps[1].classList.add('success');
  decPipelineSteps[2].classList.add('active');
  
  appendLog(centLog, 'Executing single SQL UPDATE on core database. Mutating row ID=4.', 'info');
  appendLog(decLog, '8 of 8 nodes validate protocol rules (100% Honest Consensus).', 'success');
  
  decQuorum.innerText = '8 / 8 Verified (>50%)';
  decQuorum.className = 'value success-text';
  drawDecentralizedSystem();
  
  await wait(1000);
  
  // ----------------- Step 4: Final Settlement -----------------
  centPipelineSteps[2].classList.remove('active');
  centPipelineSteps[2].classList.add('success');
  centPipelineSteps[3].classList.add('success');
  
  decPipelineSteps[2].classList.remove('active');
  decPipelineSteps[2].classList.add('success');
  decPipelineSteps[3].classList.add('success');
  
  state.centralized.status = 'success';
  state.centralized.centerNodeStatus = 'success';
  state.centralized.procRate = '100%';
  centProcRate.innerText = '100%';
  centProcRate.className = 'value success-text';
  centStatusBadge.className = 'system-status success';
  centStatusBadge.querySelector('.status-text').innerText = 'TRANSACTION SETTLED';
  appendLog(centLog, 'Centralized settlement complete: 100% processed.', 'success');
  
  state.decentralized.status = 'mined';
  state.decentralized.peerStatus.fill('confirmed');
  decStatusBadge.className = 'system-status success';
  decStatusBadge.querySelector('.status-text').innerText = 'BLOCK MINED';
  appendLog(decLog, 'Block #884,912 assembled & hash verified! 100% Immutable Settlement.', 'success');
  
  drawCentralizedSystem();
  drawDecentralizedSystem();
  state.isSimulating = false;
}

// ----------------------------------------------------------------------------
// SCENARIO 2: SYSTEM INTERVENTION (FREEZE ATTEMPT) SIMULATION
// ----------------------------------------------------------------------------

async function runInterventionSimulation() {
  if (state.isSimulating) return;
  resetSimulation();
  state.isSimulating = true;
  state.activeMode = 'intervention';
  
  appendLog(centLog, '!!! INCOMING FREEZE ORDER: Regulatory block flag activated on Client #4.', 'freeze');
  appendLog(decLog, 'Peer 1 (Node 2) intervened: instructed by local admin to censor Tx 0x7a8...', 'warn');
  
  // ----------------- Step 1: User Initiates Tx -----------------
  centPipelineSteps[0].classList.add('active');
  decPipelineSteps[0].classList.add('active');
  
  centStatusBadge.className = 'system-status active';
  centStatusBadge.querySelector('.status-text').innerText = 'CLIENT SUBMISSION';
  decStatusBadge.className = 'system-status active';
  decStatusBadge.querySelector('.status-text').innerText = 'P2P GOSSIP';

  state.centralized.peripheralStatus[4] = 'transmitting';
  
  // Centralized packet travel
  const senderNode = peripheralNodes[4];
  const centerNode = { x: CENTER_X, y: CENTER_Y };
  let centP = { x: senderNode.x, y: senderNode.y, color: '#38bdf8' };
  state.centralizedPackets = [centP];
  
  // Decentralized packets: broadcast across network peers
  let decPackets = [];
  [0, 1, 2, 3, 5, 6, 7].forEach(targetIdx => {
    decPackets.push({
      start: senderNode,
      end: peripheralNodes[targetIdx],
      curr: { x: senderNode.x, y: senderNode.y, color: '#10b981' }
    });
  });
  state.decentralizedPackets = decPackets.map(d => d.curr);
  
  animatePacket(senderNode, centerNode, 900, '#38bdf8', (p) => {
    centP.x = p.x;
    centP.y = p.y;
    drawCentralizedSystem();
  });
  
  decPackets.forEach(dp => {
    animatePacket(dp.start, dp.end, 900, '#10b981', (p) => {
      dp.curr.x = p.x;
      dp.curr.y = p.y;
      drawDecentralizedSystem();
    });
  });
  
  await wait(950);
  state.centralizedPackets = [];
  state.decentralizedPackets = [];
  
  // ----------------- Step 2: Admin Rule Checks vs Node Checks -----------------
  centPipelineSteps[0].classList.remove('active');
  centPipelineSteps[0].classList.add('frozen');
  centPipelineSteps[1].classList.add('frozen');
  
  decPipelineSteps[0].classList.remove('active');
  decPipelineSteps[0].classList.add('success');
  decPipelineSteps[1].classList.add('active');
  
  // CENTRALIZED FREEZE OCCURS IMMEDIATELY AT CENTER
  state.centralized.status = 'frozen';
  state.centralized.centerNodeStatus = 'flagged';
  state.centralized.peripheralStatus[4] = 'blocked';
  state.centralized.procRate = '0%';
  state.centralized.overrideState = 'TRIGGERED';
  centOverrideState.innerText = 'TRIGGERED';
  centProcRate.innerText = '0% (HALTED)';
  centProcRate.className = 'value danger-text';
  centStatusBadge.className = 'system-status frozen';
  centStatusBadge.querySelector('.status-text').innerText = 'TRANSACTION FROZEN';
  
  appendLog(centLog, 'SECURITY GATEWAY: Flagged account detected! Admin rule matched.', 'freeze');
  appendLog(centLog, 'COMMAND EXECUTED: UPDATE accounts SET is_frozen = 1 WHERE id=4', 'freeze');
  appendLog(centLog, 'Result: 0% Processed. Central server drops packet. User cannot transfer.', 'freeze');
  
  // DECENTRALIZED: Peer 1 (Node 2) drops packet, but other 7 nodes verify
  state.decentralized.peerStatus[2] = 'malicious_freeze'; // Intervened node
  [0, 1, 3, 4, 5, 6, 7].forEach(i => state.decentralized.peerStatus[i] = 'validating');
  
  appendLog(decLog, 'Node [Peer 1] attempts freeze: refuses to relay or bundle Tx.', 'freeze');
  appendLog(decLog, 'Remaining 7 Full Nodes verify cryptographic proof (valid private key).', 'info');
  
  decHonestNodes.innerText = '7 / 8 (87.5%)';
  drawCentralizedSystem();
  drawDecentralizedSystem();
  
  await wait(1200);
  
  // ----------------- Step 3: Quorum Voting / Network Isolation -----------------
  centPipelineSteps[2].classList.add('frozen');
  centPipelineSteps[3].classList.add('frozen');
  
  decPipelineSteps[1].classList.remove('active');
  decPipelineSteps[1].classList.add('success');
  decPipelineSteps[2].classList.add('active');
  
  appendLog(decLog, 'CONSENSUS RESOLUTION: Censoring node outvoted 7 to 1 (87.5% > 50%).', 'success');
  decQuorum.innerText = '7 / 8 Outvoted Rogue Node';
  decQuorum.className = 'value success-text';
  
  drawDecentralizedSystem();
  await wait(1000);
  
  // ----------------- Step 4: Final State: 0% vs 100% -----------------
  decPipelineSteps[2].classList.remove('active');
  decPipelineSteps[2].classList.add('success');
  decPipelineSteps[3].classList.add('success');
  
  state.decentralized.status = 'mined';
  [0, 1, 3, 4, 5, 6, 7].forEach(i => state.decentralized.peerStatus[i] = 'confirmed');
  
  decStatusBadge.className = 'system-status success';
  decStatusBadge.querySelector('.status-text').innerText = 'TX VALIDATED & BLOCK MINED';
  appendLog(decLog, 'SUCCESS: Honest miner mined block #884,912 containing Tx. 100% Processed!', 'success');
  appendLog(decLog, 'Intervention failed mathematically: decentralized protocol preserved state.', 'info');
  
  drawCentralizedSystem();
  drawDecentralizedSystem();
  state.isSimulating = false;
}

// ----------------------------------------------------------------------------
// INTERACTIVE TABS & CONTROLS
// ----------------------------------------------------------------------------

runNormalBtn.addEventListener('click', runNormalTransaction);
runInterventionBtn.addEventListener('click', runInterventionSimulation);

// Educational Tab Switching
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  });
});

// Initial Render
resetSimulation();


// ----------------------------------------------------------------------------
// CHRONOLOGICAL BLOCK CHAIN-LINK SIMULATOR LOGIC
// ----------------------------------------------------------------------------
const tamperBlock102Btn = document.getElementById('tamperBlock102Btn');
const restoreChainBtn = document.getElementById('restoreChainBtn');

const cardBlock102 = document.getElementById('cardBlock102');
const cardBlock103 = document.getElementById('cardBlock103');
const targetTxRow = document.getElementById('targetTxRow');
const hashBlock102 = document.getElementById('hashBlock102');
const connector102_103 = document.getElementById('connector102_103');
const indicator102_103 = document.getElementById('indicator102_103');
const chainStatusBanner = document.getElementById('chainStatusBanner');

if (tamperBlock102Btn && restoreChainBtn) {
  tamperBlock102Btn.addEventListener('click', () => {
    // 1. Alter transaction in Block 102
    targetTxRow.innerText = '• Bob -> Ethan: 100 BTC (FRAUD)';
    targetTxRow.className = 'tx-row tampered-tx';
    
    // 2. Hash of Block 102 mutates completely due to Avalanche effect
    hashBlock102.innerText = '8x928d2b...3z89';
    hashBlock102.className = 'hash-display mutated';
    cardBlock102.className = 'block-card tampered';
    
    // 3. Block 103 previous hash does not match!
    connector102_103.className = 'chain-connector broken';
    indicator102_103.className = 'link-indicator broken';
    indicator102_103.innerText = '💥 BROKEN LINK';
    
    cardBlock103.className = 'block-card broken-child';
    
    // 4. Update banner
    chainStatusBanner.className = 'chain-status-banner invalid';
    chainStatusBanner.querySelector('.status-icon').innerText = '❌';
    chainStatusBanner.querySelector('.status-info strong').innerText = 'INVALID CHAIN DETECTED: FRAUD ATTEMPT REJECTED';
    chainStatusBanner.querySelector('.status-info span').innerText = 
      'Block #103 expects Parent Hash 0000b543...a889, but received mutated hash 8x928d2b...3z89. The entire P2P network rejects this block instantly!';
  });

  restoreChainBtn.addEventListener('click', () => {
    targetTxRow.innerText = '• Bob -> Ethan: 0.5 BTC';
    targetTxRow.className = 'tx-row highlight-tx';
    
    hashBlock102.innerText = '0000b543...a889';
    hashBlock102.className = 'hash-display';
    cardBlock102.className = 'block-card valid';
    
    connector102_103.className = 'chain-connector';
    indicator102_103.className = 'link-indicator valid';
    indicator102_103.innerText = 'LINK VALID';
    
    cardBlock103.className = 'block-card valid';
    
    chainStatusBanner.className = 'chain-status-banner valid';
    chainStatusBanner.querySelector('.status-icon').innerText = '✅';
    chainStatusBanner.querySelector('.status-info strong').innerText = 'BLOCKCHAIN CONSENSUS VERIFIED';
    chainStatusBanner.querySelector('.status-info span').innerText = 
      'All block parent-fingerprints match. Mathematical integrity is sound across global nodes.';
  });
}
