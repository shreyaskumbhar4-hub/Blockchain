/**
 * Public vs. Private Blockchain Architecture Simulator (Topic 6)
 * Renders two distinct interactive canvas topologies matching user screenshots:
 *
 * 1. PUBLIC BLOCKCHAIN:
 *    - Global Broadcast Architecture
 *    - Open Blue Nodes (Node 1 - 6) connected in a full P2P mesh
 *    - In Sybil Attack scenario: Red "Sybil Nodes" flood the internal network with packets
 *    - Telemetry: ~69 txs, 8.4s consensus speed, 72% security level
 *
 * 2. PRIVATE BLOCKCHAIN:
 *    - Permissioned Private Gatekeeper
 *    - Central "GOV" (Validator Authority) with green dashed perimeter fence
 *    - Green "Partner Nodes" (Partner Node 1 - 5) inside the authenticated boundary
 *    - Red "Blocked Attacker" nodes outside with [X] firewall cutoff badges
 *    - Telemetry: ~80 txs, 0.6s consensus speed, 99% security level
 */

// State
let networkType = 'public'; // 'public' | 'private'
let networkSize = 6;
let attackScenario = 'sybil'; // 'sybil' | 'intrusion' | 'normal'
let isPlaying = true;
let animFrameId = null;

// Canvas setup
const canvas = document.getElementById('networkStageCanvas');
const ctx = canvas.getContext('2d');

function setupHiDPICanvas(canvas, ctx, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);
}

const STAGE_WIDTH = 960;
const STAGE_HEIGHT = 460;
setupHiDPICanvas(canvas, ctx, STAGE_WIDTH, STAGE_HEIGHT);

// DOM Elements
const topologyBadge = document.getElementById('topologyBadge');
const statSimBlocks = document.getElementById('statSimBlocks');
const statConsensusSpeed = document.getElementById('statConsensusSpeed');
const statSecurityLevel = document.getElementById('statSecurityLevel');

const btnTypePublic = document.getElementById('btnTypePublic');
const btnTypePrivate = document.getElementById('btnTypePrivate');
const networkSizeSlider = document.getElementById('networkSizeSlider');
const lblNetworkSize = document.getElementById('lblNetworkSize');
const attackScenarioSelect = document.getElementById('attackScenarioSelect');
const stagePlayBtn = document.getElementById('stagePlayBtn');

// Particles in transit
let particles = [];
let simTick = 0;

function initParticles() {
  particles = [];
  for (let i = 0; i < 20; i++) {
    particles.push({
      progress: Math.random(),
      speed: 0.005 + Math.random() * 0.01,
      sourceIdx: 0,
      targetIdx: 1,
      color: '#38bdf8'
    });
  }
}
initParticles();

// Listeners
btnTypePublic.addEventListener('click', () => {
  networkType = 'public';
  btnTypePublic.classList.add('active');
  btnTypePrivate.classList.remove('active');
  attackScenarioSelect.value = 'sybil';
  attackScenario = 'sybil';
  updateTopologyUI();
});

btnTypePrivate.addEventListener('click', () => {
  networkType = 'private';
  btnTypePrivate.classList.add('active');
  btnTypePublic.classList.remove('active');
  attackScenarioSelect.value = 'intrusion';
  attackScenario = 'intrusion';
  updateTopologyUI();
});

networkSizeSlider.addEventListener('input', (e) => {
  networkSize = parseInt(e.target.value);
  lblNetworkSize.innerText = `${networkSize} Nodes`;
});

attackScenarioSelect.addEventListener('change', (e) => {
  attackScenario = e.target.value;
  if (attackScenario === 'intrusion' && networkType === 'public') {
    networkType = 'private';
    btnTypePrivate.classList.add('active');
    btnTypePublic.classList.remove('active');
  } else if (attackScenario === 'sybil' && networkType === 'private') {
    networkType = 'public';
    btnTypePublic.classList.add('active');
    btnTypePrivate.classList.remove('active');
  }
  updateTopologyUI();
});

stagePlayBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;
  stagePlayBtn.innerHTML = isPlaying ? `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  ` : `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  `;
});

function updateTopologyUI() {
  if (networkType === 'public') {
    topologyBadge.innerText = 'Global Broadcast Architecture';
    statSimBlocks.innerText = '69 txs';
    statConsensusSpeed.innerText = '8.4s';
    statSecurityLevel.innerText = attackScenario === 'sybil' ? '72%' : '95%';
  } else {
    topologyBadge.innerText = 'Permissioned Private Gatekeeper';
    statSimBlocks.innerText = '80 txs';
    statConsensusSpeed.innerText = '0.6s';
    statSecurityLevel.innerText = '99%';
  }
}

