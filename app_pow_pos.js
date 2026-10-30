/**
 * Proof of Work (PoW) vs. Proof of Stake (PoS) Consensus Simulator (Topic 7)
 * Implements the exact graphics, mechanics, and UI states from user screenshots:
 *
 * 1. PROOF OF WORK (PoW Mode - Screenshots 3 & 4):
 *    - Target Puzzle Hash Badge at top: "0000X_724"
 *    - 4 Mining Nodes in a row: Miner A (Blue), Miner B (Red), Miner C (Yellow), Miner D (Green)
 *    - Nodes display dynamic Hash counter and Hashrate (e.g. "Hash: 903 | 45 MH/s")
 *    - Circular animated progress borders
 *    - Winner badge "SOLVED!"
 *    - Mining Target Difficulty slider (Lvl 1 - 5)
 *    - Telemetry: High power cost (~120.00 kW), 0.1s block time, rising block count
 *
 * 2. PROOF OF STAKE (PoS Mode - Screenshots 1 & 2):
 *    - Central "SLOT ELECTION: Selecting..." circular dashed radar
 *    - Orbiting Validator Nodes:
 *      - Whale mode: Node A (80% / 800 Coins), Node B (10% / 100 Coins), Node C (7% / 70 Coins), Node D (3% / 30 Coins)
 *      - Balanced mode: 25% each (250 Coins)
 *    - Weighted lottery election selection animation
 *    - Telemetry: Low power cost (0.15 kW), 3.0s avg block time
 */

let consensusMode = 'pos'; // 'pow' | 'pos'
let stakeDistribution = 'whale'; // 'whale' | 'balanced'
let powDifficulty = 3;
let isPlaying = true;
let animFrameId = null;

// Telemetry counters
let blocksCreated = 52;
let avgBlockTime = 3.0;
let powerCost = 0.15;

// Nodes data
const powNodes = [
  { id: 'alpha', name: 'Miner A', hashrate: '45 MH/s', color: '#3b82f6', hashVal: 903, solved: false, progress: 0 },
  { id: 'beta', name: 'Miner B', hashrate: '30 MH/s', color: '#ef4444', hashVal: 328, solved: false, progress: 0 },
  { id: 'gamma', name: 'Miner C', hashrate: '15 MH/s', color: '#f59e0b', hashVal: 115, solved: false, progress: 0 },
  { id: 'delta', name: 'Miner D', hashrate: '10 MH/s', color: '#10b981', hashVal: 54, solved: false, progress: 0 }
];

const posValidators = {
  whale: [
    { id: 'alpha', name: 'Validator A', pct: 80, coins: '800 Coins Locked', color: '#3b82f6' },
    { id: 'beta', name: 'Validator B', pct: 10, coins: '100 Coins Locked', color: '#ef4444' },
    { id: 'gamma', name: 'Validator C', pct: 7, coins: '70 Coins Locked', color: '#f59e0b' },
    { id: 'delta', name: 'Validator D', pct: 3, coins: '30 Coins Locked', color: '#10b981' }
  ],
  balanced: [
    { id: 'alpha', name: 'Validator A', pct: 25, coins: '250 Coins Locked', color: '#3b82f6' },
    { id: 'beta', name: 'Validator B', pct: 25, coins: '250 Coins Locked', color: '#ef4444' },
    { id: 'gamma', name: 'Validator C', pct: 25, coins: '250 Coins Locked', color: '#f59e0b' },
    { id: 'delta', name: 'Validator D', pct: 25, coins: '250 Coins Locked', color: '#10b981' }
  ]
};

// Canvas
const canvas = document.getElementById('consensusCanvas');
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
const STAGE_HEIGHT = 420;
setupHiDPICanvas(canvas, ctx, STAGE_WIDTH, STAGE_HEIGHT);

// DOM Elements
const powTargetBadge = document.getElementById('powTargetBadge');
const statBlocksCreated = document.getElementById('statBlocksCreated');
const statAvgBlockTime = document.getElementById('statAvgBlockTime');
const statPowerCost = document.getElementById('statPowerCost');

const btnModePoW = document.getElementById('btnModePoW');
const btnModePoS = document.getElementById('btnModePoS');
const ctrlPoWDifficulty = document.getElementById('ctrlPoWDifficulty');
const ctrlPoSStake = document.getElementById('ctrlPoSStake');

const difficultySlider = document.getElementById('difficultySlider');
const lblDifficulty = document.getElementById('lblDifficulty');
const btnStakeBalanced = document.getElementById('btnStakeBalanced');
const btnStakeWhale = document.getElementById('btnStakeWhale');
const btnConsensusPlay = document.getElementById('btnConsensusPlay');

