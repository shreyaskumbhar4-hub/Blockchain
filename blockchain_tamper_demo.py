"""
Live Blockchain Cryptographic Integrity & Tamper-Evident Simulation
Demonstrates:
1. SHA-256 Hashing & The Avalanche Effect (changing 1 character changes the entire hash)
2. Block structure with Block Header (Index, PrevHash, Timestamp, Nonce, MerkleRoot) & Body
3. 3-Block Chain Link Simulation (Block 101, 102, 103)
4. Attack Simulation: Mutating Block 102 and detecting the Broken Link across the network
5. Merkle Tree bundling demonstration
"""

import hashlib
import time
import json
import sys
from dataclasses import dataclass, asdict
from typing import List

# Ensure UTF-8 output on Windows terminal
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')



def sha256(data: str) -> str:
    """Calculates standard SHA-256 hex digest."""
    return hashlib.sha256(data.encode('utf-8')).hexdigest()


# -------------------------------------------------------------------------
# 1. LIVE AVALANCHE EFFECT DEMO
# -------------------------------------------------------------------------
def demo_avalanche_effect():
    print("=" * 75)
    print("1. SHA-256 AVALANCHE EFFECT DEMO")
    print("=" * 75)
    
    t1 = "Bob -> Ethan: 0.5 BTC"
    t2 = "Bob -> Ethan: 0.6 BTC"  # Only 1 digit difference!
    
    h1 = sha256(t1)
    h2 = sha256(t2)
    
    print(f"Original Text: '{t1}'")
    print(f"SHA-256 Hash : {h1}\n")
    print(f"Altered Text : '{t2}'")
    print(f"SHA-256 Hash : {h2}\n")
    
    # Calculate bit difference
    bin1 = bin(int(h1, 16))[2:].zfill(256)
    bin2 = bin(int(h2, 16))[2:].zfill(256)
    diff_bits = sum(c1 != c2 for c1, c2 in zip(bin1, bin2))
    
    print(f"Changed characters : 1 single digit ('5' -> '6')")
    print(f"Bit difference     : {diff_bits} out of 256 bits ({diff_bits / 256 * 100:.1f}%) flipped!")
    print("Result: Complete mathematical transformation (Avalanche Effect).\n")


# -------------------------------------------------------------------------
# 2. MERKLE TREE IMPLEMENTATION
# -------------------------------------------------------------------------
class MerkleTree:
    """Bundles list of transaction strings into a single root cryptographic hash."""
    @staticmethod
    def get_merkle_root(transactions: List[str]) -> str:
        if not transactions:
            return sha256("")
        
        current_level = [sha256(tx) for tx in transactions]
        
        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                # If odd count of nodes, duplicate the last node
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                combined = left + right
                next_level.append(sha256(combined))
            current_level = next_level
            
        return current_level[0]


# -------------------------------------------------------------------------
# 3. BLOCK & BLOCKCHAIN ARCHITECTURE
# -------------------------------------------------------------------------
@dataclass
class Block:
    index: int
    prev_hash: str
    timestamp: str
    transactions: List[str]
    nonce: int = 0
    hash: str = ""

    def calculate_hash(self) -> str:
        merkle_root = MerkleTree.get_merkle_root(self.transactions)
        header_payload = f"{self.index}{self.prev_hash}{self.timestamp}{merkle_root}{self.nonce}"
        return sha256(header_payload)

    def mine_block(self, difficulty: int = 3):
        """Proof-of-work: mines block hash until it starts with leading zeros."""
        target = "0" * difficulty
        while True:
            h = self.calculate_hash()
            if h.startswith(target):
                self.hash = h
                return
            self.nonce += 1


