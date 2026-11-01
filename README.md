# Blockchain & Consensus Architecture Academy

This project is an interactive web simulation lab and educational platform for understanding how centralized systems differ from decentralized blockchain architectures. It covers intervention resistance, cryptographic integrity, consensus, key management, smart contracts, and gas-fee economics.

## What this project covers

- Centralized vs decentralized system behavior under intervention
- Peer-equivalent mesh networks versus star-topology control points
- Hash linkage and tamper detection using previous-hash chaining
- Avalanche effect and one-way cryptographic hashing
- Public/private key cryptography and digital signatures
- Public vs private blockchain trade-offs
- Smart contracts and programmable escrow workflows
- Gas fees and transaction cost simulation
- Proof of Work and Proof of Stake comparison

## Curriculum modules

| File | Topic | Description |
| :--- | :--- | :--- |
| [`index.html`](./index.html) | Main Learning Portal | Landing page that links the full curriculum and shows module cards. |
| [`topic1-intervention-simulation.html`](./topic1-intervention-simulation.html) | Topic 1: Functional Comparison Under Intervention | Compares centralized control and decentralized resilience under freeze attempts. |
| [`topic2-chain-integrity.html`](./topic2-chain-integrity.html) | Topic 2: Chain integrity & tampering | Explains block linkage, previous hashes, and how tampering breaks the chain. |
| [`topic3-architectural-guide.html`](./topic3-architectural-guide.html) | Topic 3: Architecture guide | A reference document with diagrams, code comparisons, and design explanations. |
| [`topic4-avalanche-effect.html`](./topic4-avalanche-effect.html) | Topic 4: Avalanche effect lab | Demonstrates how tiny input changes trigger major hash differences. |
| [`topic5-asymmetric-cryptography.html`](./topic5-asymmetric-cryptography.html) | Topic 5: Asymmetric cryptography | Illustrates public/private keys, receiving funds, and signing transactions. |
| [`topic6-public-vs-private.html`](./topic6-public-vs-private.html) | Topic 6: Public vs private chains | Compares permissionless broadcast with permissioned enterprise operation. |
| [`topic7-pow-vs-pos.html`](./topic7-pow-vs-pos.html) | Topic 7: PoW vs PoS consensus | Interactive simulator of hash racing and stake-based validation. |
| [`topic7-smart-contracts.html`](./topic7-smart-contracts.html) | Topic 7: Smart contracts & escrow | Models state transitions and automated execution for escrow workflows. |
| [`topic8-gas-fees-simulator.html`](./topic8-gas-fees-simulator.html) | Topic 8: Gas fee simulation | Explains transaction cost drivers and fee behavior in blockchain networks. |

## Supporting files

- [`ARCHITECTURE_GUIDE.md`](./ARCHITECTURE_GUIDE.md) â€” deeper architecture notes and explanations
- [`CHAT_README.md`](./CHAT_README.md) â€” usage notes and conversation-oriented documentation
- [`architecture_diagram.png`](./architecture_diagram.png) â€” architecture visualization
- [`blockchain_tamper_demo.py`](./blockchain_tamper_demo.py) â€” demo script for tamper detection and hashing concepts
- [`app.js`](./app.js) and other `app_*.js` files â€” JavaScript logic for the simulations
- [`style.css`](./style.css) â€” styling for the learning site

## Run locally

### Option 1: Open directly

```powershell
start index.html
```

### Option 2: Local web server

```powershell
npx serve .
```

Then open the local URL shown in the terminal, typically:

```text
http://localhost:3000
```

You can also use a simple Python server:

```powershell
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Notes

- This project is a front-end learning experience and does not require a blockchain node or backend service.
- It is best used in a modern browser with JavaScript enabled.
- The site is designed for teaching and visual exploration rather than production deployment.

## License

This project is licensed under the MIT License.
