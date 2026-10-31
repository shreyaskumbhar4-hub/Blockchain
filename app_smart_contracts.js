/**
 * Smart Contract State Machine & Automated Escrow Simulator (Topic 8)
 * Implements the state machine and exact visual cues from user screenshots:
 *
 * Scenarios:
 * 1. Zero Balance (0.00 ETH / 0% Funded / PENDING DEPOSIT)
 *    - Gray lock icon, empty deposit progress bar, dashed gray wires.
 *
 * 2. Partial Deposit (1.20 ETH / 48% Funded / PENDING DEPOSIT)
 *    - Blue dashed deposit flow arrow from Tenant -> Contract,
 *    - Yellow progress bar at 48%, padlock still locked, key unreleased.
 *
 * 3. Full Target (2.50 ETH / 100% Verified / SUCCESSFUL)
 *    - Glowing green border on Contract Code box,
 *    - Green checkmark icon replaces lock,
 *    - Golden "DEPOSIT LOCKED" badge,
 *    - Green dashed wire flows into Apartment / Digital Access Token node,
 *    - Floating golden key moves to unlocked active state!
 */

// State
let currentDeposit = 0.0;
const TARGET_DEPOSIT = 2.5;

// DOM Elements
const tenantNode = document.getElementById('tenantNode');
const contractCard = document.getElementById('contractCard');
const propertyNode = document.getElementById('propertyNode');
const propertyCircle = document.getElementById('propertyCircle');

const wireDeposit = document.getElementById('wireDeposit');
const flowArrowDeposit = document.getElementById('flowArrowDeposit');
const wireKey = document.getElementById('wireKey');
const flowArrowKey = document.getElementById('flowArrowKey');

const contractStatusCircle = document.getElementById('contractStatusCircle');
const depositProgressBadge = document.getElementById('depositProgressBadge');
const dispDepositRatio = document.getElementById('dispDepositRatio');
const depositBarFill = document.getElementById('depositBarFill');
const floatingKeyToken = document.getElementById('floatingKeyToken');

const statDepositPlaced = document.getElementById('statDepositPlaced');
const statConditionStatus = document.getElementById('statConditionStatus');
const statKeyRelease = document.getElementById('statKeyRelease');

const btnScenarioZero = document.getElementById('btnScenarioZero');
const btnScenarioPartial = document.getElementById('btnScenarioPartial');
const btnScenarioFull = document.getElementById('btnScenarioFull');

const depositRangeSlider = document.getElementById('depositRangeSlider');
const lblDepositSlider = document.getElementById('lblDepositSlider');

// Preset Handlers
btnScenarioZero.addEventListener('click', () => {
  setDeposit(0.0);
  setActiveScenarioBtn(btnScenarioZero);
});

btnScenarioPartial.addEventListener('click', () => {
  setDeposit(1.2);
  setActiveScenarioBtn(btnScenarioPartial);
});

btnScenarioFull.addEventListener('click', () => {
  setDeposit(2.5);
  setActiveScenarioBtn(btnScenarioFull);
});

// Slider Handler
depositRangeSlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  setDeposit(val);
  clearActiveScenarioBtns();
  if (val === 0) setActiveScenarioBtn(btnScenarioZero);
  else if (val === 1.2) setActiveScenarioBtn(btnScenarioPartial);
  else if (val === 2.5) setActiveScenarioBtn(btnScenarioFull);
});

function setActiveScenarioBtn(btn) {
  clearActiveScenarioBtns();
  btn.classList.add('active');
}

function clearActiveScenarioBtns() {
  btnScenarioZero.classList.remove('active');
  btnScenarioPartial.classList.remove('active');
  btnScenarioFull.classList.remove('active');
}

