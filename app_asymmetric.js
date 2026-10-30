/**
 * Asymmetric Cryptography & Digital Signature Simulator (Topic 5)
 * Accurately implements the exact interactive states, nodes, and animations
 * from User Screenshots:
 * - Receive Mode (Incoming deposit: External Sender -> Public Key Address)
 * - Spend Mode (Outbound spending: Private Key signs SIG[C734AB] -> Public Key -> Network Ledger)
 */

const accounts = {
  bob: {
    name: "Bob’s Keypair",
    pubKey: "0x71C8...3902",
    privKey: "0x6c54...e11a",
    balance: 12.50,
    sigPrefix: "SIG[C734AB]"
  },
  alice: {
    name: "Alice’s Keypair",
    pubKey: "0x34A1...78DF",
    privKey: "0x98b1...f002",
    balance: 4.82,
    sigPrefix: "SIG[F812E0]"
  },
  charlie: {
    name: "Charlie’s Keypair",
    pubKey: "0x89EE...110B",
    privKey: "0x12c4...aa39",
    balance: 29.10,
    sigPrefix: "SIG[334B8C]"
  }
};

let currentAccount = accounts.bob;
let currentMode = 'receive'; // 'receive' | 'spend'
let isSimulating = false;

// DOM Elements
const accountSelect = document.getElementById('accountSelect');
const btnReceiveMode = document.getElementById('btnReceiveMode');
const btnSpendMode = document.getElementById('btnSpendMode');
const btnExecuteSimulation = document.getElementById('btnExecuteSimulation');

const actorNode = document.getElementById('actorNode');
const actorIconWrap = document.getElementById('actorIconWrap');
const actorIcon = document.getElementById('actorIcon');
const actorTitle = document.getElementById('actorTitle');

const publicCard = document.getElementById('publicCard');
const privateCard = document.getElementById('privateCard');
const cryptoAuthPill = document.getElementById('cryptoAuthPill');

const dispPublicKey = document.getElementById('dispPublicKey');
const dispPrivateKey = document.getElementById('dispPrivateKey');
const dispSig = document.getElementById('dispSig');

const modeExplanationPill = document.getElementById('modeExplanationPill');
const teleIdentity = document.getElementById('teleIdentity');
const teleBalance = document.getElementById('teleBalance');
const teleState = document.getElementById('teleState');

const particleLeft = document.getElementById('particleLeft');
const particleRight = document.getElementById('particleRight');

// Mode Switcher: Receive Mode
btnReceiveMode.addEventListener('click', () => {
  if (isSimulating) return;
  setMode('receive');
});

// Mode Switcher: Spend Mode
btnSpendMode.addEventListener('click', () => {
  if (isSimulating) return;
  setMode('spend');
});

function setMode(mode) {
  currentMode = mode;
  if (mode === 'receive') {
    btnReceiveMode.classList.add('active');
    btnSpendMode.classList.remove('active');

    // Actor Node reflects External Sender (Down arrow icon)
    actorTitle.innerText = "External Sender";
    actorIconWrap.className = "node-icon-wrap icon-green";
    actorIconWrap.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 5v14M19 12l-7 7-7-7"/>
      </svg>
    `;

    // Auth Pill is hidden in pure inbound receive mode
    cryptoAuthPill.classList.remove('visible');

    // Explanation Pill text matching Screenshot 2
    modeExplanationPill.innerText = "Public keys act like an address anyone can use to forward asset deposits.";
    teleState.innerText = "Awaiting";
    teleState.className = "tele-val text-light";

    publicCard.classList.remove('active-glow');
    privateCard.classList.remove('active-glow');
  } else {
    // Spend Mode
    btnSpendMode.classList.add('active');
    btnReceiveMode.classList.remove('active');

    // Actor Node reflects Network Ledger (Cloud icon matching Screenshot 1)
    actorTitle.innerText = "Network Ledger";
    actorIconWrap.className = "node-icon-wrap icon-blue";
    actorIconWrap.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
        <polyline points="12 12 12 8 14 10"/>
      </svg>
    `;

    // Auth Pill appears in spend mode matching Screenshot 1
    cryptoAuthPill.classList.add('visible');
    dispSig.innerText = currentAccount.sigPrefix;

    // Explanation Pill text matching Screenshot 1
    modeExplanationPill.innerText = "Outbound actions require your secret Private Key to cryptographically sign and authorize the transfer.";
    teleState.innerText = "Standby";
    teleState.className = "tele-val text-light";
  }
}

