/**
 * SHA-256 Engine, Bit Grid Mutation Map, and Avalanche Flow Simulator
 * Matches the UI elements, telemetry counters, bit grid matrix, and flow diagram
 * shown in the uploaded reference screenshots.
 */

// Native Web Crypto API SHA-256 implementation
async function computeSHA256(str) {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Also return 256 binary string representation
  let binary = '';
  for (let i = 0; i < hashArray.length; i++) {
    binary += hashArray[i].toString(2).padStart(8, '0');
  }
  return { hex, binary };
}

// UI Elements
const inputA = document.getElementById('inputDataA');
const inputB = document.getElementById('inputDataB');
const presetSelect = document.getElementById('presetSelect');
const countA = document.getElementById('countA');
const countB = document.getElementById('countB');

const hashAOutput = document.getElementById('hashAOutput');
const hashBOutput = document.getElementById('hashBOutput');

const statMutatedBits = document.getElementById('statMutatedBits');
const statAvalanchePct = document.getElementById('statAvalanchePct');
const statHexChanged = document.getElementById('statHexChanged');

const bitGridMatrix = document.getElementById('bitGridMatrix');
const btnBitGridView = document.getElementById('btnBitGridView');
const btnAvalancheFlow = document.getElementById('btnAvalancheFlow');
const bitGridViewContainer = document.getElementById('bitGridViewContainer');
const avalancheFlowContainer = document.getElementById('avalancheFlowContainer');

const avalancheCanvas = document.getElementById('avalancheCanvas');
const avCtx = avalancheCanvas.getContext('2d');

let currentActiveView = 'bitGrid'; // 'bitGrid' | 'flow'

// Setup High DPI Canvas
function setupHiDPICanvas(canvas, ctx, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);
}
setupHiDPICanvas(avalancheCanvas, avCtx, 900, 340);

// Preset dictionary
const presets = {
  quickBrown: {
    a: "The quick brown fox jumps over the lazy dog",
    b: "The quick brown fox jumps over the lazy dog."
  },
  helloCase: {
    a: "Hello",
    b: "hello"
  },
  exclamation: {
    a: "Hello",
    b: "Hello!"
  },
  btcTransfer: {
    a: "Bob -> Ethan: 0.5 BTC",
    b: "Bob -> Ethan: 0.6 BTC"
  }
};

// Toggle between Bit Grid View and Avalanche Flow
btnBitGridView.addEventListener('click', () => {
  currentActiveView = 'bitGrid';
  btnBitGridView.classList.add('active');
  btnAvalancheFlow.classList.remove('active');
  bitGridViewContainer.classList.add('active');
  avalancheFlowContainer.classList.remove('active');
});

btnAvalancheFlow.addEventListener('click', () => {
  currentActiveView = 'flow';
  btnAvalancheFlow.classList.add('active');
  btnBitGridView.classList.remove('active');
  avalancheFlowContainer.classList.add('active');
  bitGridViewContainer.classList.remove('active');
  drawAvalancheFlow();
});

// Preset switcher
presetSelect.addEventListener('change', (e) => {
  const val = e.target.value;
  if (presets[val]) {
    inputA.value = presets[val].a;
    inputB.value = presets[val].b;
    recalculateAvalanche();
  }
});

inputA.addEventListener('input', () => {
  presetSelect.value = 'custom';
  recalculateAvalanche();
});
inputB.addEventListener('input', () => {
  presetSelect.value = 'custom';
  recalculateAvalanche();
});

// Render the 256-Bit Grid Matrix (16 rows x 16 columns)
function renderBitGrid(binA, binB) {
  bitGridMatrix.innerHTML = '';
  
  // 256 cells
  for (let i = 0; i < 256; i++) {
    const bitA = binA[i];
    const bitB = binB[i];
    const isFlipped = bitA !== bitB;
    
    const cell = document.createElement('div');
    cell.className = `bit-cell ${isFlipped ? 'flipped' : 'matched'}`;
    cell.title = `Bit #${i + 1}\nInput A: ${bitA}\nInput B: ${bitB}\nState: ${isFlipped ? 'FLIPPED (Mutation)' : 'MATCHED'}`;
    bitGridMatrix.appendChild(cell);
  }
}