// Master State Machine Updater
function setDeposit(amount) {
  currentDeposit = Math.min(Math.max(amount, 0), TARGET_DEPOSIT);
  depositRangeSlider.value = currentDeposit.toFixed(1);
  lblDepositSlider.innerText = `${currentDeposit.toFixed(1)} ETH`;

  const percentage = Math.round((currentDeposit / TARGET_DEPOSIT) * 100);

  // 1. Update Telemetry
  statDepositPlaced.innerText = `${currentDeposit.toFixed(2)} ETH`;

  if (currentDeposit >= TARGET_DEPOSIT) {
    // -------------------------------------------------------------
    // STATE: 100% VERIFIED & SUCCESSFUL SETTLEMENT (Screenshot 2)
    // -------------------------------------------------------------
    statConditionStatus.innerText = "100% Verified";
    statConditionStatus.className = "ctele-val text-green";

    statKeyRelease.innerText = "SUCCESSFUL";
    statKeyRelease.className = "ctele-val text-green";

    // Contract box turns glowing green with checkmark
    contractCard.className = "contract-machine-card state-verified";
    contractStatusCircle.className = "contract-status-circle circle-verified";
    contractStatusCircle.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    `;

    // Golden "DEPOSIT LOCKED" badge
    dispDepositRatio.innerText = "DEPOSIT LOCKED";
    dispDepositRatio.className = "deposit-progress-text text-gold";
    depositProgressBadge.className = "deposit-progress-badge badge-locked-gold";
    depositBarFill.style.width = "100%";

    // Flow Wires: Both active
    wireDeposit.className = "contract-wire wire-tenant-to-contract active-blue";
    wireKey.className = "contract-wire wire-contract-to-prop active-green";

    // Apartment & Key release glow
    propertyCircle.className = "property-avatar-circle circle-active-green";
    floatingKeyToken.className = "floating-key-token key-unlocked";

  } else if (currentDeposit > 0) {
    // -------------------------------------------------------------
    // STATE: PARTIAL DEPOSIT (Screenshot 1: 1.20 ETH, 48% Funded)
    // -------------------------------------------------------------
    statConditionStatus.innerText = `${percentage}% Funded`;
    statConditionStatus.className = "ctele-val text-yellow";

    statKeyRelease.innerText = "PENDING DEPOSIT";
    statKeyRelease.className = "ctele-val text-light";

    // Contract card in funding state
    contractCard.className = "contract-machine-card state-partial";
    contractStatusCircle.className = "contract-status-circle circle-locked";
    contractStatusCircle.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
      </svg>
    `;

    dispDepositRatio.innerText = `DEPOSIT: ${currentDeposit.toFixed(1)} / 2.5 ETH`;
    dispDepositRatio.className = "deposit-progress-text";
    depositProgressBadge.className = "deposit-progress-badge badge-partial-bar";
    depositBarFill.style.width = `${percentage}%`;

    // Wire: Tenant sending funds (blue active), Key withheld (inactive)
    wireDeposit.className = "contract-wire wire-tenant-to-contract active-blue";
    wireKey.className = "contract-wire wire-contract-to-prop";

    propertyCircle.className = "property-avatar-circle";
    floatingKeyToken.className = "floating-key-token";

  } else {
    // -------------------------------------------------------------
    // STATE: ZERO BALANCE (Screenshot 3: 0.00 ETH, 0% Funded)
    // -------------------------------------------------------------
    statConditionStatus.innerText = "0% Funded";
    statConditionStatus.className = "ctele-val text-yellow";

    statKeyRelease.innerText = "PENDING DEPOSIT";
    statKeyRelease.className = "ctele-val text-light";

    contractCard.className = "contract-machine-card";
    contractStatusCircle.className = "contract-status-circle circle-locked";
    contractStatusCircle.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
      </svg>
    `;

    dispDepositRatio.innerText = "DEPOSIT: 0.0 / 2.5 ETH";
    dispDepositRatio.className = "deposit-progress-text text-dim";
    depositProgressBadge.className = "deposit-progress-badge";
    depositBarFill.style.width = "0%";

    wireDeposit.className = "contract-wire wire-tenant-to-contract";
    wireKey.className = "contract-wire wire-contract-to-prop";

    propertyCircle.className = "property-avatar-circle";
    floatingKeyToken.className = "floating-key-token";
  }
}

// Initial setup
setDeposit(0.0);