// Account Switcher
accountSelect.addEventListener('change', (e) => {
  currentAccount = accounts[e.target.value] || accounts.bob;
  updateAccountUI();
});

function updateAccountUI() {
  teleIdentity.innerText = currentAccount.name;
  teleBalance.innerText = `${currentAccount.balance.toFixed(2)} BTC`;
  dispPublicKey.innerText = currentAccount.pubKey;
  dispPrivateKey.innerText = currentAccount.privKey;
  dispSig.innerText = currentAccount.sigPrefix;
}

// Simulation Runner
btnExecuteSimulation.addEventListener('click', async () => {
  if (isSimulating) return;
  isSimulating = true;
  btnExecuteSimulation.disabled = true;

  if (currentMode === 'receive') {
    // -------------------------------------------------------------------------
    // RECEIVE SIMULATION:
    // External Sender deposits 0.75 BTC to Public Key Address
    // -------------------------------------------------------------------------
    teleState.innerText = "Routing Deposit...";
    teleState.className = "tele-val text-amber";

    // Particle moves from Actor (External Sender) to Public Key Address
    particleLeft.className = "packet-particle active-left";
    await wait(800);

    publicCard.classList.add('active-glow');
    currentAccount.balance += 0.75;
    teleBalance.innerText = `${currentAccount.balance.toFixed(2)} BTC`;
    teleState.innerText = "Confirmed ✓";
    teleState.className = "tele-val text-green";

    await wait(600);
    particleLeft.className = "packet-particle";
    await wait(800);
    publicCard.classList.remove('active-glow');

  } else {
    // -------------------------------------------------------------------------
    // SPEND SIMULATION:
    // 1. Private key generates ECDSA signature
    // 2. SIG passes through Public Address to verify identity
    // 3. Network Ledger adjusts balance
    // -------------------------------------------------------------------------
    teleState.innerText = "Signing Payload...";
    teleState.className = "tele-val text-red";

    // 1. Private key flashes and produces signature
    privateCard.classList.add('active-glow');
    await wait(600);

    // Particle flows from Private Key to Auth Pill
    particleRight.className = "packet-particle active-right";
    await wait(600);
    cryptoAuthPill.classList.add('pulse-glow');
    await wait(600);

    // Signature passes through Public Key Address for decoupled verification
    publicCard.classList.add('active-glow');
    teleState.innerText = "Verifying Quorum...";
    teleState.className = "tele-val text-blue";
    await wait(700);

    // Particle travels to Network Ledger
    particleLeft.className = "packet-particle active-left-reverse";
    await wait(700);

    // Balance deducted and state confirmed
    if (currentAccount.balance >= 0.50) {
      currentAccount.balance -= 0.50;
    }
    teleBalance.innerText = `${currentAccount.balance.toFixed(2)} BTC`;
    teleState.innerText = "Confirmed ✓";
    teleState.className = "tele-val text-green";

    await wait(800);
    privateCard.classList.remove('active-glow');
    publicCard.classList.remove('active-glow');
    cryptoAuthPill.classList.remove('pulse-glow');
    particleLeft.className = "packet-particle";
    particleRight.className = "packet-particle";
  }

  isSimulating = false;
  btnExecuteSimulation.disabled = false;
});

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initial Setup
updateAccountUI();
setMode('receive');