// Mode Switchers
btnModePoW.addEventListener('click', () => {
  consensusMode = 'pow';
  btnModePoW.classList.add('active');
  btnModePoS.classList.remove('active');
  ctrlPoWDifficulty.style.display = 'flex';
  ctrlPoSStake.style.display = 'none';
  powTargetBadge.style.display = 'flex';

  // PoW Metrics
  blocksCreated = 171;
  avgBlockTime = 0.1;
  powerCost = 120.00;
  updateTelemetry();
});

btnModePoS.addEventListener('click', () => {
  consensusMode = 'pos';
  btnModePoS.classList.add('active');
  btnModePoW.classList.remove('active');
  ctrlPoWDifficulty.style.display = 'none';
  ctrlPoSStake.style.display = 'flex';
  powTargetBadge.style.display = 'none';

  // PoS Metrics
  blocksCreated = 52;
  avgBlockTime = 3.0;
  powerCost = 0.15;
  updateTelemetry();
});

// PoW Difficulty Slider
difficultySlider.addEventListener('input', (e) => {
  powDifficulty = parseInt(e.target.value);
  lblDifficulty.innerText = `Lvl ${powDifficulty}`;
  avgBlockTime = (powDifficulty * 0.05).toFixed(1);
  updateTelemetry();
});

// PoS Stake Allocation
btnStakeBalanced.addEventListener('click', () => {
  stakeDistribution = 'balanced';
  btnStakeBalanced.classList.add('active');
  btnStakeWhale.classList.remove('active');
});

btnStakeWhale.addEventListener('click', () => {
  stakeDistribution = 'whale';
  btnStakeWhale.classList.add('active');
  btnStakeBalanced.classList.remove('active');
});

// Play / Pause
btnConsensusPlay.addEventListener('click', () => {
  isPlaying = !isPlaying;
  btnConsensusPlay.innerHTML = isPlaying ? `
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

function updateTelemetry() {
  statBlocksCreated.innerText = `${blocksCreated}`;
  statAvgBlockTime.innerText = `${avgBlockTime}s`;
  statPowerCost.innerText = consensusMode === 'pow' ? `${powerCost.toFixed(2)} kW` : `${powerCost} kW`;
}

// ----------------------------------------------------------------------------
// SIMULATION ENGINE & RENDER LOOP
// ----------------------------------------------------------------------------
let tick = 0;
let electionWinnerIdx = 0;
let electionTimer = 0;

function render() {
  ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

  // Background subtle grid
  drawGrid();

  if (isPlaying) {
    tick++;
  }

  if (consensusMode === 'pow') {
    renderProofOfWork();
  } else {
    renderProofOfStake();
  }

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

// Subtle Background Grid
function drawGrid() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < STAGE_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, STAGE_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < STAGE_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(STAGE_WIDTH, y);
    ctx.stroke();
  }
}

// ----------------------------------------------------------------------------
// 1. PROOF OF WORK SIMULATION (Matching Screenshots 3 & 4)
// ----------------------------------------------------------------------------
function renderProofOfWork() {
  const nodeCount = 4;
  const startX = 130;
  const spacing = 220;
  const nodeY = 250;

  // Horizontal target dashed threshold line
  ctx.beginPath();
  ctx.setLineDash([4, 6]);
  ctx.moveTo(40, 140);
  ctx.lineTo(STAGE_WIDTH - 40, 140);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.setLineDash([]);

  // Every 80 ticks, a winner solves the block
  if (isPlaying && tick % 80 === 0) {
    blocksCreated++;
    updateTelemetry();

    // Random winner weighted by hashrate (Miner A has 45%, Miner B 30%, etc.)
    const r = Math.random() * 100;
    let winner = 0;
    if (r < 45) winner = 0;
    else if (r < 75) winner = 1;
    else if (r < 90) winner = 2;
    else winner = 3;

    powNodes.forEach((node, idx) => {
      node.solved = (idx === winner);
    });
  }

  powNodes.forEach((node, idx) => {
    const x = startX + idx * spacing;

    // Upward dashed racing beam to target threshold
    ctx.beginPath();
    ctx.setLineDash([3, 4]);
    ctx.moveTo(x, nodeY - 35);
    ctx.lineTo(x, 140);
    ctx.strokeStyle = node.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // Animated packet on racing line
    if (isPlaying) {
      const pY = nodeY - 35 - ((tick * (4 - idx * 0.6)) % (nodeY - 35 - 140));
      ctx.beginPath();
      ctx.arc(x, pY, 3, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.shadowColor = node.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Increment random hash count
      node.hashVal = (node.hashVal + Math.floor(Math.random() * 7) + 1) % 999;
      node.progress = (node.progress + 0.05 * (4 - idx * 0.7)) % (Math.PI * 2);
    }

    // Outer Node Card Container
    const boxW = 110;
    const boxH = 75;
    ctx.fillStyle = '#0f1422';
    ctx.strokeStyle = node.solved ? '#10b981' : '#243552';
    ctx.lineWidth = node.solved ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(x - boxW / 2, nodeY - boxH / 2, boxW, boxH, 10);
    ctx.fill();
    ctx.stroke();

    // Inner Circular Gauge
    const circleR = 26;
    ctx.beginPath();
    ctx.arc(x, nodeY, circleR, 0, Math.PI * 2);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Active progress arc
    ctx.beginPath();
    ctx.arc(x, nodeY, circleR, -Math.PI / 2, node.progress - Math.PI / 2);
    ctx.strokeStyle = node.color;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = node.color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Text Inside Card
    ctx.font = 'bold 12px Inter';
    ctx.fillStyle = '#f3f4f6';
    ctx.textAlign = 'center';
    ctx.fillText(node.name, x, nodeY - 10);

    if (node.solved) {
      ctx.font = 'bold 10px Fira Code';
      ctx.fillStyle = '#10b981';
      ctx.fillText('SOLVED!', x, nodeY + 5);
    } else {
      ctx.font = '10px Fira Code';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Hash: ${node.hashVal}`, x, nodeY + 4);
    }

    ctx.font = '9px Fira Code';
    ctx.fillStyle = '#64748b';
    ctx.fillText(node.hashrate, x, nodeY + 16);
  });
}

