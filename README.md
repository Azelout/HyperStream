# HyperStream

A **Web3 music streaming platform** built on Monad Testnet that pays artists in real-time using on-chain payment streams. Instead of flat subscription fees, listeners lock tokens that continuously unlock to artists **per second** as they listen.

---

## Demo

![HyperStream-music](demo.webp)

---
## How It Works

1. **Connect** your wallet (MetaMask, Rabby, etc.)
2. **Wrap MON** → WMON via the built-in wrapper
3. **Approve** the StreamManager contract to spend your WMON
4. **Select a track** and press play — a payment stream opens on-chain, sending WMON to the artist in real time
5. **Stop** the stream anytime to cancel it; unstreamed tokens are returned to you

The streamed balance is computed on-the-fly using:

$$\text{Balance}(t) = \min\left(\text{deposit},\ (t - t_{\text{start}}) \times \text{ratePerSecond}\right)$$

No per-block state updates. No cron jobs.

---

## Architecture

```
monad_blitz/
├── contracts/           # Solidity smart contracts (Foundry)
│   ├── StreamManager.sol          # Core payment streaming logic
│   ├── interfaces/IStreamManager.sol
│   ├── libraries/StreamMath.sol   # Precision-safe math library
│   ├── script/DeployStreamManager.s.sol
│   └── test/StreamManager.t.sol
└── frontend/            # Next.js 16 web application
    └── src/
        ├── app/         # Pages & global styles
        ├── components/  # Header, TrackList, PlayerBar, etc.
        ├── config/      # Contract addresses & ABIs
        ├── data/        # Track catalogue
        └── hooks/       # useStreamManager, useTokenApproval, etc.
```

---

## Smart Contracts

| Contract | Address (Monad Testnet) |
|---|---|
| `StreamManager` | `0xd210d75702836ea5c13457d064045f39d253A235` |
| `WMON` | `0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541` |

- **Network**: Monad Testnet (Chain ID `10143`)
- **RPC**: `https://testnet-rpc.monad.xyz`
- **Solidity**: `0.8.24` · **License**: MIT

### Key Features
- Pull-based linear streaming — recipients withdraw earned tokens at will
- Optimized for Monad's Optimistic Concurrency Control (OCC)
- Exact divisibility guard prevents silent precision loss
- ReentrancyGuard on all state-mutating functions
- 24 tests, 100% passing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart contracts | Solidity 0.8.24, Foundry |
| Frontend | Next.js 16, React 19, TypeScript |
| Web3 | wagmi v2, viem v2, RainbowKit |
| Styling | Tailwind CSS v4 |
| Notifications | react-hot-toast |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18 and npm
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for contract development)
- A wallet with Monad Testnet MON tokens ([faucet](https://faucet.monad.xyz))

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Contracts

```bash
# Install dependencies
forge install

# Compile
forge build

# Run tests (24 tests)
forge test

# Verbose with gas report
forge test -vvv --gas-report
```

### Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full deployment guide, including environment variables and Monad Testnet setup.

---

## Contract Integration

```solidity
// 1. Approve StreamManager
IERC20(wmon).approve(STREAM_MANAGER, depositAmount);

// 2. Create a stream (deposit must be divisible by duration)
uint256 streamId = streamManager.createStream(
    artistAddress,
    depositAmount,
    wmon,
    block.timestamp + 60,         // start
    block.timestamp + 60 + 3600   // end (1 hour)
);

// 3. Recipient withdraws earned tokens anytime
streamManager.withdrawFromStream(streamId, amount);

// 4. Cancel and recover unstreamed tokens
streamManager.cancelStream(streamId);
```

---

## Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) — step-by-step deployment guide
- [contracts/SMART_CONTRACTS.md](contracts/SMART_CONTRACTS.md) — full contract architecture & ABI reference
- [contracts/DEV_GUIDE.md](contracts/DEV_GUIDE.md) — developer integration guide
- [frontend/README.md](frontend/README.md) — Next.js app details