class Blockchain:
    def __init__(self):
        self.chain: List[Block] = []

    def add_block(self, block: Block):
        if not block.hash:
            block.mine_block(difficulty=2)
        self.chain.append(block)

    def validate_chain(self) -> (bool, str):
        """Verifies full cryptographic continuity across the entire ledger."""
        for i in range(len(self.chain)):
            current = self.chain[i]
            
            # Check 1: Has block body or header been tampered with?
            recalculated_hash = current.calculate_hash()
            if recalculated_hash != current.hash:
                return False, f"Block #{current.index} data tampered! Stored Hash != Computed Hash."
            
            # Check 2: Does current block's prev_hash match parent's actual hash?
            if i > 0:
                parent = self.chain[i - 1]
                if current.prev_hash != parent.hash:
                    return False, (
                        f"💥 BROKEN CHAIN LINK between Block #{parent.index} and Block #{current.index}!\n"
                        f"  -> Block #{parent.index} Hash is: {parent.hash}\n"
                        f"  -> Block #{current.index} expects Previous Hash: {current.prev_hash}"
                    )
        return True, "✅ ALL BLOCKS VALID. Cryptographic integrity verified across network."


# -------------------------------------------------------------------------
# 4. EXECUTION: 3-BLOCK CHAIN & ATTACK SIMULATION
# -------------------------------------------------------------------------
def main():
    demo_avalanche_effect()

    print("=" * 75)
    print("2. BUILDING 3-BLOCK LEDGER (BLOCKS #101, #102, #103)")
    print("=" * 75)

    bc = Blockchain()

    # Block 101 (Parent)
    b101 = Block(
        index=101,
        prev_hash="0000a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abc",
        timestamp="2026-10-30 19:25:01 UTC",
        transactions=[
            "Alice -> Bob: 1.2 BTC",
            "Charlie -> Dave: 0.4 BTC"
        ]
    )
    b101.mine_block(difficulty=2)
    bc.add_block(b101)

    # Block 102 (Current Block) - Links explicitly to b101.hash
    b102 = Block(
        index=102,
        prev_hash=b101.hash,
        timestamp="2026-10-30 19:35:14 UTC",
        transactions=[
            "Bob -> Ethan: 0.5 BTC",
            "Frank -> Grace: 2.1 BTC"
        ]
    )
    b102.mine_block(difficulty=2)
    bc.add_block(b102)

    # Block 103 (Child Block) - Links explicitly to b102.hash
    b103 = Block(
        index=103,
        prev_hash=b102.hash,
        timestamp="2026-10-30 19:45:32 UTC",
        transactions=[
            "Ethan -> Dave: 0.1 BTC",
            "Ivy -> Jack: 0.8 BTC"
        ]
    )
    b103.mine_block(difficulty=2)
    bc.add_block(b103)

    for b in bc.chain:
        print(f"Block #{b.index}:")
        print(f"  Previous Hash : {b.prev_hash[:16]}...{b.prev_hash[-8:]}")
        print(f"  Transactions  : {b.transactions}")
        print(f"  Nonce         : {b.nonce}")
        print(f"  Current Hash  : {b.hash[:16]}...{b.hash[-8:]}\n")

    is_valid, msg = bc.validate_chain()
    print("Network Audit Status:", msg)
    print()

    # ---------------------------------------------------------------------
    # 5. ATTACK SIMULATION: HACKER ALTERS BLOCK #102
    # ---------------------------------------------------------------------
    print("=" * 75)
    print("3. ATTACK SIMULATION: TAMPERING WITH BLOCK #102")
    print("=" * 75)
    print("Hacker alters transaction in Block #102:")
    print("  FROM: 'Bob -> Ethan: 0.5 BTC'")
    print("  TO  : 'Bob -> Ethan: 100 BTC' (Theft Attempt)\n")

    original_hash_102 = b102.hash
    # Malicious modification
    b102.transactions[0] = "Bob -> Ethan: 100 BTC"
    
    # The moment data alters, its cryptographic signature recalculates
    mutated_hash_102 = b102.calculate_hash()
    b102.hash = mutated_hash_102

    print(f"Original Block 102 Hash : {original_hash_102}")
    print(f"Mutated Block 102 Hash  : {mutated_hash_102}")
    print()

    # Run network validation
    print("--- INDEPENDENT FULL NODES AUDITING CHAIN ---")
    is_valid, msg = bc.validate_chain()
    print(f"Valid Chain? {is_valid}")
    print(msg)
    print("\nCONCLUSION:")
    print("Because Block #103 hardcodes Block #102's original hash as its parent link,")
    print("the change breaks the chain link instantly. The entire global network rejects")
    print("Block #102 without needing a central administrator.")


if __name__ == "__main__":
    main()