// Draw Avalanche Flow Canvas (Matches Image 1)
function drawAvalancheFlow() {
  const width = 900;
  const height = 340;
  avCtx.clearRect(0, 0, width, height);

  const textA = inputA.value.length > 15 ? inputA.value.slice(0, 15) + '...' : inputA.value;
  const textB = inputB.value.length > 15 ? inputB.value.slice(0, 15) + '...' : inputB.value;

  // Box Coordinates
  const boxAW = 170, boxAH = 50;
  const boxAX = 50, boxAY = 85;

  const boxBW = 170, boxBH = 50;
  const boxBX = 50, boxBY = 205;

  const engineW = 190, engineH = 100;
  const engineX = 350, engineY = 120;

  const cardW = 270, cardH = 110;
  const cardX = 580, cardY = 115;

  // 1. Draw Connecting Curves with Dashed Line
  // Flow A (Blue)
  avCtx.beginPath();
  avCtx.setLineDash([5, 5]);
  avCtx.strokeStyle = '#38bdf8';
  avCtx.lineWidth = 2;
  avCtx.moveTo(boxAX + boxAW, boxAY + boxAH / 2);
  avCtx.bezierCurveTo(270, boxAY + boxAH / 2, 280, engineY + engineH / 3, engineX, engineY + engineH / 3);
  avCtx.stroke();

  // Flow B (Red)
  avCtx.beginPath();
  avCtx.strokeStyle = '#ef4444';
  avCtx.moveTo(boxBX + boxBW, boxBY + boxBH / 2);
  avCtx.bezierCurveTo(270, boxBY + boxBH / 2, 280, engineY + (engineH * 2) / 3, engineX, engineY + (engineH * 2) / 3);
  avCtx.stroke();
  avCtx.setLineDash([]); // Reset dash

  // 2. Draw Engine Circular Halo
  avCtx.beginPath();
  avCtx.arc(engineX + engineW / 2, engineY + engineH / 2, 95, 0, Math.PI * 2);
  avCtx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
  avCtx.lineWidth = 1.5;
  avCtx.stroke();

  avCtx.beginPath();
  avCtx.arc(engineX + engineW / 2, engineY + engineH / 2, 80, 0, Math.PI * 2);
  avCtx.setLineDash([4, 6]);
  avCtx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
  avCtx.stroke();
  avCtx.setLineDash([]);

  // 3. Draw Input Node A Box
  avCtx.fillStyle = 'rgba(56, 189, 248, 0.08)';
  avCtx.strokeStyle = '#38bdf8';
  avCtx.lineWidth = 1.5;
  avCtx.beginPath();
  avCtx.roundRect(boxAX, boxAY, boxAW, boxAH, 8);
  avCtx.fill();
  avCtx.stroke();

  avCtx.font = '12px Inter';
  avCtx.fillStyle = '#38bdf8';
  avCtx.textAlign = 'left';
  avCtx.fillText(`Input A: "${textA}"`, boxAX + 14, boxAY + 30);

  // 4. Draw Input Node B Box
  avCtx.fillStyle = 'rgba(239, 68, 68, 0.08)';
  avCtx.strokeStyle = '#ef4444';
  avCtx.lineWidth = 1.5;
  avCtx.beginPath();
  avCtx.roundRect(boxBX, boxBY, boxBW, boxBH, 8);
  avCtx.fill();
  avCtx.stroke();

  avCtx.fillStyle = '#ef4444';
  avCtx.fillText(`Input B: "${textB}"`, boxBX + 14, boxBY + 30);

  // 5. Draw Central SHA-256 Engine Box
  avCtx.fillStyle = '#162032';
  avCtx.strokeStyle = '#243552';
  avCtx.lineWidth = 1.5;
  avCtx.beginPath();
  avCtx.roundRect(engineX, engineY, engineW, engineH, 12);
  avCtx.fill();
  avCtx.stroke();

  avCtx.font = 'bold 15px Inter';
  avCtx.fillStyle = '#f3f4f6';
  avCtx.textAlign = 'center';
  avCtx.fillText('SHA-256 Engine', engineX + engineW / 2, engineY + 45);

  avCtx.font = '11px Inter';
  avCtx.fillStyle = '#94a3b8';
  avCtx.fillText('64 Compression Rounds', engineX + engineW / 2, engineY + 68);

  // 6. Draw Right Stats Card (Avalanche Effect Box)
  avCtx.fillStyle = '#111827';
  avCtx.strokeStyle = '#243552';
  avCtx.lineWidth = 1.5;
  avCtx.beginPath();
  avCtx.roundRect(cardX, cardY, cardW, cardH, 10);
  avCtx.fill();
  avCtx.stroke();

  avCtx.font = 'bold 14px Inter';
  avCtx.fillStyle = '#f3f4f6';
  avCtx.textAlign = 'left';
  avCtx.fillText('Avalanche Effect', cardX + 16, cardY + 28);

  const mutatedCount = statMutatedBits.innerText;
  const pct = statAvalanchePct.innerText;

  avCtx.font = '12px Inter';
  avCtx.fillStyle = '#94a3b8';
  avCtx.fillText('Total Bit Difference:', cardX + 16, cardY + 54);

  avCtx.font = 'bold 13px Fira Code';
  avCtx.fillStyle = '#f87171';
  avCtx.fillText(`${mutatedCount} / 256 bits`, cardX + 152, cardY + 54);

  avCtx.font = '12px Inter';
  avCtx.fillStyle = '#94a3b8';
  avCtx.fillText('Variance Multiplier:', cardX + 16, cardY + 76);

  avCtx.font = 'bold 13px Fira Code';
  avCtx.fillStyle = '#fbbf24';
  avCtx.fillText(`${pct} Diff`, cardX + 152, cardY + 76);

  avCtx.font = 'italic 11px Inter';
  avCtx.fillStyle = '#64748b';
  avCtx.fillText('A minor input change scrambles >50% bits.', cardX + 16, cardY + 98);
}

