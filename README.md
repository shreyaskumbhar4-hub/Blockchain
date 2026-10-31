# Blockchain & Consensus Architecture Academy

An interactive educational web lab for understanding how blockchain systems differ from centralized systems, how data integrity is enforced through cryptographic hashing, and how consensus, key management, and smart contracts enable trust-minimized coordination.

This project presents a collection of browser-based simulations and reference pages that explain blockchain architecture from a systems perspective. It combines visual experiments, reference diagrams, and educational walkthroughs designed for learners, instructors, and builders exploring decentralized systems.

## What this project covers

- Centralized vs decentralized system behavior under intervention
- Peer-equivalent mesh networks versus star-topology control points
- Hash linkage and tamper detection using previous-hash chaining
- Avalanche effect and one-way cryptographic hashing
- Public/private key cryptography and digital signatures
- Public vs private blockchain trade-offs
- Smart contracts and escrow state machines
- Gas fees and transaction cost simulation

## Curriculum modules

| File | Topic | Description |
| :--- | :--- | :--- |
| [`index.html`](./index.html) | Main learning portal | Landing page that links the full curriculum and shows module cards. |
| [`topic1-intervention-simulation.html`](./topic1-intervention-simulation.html) | Intervention simulation | Compares centralized control and decentralized resilience under freeze attempts. |
| [`topic2-chain-integrity.html`](./topic2-chain-integrity.html) | Chain integrity & tampering | Explains block linkage, previous hashes, and how tampering breaks the chain. |
| [`topic3-architectural-guide.html`](./topic3-architectural-guide.html) | Architecture guide | A reference document with diagrams, code comparisons, and design explanations. |
| [`topic4-avalanche-effect.html`](./topic4-avalanche-effect.html) | Avalanche effect lab | Demonstrates how tiny input changes trigger major hash differences. |
| [`topic5-asymmetric-cryptography.html`](./topic5-asymmetric-cryptography.html) | Asymmetric cryptography | Illustrates public/private keys, receiving funds, and signing transactions. |
| [`topic6-public-vs-private.html`](./topic6-public-vs-private.html) | Public vs private chains | Compares permissionless broadcast with permissioned enterprise operation. |
| [`topic7-smart-contracts.html`](./topic7-smart-contracts.html) | Smart contracts & escrow | Models state transitions and automated execution for escrow workflows. |
| [`topic8-gas-fees-simulator.html`](./topic8-gas-fees-simulator.html) | Gas fee simulation | Explains transaction cost drivers and fee behavior in blockchain networks. |

## Supporting files

- [`ARCHITECTURE_GUIDE.md`](./ARCHITECTURE_GUIDE.md) — deeper architecture notes and explanations
- [`CHAT_README.md`](./CHAT_README.md) — usage notes and conversation-oriented documentation
- [`architecture_diagram.png`](./architecture_diagram.png) — architecture visualization
- [`blockchain_tamper_demo.py`](./blockchain_tamper_demo.py) — demo script for tamper detection and hashing concepts
- [`app.js`](./app.js) and other `app_*.js` files — JavaScript logic for the simulations
- [`style.css`](./style.css) — styling for the learning site

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

