
/* =====================================================
   TOPIC 08: GAS FEES & NETWORK RESOURCE PRICING
   LIVE MEMPOOL + VALIDATOR ANIMATION
   ===================================================== */

(() => {
  "use strict";

  const $ = id => document.getElementById(id);

  const pool = $("pool");
  const congestionSlider = $("congestion");
  const tipSlider = $("tip");

  if (!pool || !congestionSlider || !tipSlider) {
    console.error("Simulator HTML elements not found!");
    return;
  }

  const MAX_BLOCK_TX = 12;
  const BLOCK_TIME = 5000;
  const SPAWN_INTERVAL = 650;

  let transactions = [];
  let nextId = 1;
  let blockNumber = 183;
  let lastSpawn = 0;
  let lastBlock = performance.now();
  let lastFrame = 0;
  let paused = false;

  const random = (min, max) =>
    Math.random() * (max - min) + min;

  const congestion = () =>
    Number(congestionSlider.value) / 100;

  const userTip = () =>
    Number(tipSlider.value);

  // ---------------------------------------------
  // 1. GAS FEE CALCULATION
  // ---------------------------------------------

  function calculateBaseFee() {
    return 15 + Number(congestionSlider.value) * 1.52;
  }

  // ---------------------------------------------
  // 2. CREATE TRANSACTIONS
  // ---------------------------------------------

  function createTransaction(options = {}) {

    return {
      id: nextId++,

      fee: options.fee ?? random(1, 25),

      gas: options.gas ?? 21000,

      kind: options.kind ?? "Wallet Transfer",

      mine: options.mine ?? false,

      state: "pending",

      x: options.x ?? random(-5, 5),

      y: options.y ?? random(20, 80),

      phase: random(0, 6.28),

      speed: random(7, 13),

      element: null
    };
  }

  // ---------------------------------------------
  // 3. DRAW TRANSACTION DOTS
  // ---------------------------------------------

  function drawTransaction(tx) {

    const dot = document.createElement("span");

    dot.className = "pool-tx";

    dot.style.cssText = `
      position: absolute;
      width: ${random(15, 28)}px;
      height: ${random(15, 28)}px;
      border-radius: 50%;
      z-index: ${tx.mine ? 5 : 2};
      pointer-events: none;
      box-shadow: inset -4px -5px 9px #0003;
      will-change: left, top, transform;
    `;

    if (tx.mine) {
      dot.style.outline = "3px solid #ffc629";
      dot.style.outlineOffset = "3px";
    }

    tx.element = dot;

    pool.appendChild(dot);

    updateDotColor(tx);

    moveDot(tx);
  }

  // ---------------------------------------------
  // 4. TRANSACTION PRIORITY COLORS
  // ---------------------------------------------

  function updateDotColor(tx) {

    if (!tx.element) return;

    if (tx.fee < 5) {
      tx.element.style.background = "#2879e9";
    }
    else if (tx.fee < 15) {
      tx.element.style.background = "#8433e8";
    }
    else {
      tx.element.style.background = "#e52db5";
    }

    tx.element.title =
      `${tx.kind} | ${tx.fee.toFixed(1)} Gwei`;
  }

  function moveDot(tx) {

    if (!tx.element) return;

    tx.element.style.left = tx.x + "%";
    tx.element.style.top = tx.y + "%";
  }

  // ---------------------------------------------
  // 5. GENERATE NETWORK TRAFFIC
  // ---------------------------------------------

  function generateTransaction() {

    const isContract = Math.random() < 0.22;

    const tx = createTransaction({

      fee: random(1, 8 + congestion() * 22),

      gas: isContract
        ? Math.round(random(80000, 180000))
        : 21000,

      kind: isContract
        ? "Smart Contract"
        : "Wallet Transfer"

    });

    transactions.push(tx);

    drawTransaction(tx);
  }

  // ---------------------------------------------
  // 6. INITIAL MEMPOOL
  // ---------------------------------------------

  function initializeMempool() {

    for (let i = 0; i < 34; i++) {

      const isContract = Math.random() < 0.2;

      const tx = createTransaction({

        fee: random(1, 25),

        gas: isContract ? 150000 : 21000,

        kind: isContract
          ? "Smart Contract"
          : "Wallet Transfer",

        x: random(3, 85)

      });

      transactions.push(tx);

      drawTransaction(tx);
    }

    // Your highlighted transaction

    const mine = createTransaction({

      mine: true,

      fee: userTip(),

      kind: "Your Transfer",

      x: 8,

      y: 51

    });

    transactions.push(mine);

    drawTransaction(mine);
  }

  // ---------------------------------------------
  // 7. MEMPOOL SORTING ENGINE
  // ---------------------------------------------

  function getPendingTransactions() {

    return transactions.filter(
      tx => tx.state === "pending"
    );
  }

  function getSortedTransactions() {

    return getPendingTransactions().sort(
      (a, b) => b.fee - a.fee
    );
  }

  // ---------------------------------------------
  // 8. UPDATE TELEMETRY
  // ---------------------------------------------

  function updateDashboard() {

    const queue = getSortedTransactions();

    const mine = queue.find(tx => tx.mine);

    const rank = mine
      ? queue.findIndex(tx => tx.id === mine.id) + 1
      : 0;

    const slots = Math.max(
      2,
      Math.round(MAX_BLOCK_TX * (1 - congestion() * 0.65))
    );

    const blocks = rank
      ? Math.ceil(rank / slots)
      : 0;

    $("baseFee").textContent =
      calculateBaseFee().toFixed(0) + " Gwei";

    $("congestionValue").textContent =
      congestionSlider.value + "%";

    $("tipValue").textContent =
      "+" + userTip().toFixed(1) + " Gwei";

    $("totalCost").textContent =
      (calculateBaseFee() + userTip()).toFixed(1)
      + " Gwei / gas";

    $("blockTitle").textContent =
      "BLOCK #" + blockNumber;

    $("blockBar").style.width =
      Math.min(
        100,
        25 + Number(congestionSlider.value) * 0.75
      ) + "%";

    $("rank").textContent =
      mine ? "Rank #" + rank : "Processing";

    $("eta").textContent =
      mine
        ? `~${blocks * 12}s (${blocks} blocks)`
        : "~0s (included)";

    const isPriority = mine && rank <= slots;

    $("warning").textContent = mine
      ? isPriority
        ? "✓ Your bid is competitive. Inclusion in the next block is possible."
        : "⚠ Higher-tip transactions are ahead of you. Increase your tip or wait for congestion to fall."
      : "✓ Your transaction has been included in a simulated block.";

    $("warning").style.color =
      mine
        ? isPriority ? "#19d58a" : "#f5bd57"
        : "#19d58a";

    updateQueueTable(queue);
  }

  // ---------------------------------------------
  // 9. DISPLAY QUEUE TABLE
  // ---------------------------------------------

  function updateQueueTable(queue) {

    $("queueRows").innerHTML =
      queue.slice(0, 6).map((tx, index) => {

        return `
          <tr>
            <td>${tx.mine ? "YOU" : "TX-" + tx.id}</td>

            <td>${tx.kind}</td>

            <td>${tx.gas.toLocaleString()}</td>

            <td>${tx.fee.toFixed(1)} Gwei</td>

            <td style="color:${index < 3 ? "#19d58a" : "#ffc629"}">
              ${index < 3 ? "High Priority" : "Waiting"}
            </td>
          </tr>
        `;

      }).join("") ||
      '<tr><td colspan="5">No pending transactions</td></tr>';
  }

  // ---------------------------------------------
  // 10. CONTINUOUS DOT ANIMATION
  // ---------------------------------------------

  function animateTransactions(delta, time) {

    const queue = getSortedTransactions();

    const ranks = new Map(
      queue.map((tx, index) => [tx.id, index])
    );

    for (const tx of transactions) {

      if (
        tx.state !== "pending" ||
        !tx.element
      ) continue;

      const rank = ranks.get(tx.id) ?? queue.length;

      const normalized =
        queue.length > 1
          ? rank / (queue.length - 1)
          : 0;

      // Higher tips receive faster movement.

      const priority = Math.min(1, tx.fee / 30);

      const speed =
        (0.30 + priority * 1.25) *
        (1 - congestion() * 0.62);

      // Move from transaction entry to validator.

      tx.x = Math.min(
        84,
        tx.x + tx.speed * speed * delta
      );

      // Organize transactions vertically.

      const targetY = 18 + normalized * 64;

      tx.y +=
        (targetY - tx.y) *
        Math.min(1, delta * 1.8);

      // Natural floating movement.

      tx.y +=
        Math.sin(time * 2.2 + tx.phase) *
        delta * 1.5;

      moveDot(tx);

      tx.element.style.transform =
        `scale(${0.94 + Math.sin(time * 3 + tx.phase) * 0.06})`;
    }
  }

  // ---------------------------------------------
  // 11. VALIDATOR MINES NEXT BLOCK
  // ---------------------------------------------

  function mineNextBlock() {

    blockNumber++;

    const availableSlots = Math.max(
      2,
      Math.round(MAX_BLOCK_TX * (1 - congestion() * 0.65))
    );

    // Highest priority transactions selected first.

    const selected =
      getSortedTransactions().slice(0, availableSlots);

    selected.forEach((tx, index) => {

      tx.state = "included";

      if (tx.element) {

        tx.element.style.transition =
          "left .45s, top .45s, opacity .45s, transform .45s";

        // Move toward validator block.

        tx.element.style.left =
          (89 + (index % 3) * 3) + "%";

        tx.element.style.top =
          (28 + Math.floor(index / 3) * 12) + "%";

        tx.element.style.opacity = "0";

        tx.element.style.transform = "scale(.3)";

        setTimeout(() => {
          tx.element?.remove();
        }, 480);
      }

    });

    setTimeout(() => {

      transactions = transactions.filter(
        tx => tx.state === "pending"
      );

      updateDashboard();

    }, 500);

    updateDashboard();
  }

  // ---------------------------------------------
  // 12. SUBMIT YOUR TRANSACTION
  // ---------------------------------------------

  function submitTransaction() {

    // Remove old user highlight.

    transactions.forEach(tx => {

      if (tx.mine && tx.state === "pending") {

        tx.mine = false;

        if (tx.element) {
          tx.element.style.outline = "none";
        }
      }

    });

    const mine = createTransaction({

      mine: true,

      fee: userTip(),

      kind: "Your Transfer",

      x: 0,

      y: random(35, 65)

    });

    transactions.push(mine);

    drawTransaction(mine);

    updateDashboard();
  }

  // ---------------------------------------------
  // 13. RESET SIMULATION
  // ---------------------------------------------

  function resetSimulation() {

    cancelAnimationFrame(animationId);

    transactions.forEach(tx => {
      tx.element?.remove();
    });

    transactions = [];

    nextId = 1;

    blockNumber = 183;

    lastSpawn = 0;

    lastBlock = performance.now();

    lastFrame = 0;

    initializeMempool();

    updateDashboard();

    animationId = requestAnimationFrame(animationLoop);
  }

  // ---------------------------------------------
  // 14. MAIN ANIMATION LOOP
  // ---------------------------------------------

  let animationId;

  function animationLoop(timestamp) {

    if (paused) {

      animationId = requestAnimationFrame(animationLoop);

      return;
    }

    const delta = lastFrame
      ? Math.min((timestamp - lastFrame) / 1000, 0.05)
      : 0.016;

    lastFrame = timestamp;

    // New transactions continuously enter the pool.

    const spawnDelay = Math.max(
      180,
      SPAWN_INTERVAL -
      Number(congestionSlider.value) * 4
    );

    if (timestamp - lastSpawn > spawnDelay) {

      generateTransaction();

      lastSpawn = timestamp;
    }

    // Automatically produce blocks.

    if (timestamp - lastBlock > BLOCK_TIME) {

      mineNextBlock();

      lastBlock = timestamp;
    }

    // Animate every transaction.

    animateTransactions(delta, timestamp / 1000);

    animationId = requestAnimationFrame(animationLoop);
  }

  // ---------------------------------------------
  // 15. EVENT LISTENERS
  // ---------------------------------------------

  congestionSlider.addEventListener(
    "input",
    updateDashboard
  );

  tipSlider.addEventListener(
    "input",
    () => {

      const mine = transactions.find(
        tx => tx.mine && tx.state === "pending"
      );

      if (mine) {

        mine.fee = userTip();

        updateDotColor(mine);
      }

      updateDashboard();
    }
  );

  $("submit").addEventListener(
    "click",
    submitTransaction
  );

  $("mine").addEventListener(
    "click",
    () => {

      mineNextBlock();

      lastBlock = performance.now();
    }
  );

  $("reset").addEventListener(
    "click",
    resetSimulation
  );

  // Click network status to pause/resume.

  $("networkState")?.addEventListener(
    "click",
    () => {

      paused = !paused;

      $("networkState").textContent =
        paused
          ? "SIMULATION PAUSED"
          : "NETWORK SIMULATION RUNNING";
    }
  );

  // ---------------------------------------------
  // 16. START SIMULATION
  // ---------------------------------------------

  initializeMempool();

  updateDashboard();

  animationId = requestAnimationFrame(animationLoop);

})();