// Master Recalculate Function
async function recalculateAvalanche() {
  const valA = inputA.value;
  const valB = inputB.value;

  countA.innerText = `${valA.length} characters (${new TextEncoder().encode(valA).length} bytes)`;
  countB.innerText = `${valB.length} characters (${new TextEncoder().encode(valB).length} bytes)`;

  const [resA, resB] = await Promise.all([computeSHA256(valA), computeSHA256(valB)]);

  // Update output hashes
  hashAOutput.innerText = resA.hex;
  hashBOutput.innerText = resB.hex;

  // Calculate Bit Differences
  let bitDiff = 0;
  for (let i = 0; i < 256; i++) {
    if (resA.binary[i] !== resB.binary[i]) {
      bitDiff++;
    }
  }

  // Calculate Hex Character Differences
  let hexDiff = 0;
  for (let i = 0; i < 64; i++) {
    if (resA.hex[i] !== resB.hex[i]) {
      hexDiff++;
    }
  }

  const avalanchePercentage = ((bitDiff / 256) * 100).toFixed(1);

  // Update top telemetry stats
  statMutatedBits.innerText = bitDiff;
  statAvalanchePct.innerText = `${avalanchePercentage}%`;
  statHexChanged.innerText = `${hexDiff} / 64`;

  // Render Grid
  renderBitGrid(resA.binary, resB.binary);

  // If currently in flow view, re-draw canvas
  if (currentActiveView === 'flow') {
    drawAvalancheFlow();
  }
}

// Initial calculation on page load
recalculateAvalanche();