// ----------------------------------------------------------------------------
// 2. PROOF OF STAKE SIMULATION (Matching Screenshots 1 & 2)
// ----------------------------------------------------------------------------
function renderProofOfStake() {
  const cx = STAGE_WIDTH / 2;
  const cy = STAGE_HEIGHT / 2 + 5;
  const orbitR = 145;

  const currentValidators = posValidators[stakeDistribution];

  // Slot Election Timing
  electionTimer++;
  if (isPlaying && electionTimer % 100 === 0) {
    blocksCreated++;
    updateTelemetry();

    // Weighted Random selection
    const r = Math.random() * 100;
    let accumulated = 0;
    for (let i = 0; i < currentValidators.length; i++) {
      accumulated += currentValidators[i].pct;
      if (r <= accumulated) {
        electionWinnerIdx = i;
        break;
      }
    }
  }

  // 1. Center Radar: "SLOT ELECTION: Selecting..." (Matching Screenshots 1 & 2)
  const radarR = 65;
  ctx.beginPath();
  ctx.arc(cx, cy, radarR, 0, Math.PI * 2);
  ctx.setLineDash([4, 6]);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);

  // Rotating radar sweep line
  if (isPlaying) {
    const sweepAngle = (tick * 0.04) % (Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radarR * Math.cos(sweepAngle), cy + radarR * Math.sin(sweepAngle));
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Radar Center Text
  ctx.font = '9px Fira Code';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.fillText('SLOT ELECTION', cx, cy - 8);

  ctx.font = 'bold 11px Inter';
  ctx.fillStyle = '#f3f4f6';
  ctx.fillText('Selecting...', cx, cy + 8);

  // 2. Validator Orbiting Nodes (Matching Screenshots 1 & 2)
  // Validator A at 12 o'clock (top), Validator B at 3 o'clock, Validator C at 6 o'clock, Validator D at 9 o'clock
  const positions = [
    { x: cx, y: cy - orbitR, labelPos: 'top' },       // Node Alpha (Validator A)
    { x: cx + orbitR + 20, y: cy - 25, labelPos: 'right' }, // Node Beta (Validator B)
    { x: cx, y: cy + orbitR - 15, labelPos: 'bottom' },   // Node Gamma (Validator C)
    { x: cx - orbitR - 20, y: cy - 25, labelPos: 'left' }  // Node Delta (Validator D)
  ];

  currentValidators.forEach((v, idx) => {
    const pos = positions[idx];
    const isWinner = (idx === electionWinnerIdx);

    // Connecting line to center
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = isWinner ? 'rgba(56, 189, 248, 0.6)' : 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = isWinner ? 2 : 1;
    ctx.stroke();

    // Node Circular Base
    const nodeR = 24;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = '#0f1422';
    ctx.strokeStyle = isWinner ? '#38bdf8' : '#243552';
    ctx.lineWidth = isWinner ? 2.5 : 1.5;
    if (isWinner) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
    }
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Percentage Progress Arc around node
    const arcAngle = (v.pct / 100) * (Math.PI * 2);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, nodeR, -Math.PI / 2, -Math.PI / 2 + arcAngle);
    ctx.strokeStyle = v.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Percentage inside node
    ctx.font = 'bold 11px Fira Code';
    ctx.fillStyle = '#f3f4f6';
    ctx.textAlign = 'center';
    ctx.fillText(`${v.pct}%`, pos.x, pos.y + 4);

    // Labels
    ctx.font = '11px Inter';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(v.name, pos.x, pos.y - 32);

    ctx.font = '10px Fira Code';
    ctx.fillStyle = '#64748b';
    ctx.fillText(v.coins, pos.x, pos.y + 38);
  });
}

// Initial UI
updateTelemetry();