// ----------------------------------------------------------------------------
// RENDER LOOP
// ----------------------------------------------------------------------------
function render() {
  ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

  if (isPlaying) {
    simTick += 1;
  }

  if (networkType === 'public') {
    renderPublicMesh();
  } else {
    renderPrivateGatekeeper();
  }

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

// ----------------------------------------------------------------------------
// 1. PUBLIC BLOCKCHAIN TOPOLOGY (Matching Screenshot 1)
// ----------------------------------------------------------------------------
function renderPublicMesh() {
  const cx = STAGE_WIDTH / 2;
  const cy = STAGE_HEIGHT / 2 - 10;
  const outerR = 155;

  // Calculate coordinates for outer public blue nodes
  const outerNodes = [];
  for (let i = 0; i < networkSize; i++) {
    // Hexagonal / circular distribution
    const angle = (i * 2 * Math.PI) / networkSize - Math.PI / 2;
    outerNodes.push({
      x: cx + outerR * Math.cos(angle),
      y: cy + outerR * Math.sin(angle),
      name: `Node ${i + 1}`,
      angle
    });
  }

  // 1. Draw Full Mesh Connections between Honest Nodes
  for (let i = 0; i < outerNodes.length; i++) {
    for (let j = i + 1; j < outerNodes.length; j++) {
      ctx.beginPath();
      ctx.moveTo(outerNodes[i].x, outerNodes[i].y);
      ctx.lineTo(outerNodes[j].x, outerNodes[j].y);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
  }

  // Sybil Nodes (Red, inner circle)
  const sybilNodes = [];
  if (attackScenario === 'sybil') {
    const innerR = 75;
    const sybilCount = 4;
    for (let i = 0; i < sybilCount; i++) {
      const angle = (i * 2 * Math.PI) / sybilCount - Math.PI / 4;
      sybilNodes.push({
        x: cx + innerR * Math.cos(angle),
        y: cy + innerR * Math.sin(angle),
        name: 'Sybil Node',
        angle
      });
    }

    // Draw dashed red attack links between Sybils and Honest Nodes
    sybilNodes.forEach(sNode => {
      outerNodes.forEach(oNode => {
        ctx.beginPath();
        ctx.setLineDash([3, 4]);
        ctx.moveTo(sNode.x, sNode.y);
        ctx.lineTo(oNode.x, oNode.y);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.lineWidth = 1.1;
        ctx.stroke();
        ctx.setLineDash([]);
      });
    });

    // Draw Sybil Mesh
    for (let i = 0; i < sybilNodes.length; i++) {
      for (let j = i + 1; j < sybilNodes.length; j++) {
        ctx.beginPath();
        ctx.setLineDash([3, 4]);
        ctx.moveTo(sybilNodes[i].x, sybilNodes[i].y);
        ctx.lineTo(sybilNodes[j].x, sybilNodes[j].y);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  // 2. Animate Data Packets
  if (isPlaying) {
    // Normal packets
    const pulseT = (simTick * 0.02) % 1;
    for (let i = 0; i < outerNodes.length; i++) {
      const nextIdx = (i + 1) % outerNodes.length;
      const px = outerNodes[i].x + (outerNodes[nextIdx].x - outerNodes[i].x) * pulseT;
      const py = outerNodes[i].y + (outerNodes[nextIdx].y - outerNodes[i].y) * pulseT;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    }

    // Red malicious spam packets
    if (attackScenario === 'sybil') {
      sybilNodes.forEach((sNode, sIdx) => {
        const target = outerNodes[sIdx % outerNodes.length];
        const sT = ((simTick * 0.03) + (sIdx * 0.25)) % 1;
        const sx = sNode.x + (target.x - sNode.x) * sT;
        const sy = sNode.y + (target.y - sNode.y) * sT;
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }
  }

  // 3. Draw Outer Honest Blue Nodes (Matching Screenshot 1)
  outerNodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6'; // Bright blue
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Node label
    ctx.font = '11px Inter';
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    const labelDist = 24;
    const lx = node.x + labelDist * Math.cos(node.angle);
    const ly = node.y + labelDist * Math.sin(node.angle) + 4;
    ctx.fillText(node.name, lx, ly);
  });

  // 4. Draw Sybil Red Nodes (Matching Screenshot 1)
  if (attackScenario === 'sybil') {
    sybilNodes.forEach(sNode => {
      ctx.beginPath();
      ctx.arc(sNode.x, sNode.y, 13, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444'; // Red
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = '10px Inter';
      ctx.fillStyle = '#f87171';
      ctx.textAlign = 'center';
      ctx.fillText(sNode.name, sNode.x, sNode.y + 24);
    });
  }
}

// ----------------------------------------------------------------------------
// 2. PRIVATE ENTERPRISE GATEKEEPER TOPOLOGY (Matching Screenshots 2 & 3)
// ----------------------------------------------------------------------------
function renderPrivateGatekeeper() {
  const cx = STAGE_WIDTH / 2;
  const cy = STAGE_HEIGHT / 2 - 10;
  const fenceR = 170;
  const partnerR = 120;

  // 1. Draw Green Dashed Boundary Perimeter Fence (Matching Screenshot 2/3)
  ctx.beginPath();
  ctx.arc(cx, cy, fenceR, 0, Math.PI * 2);
  ctx.setLineDash([5, 6]);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);

  // Background subtle green tint inside fence
  ctx.beginPath();
  ctx.arc(cx, cy, fenceR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(16, 185, 129, 0.025)';
  ctx.fill();

  // 2. Draw 5 Partner Enterprise Nodes (Green) inside perimeter
  const partnerCount = 5;
  const partnerNodes = [];
  for (let i = 0; i < partnerCount; i++) {
    const angle = (i * 2 * Math.PI) / partnerCount - Math.PI / 2;
    partnerNodes.push({
      x: cx + partnerR * Math.cos(angle),
      y: cy + partnerR * Math.sin(angle),
      name: `Partner Node ${i + 1}`,
      angle
    });
  }

  // Draw lines from Center GOV Authority to Partner Nodes
  partnerNodes.forEach(pNode => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pNode.x, pNode.y);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  });

  // Fast particles flowing through authenticated enterprise lines
  if (isPlaying) {
    partnerNodes.forEach((pNode, idx) => {
      const t = ((simTick * 0.05) + (idx * 0.2)) % 1;
      const px = cx + (pNode.x - cx) * t;
      const py = cy + (pNode.y - cy) * t;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  // 3. Draw Partner Enterprise Nodes
  partnerNodes.forEach(pNode => {
    ctx.beginPath();
    ctx.arc(pNode.x, pNode.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981'; // Green
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Labels
    ctx.font = '11px Inter';
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    const labelDist = 26;
    const lx = pNode.x + labelDist * Math.cos(pNode.angle);
    const ly = pNode.y + labelDist * Math.sin(pNode.angle) + 4;
    ctx.fillText(pNode.name, lx, ly);
  });

  // 4. Center GOV Authority Badge / Node (Matching Screenshot 2/3)
  ctx.beginPath();
  ctx.arc(cx, cy, 26, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#10b981';
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Text GOV inside center node
  ctx.font = 'bold 13px Inter';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.fillText('GOV', cx, cy + 5);

  ctx.font = '11px Inter';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Validator Authority', cx, cy + 42);

  // 5. Draw Blocked Attackers Outside Perimeter (Matching Screenshot 2 & 3)
  const attackers = [
    { x: cx - 290, y: cy - 90, name: 'Blocked Attacker', targetNode: partnerNodes[3] },
    { x: cx + 280, y: cy - 90, name: 'Blocked Attacker', targetNode: partnerNodes[0] }
  ];

  attackers.forEach(att => {
    // Red dashed attack vector line attempting to connect into the ring
    ctx.beginPath();
    ctx.setLineDash([4, 5]);
    ctx.moveTo(att.x, att.y);
    ctx.lineTo(att.targetNode.x, att.targetNode.y);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate intersection on the fence to put the [X] Blocked Badge
    const midX = (att.x + att.targetNode.x) / 2;
    const midY = (att.y + att.targetNode.y) / 2;

    // Draw [X] Stop / Access Denied Icon
    ctx.beginPath();
    ctx.arc(midX, midY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.font = 'bold 10px Fira Code';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('X', midX, midY + 3.5);

    // Draw Attacker Red Node
    ctx.beginPath();
    ctx.arc(att.x, att.y, 13, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.font = '11px Inter';
    ctx.fillStyle = '#f87171';
    ctx.textAlign = 'center';
    ctx.fillText(att.name, att.x, att.y + 24);
  });
}

// Initial UI
updateTopologyUI();
