# HyperStream — Developer Integration Guide

> **Contract**: `0xd210d75702836ea5c13457d064045f39d253A235`
> **Network**: Monad Testnet (Chain ID `10143`)
> **RPC**: `https://testnet-rpc.monad.xyz`
> **Solidity**: `0.8.24` · **License**: MIT

---

## What is HyperStream?

HyperStream is a **pull-based payment streaming** contract. Instead of sending discrete payments, you lock tokens in a stream that **continuously unlocks** to the recipient over time, computed by:

```
Balance(t) = min(deposit, (t − startTime) × ratePerSecond)
```

No per-block state updates. No cron jobs. The balance is calculated on-the-fly when queried.

---

## Quick Start

### 1. Approve tokens → 2. Create stream → 3. Recipient withdraws anytime

```solidity
// Step 1: Approve the StreamManager to spend your tokens
IERC20(tokenAddress).approve(STREAM_MANAGER, depositAmount);

// Step 2: Create a 30-day stream
uint256 streamId = streamManager.createStream(
    recipient,           // who receives the funds
    depositAmount,       // total tokens to stream (must be divisible by duration)
    tokenAddress,        // ERC-20 token address
    block.timestamp + 60,// start time (must be in the future)
    block.timestamp + 60 + 30 days // stop time
);

// Step 3: Recipient withdraws whenever they want
streamManager.withdrawFromStream(streamId, amount);
```

---

## ABI Reference

### `createStream`

Creates a new payment stream. Caller must have approved the contract beforehand.

```solidity
function createStream(
    address recipient,
    uint256 deposit,
    address tokenAddress,
    uint256 startTime,
    uint256 stopTime
) external returns (uint256 streamId);
```

| Param | Type | Description |
|-------|------|-------------|
| `recipient` | `address` | Who receives the tokens. Cannot be `address(0)`, the contract itself, or `msg.sender`. |
| `deposit` | `uint256` | Total tokens to stream. **Must be evenly divisible by `(stopTime - startTime)`** to avoid precision loss. |
| `tokenAddress` | `address` | ERC-20 token being streamed. |
| `startTime` | `uint256` | Unix timestamp when streaming begins. **Must be in the future** (`> block.timestamp`). |
| `stopTime` | `uint256` | Unix timestamp when streaming ends. Must be `> startTime`. |

**Returns**: `streamId` — the unique ID for the created stream (starts at 1, auto-increments).

**Reverts**:
- `ZeroAddress()` — recipient or token is zero/contract/sender
- `ZeroDeposit()` — deposit is 0
- `InvalidTimeFrame()` — start ≥ stop, or start is in the past
- `StreamMath: deposit not divisible by duration` — precision guard

---

### `withdrawFromStream`

Recipient pulls earned tokens from a stream.

```solidity
function withdrawFromStream(uint256 streamId, uint256 amount) external;
```

| Param | Type | Description |
|-------|------|-------------|
| `streamId` | `uint256` | ID of the stream. |
| `amount` | `uint256` | Number of tokens to withdraw. Must be `> 0` and `≤` available balance. |

- **Only the recipient** can call this.
- When the stream is fully drained (`remainingBalance == 0`), the storage slot is deleted (gas refund).

---

### `cancelStream`

Either sender or recipient can cancel. Funds are split proportionally.

```solidity
function cancelStream(uint256 streamId) external;
```

- Tokens already earned → sent to **recipient**
- Tokens not yet earned → refunded to **sender**
- Stream storage is deleted after cancellation.

**Emits**: `StreamCanceled(streamId, senderBalance, recipientBalance)`

---

### `balanceOf` (view)

Returns the real-time withdrawable or reclaimable balance for an address.

```solidity
function balanceOf(uint256 streamId, address who) external view returns (uint256 balance);
```

| `who` | Returns |
|-------|---------|
| `recipient` | Tokens that can be withdrawn right now |
| `sender` | Tokens the sender would recover if stream were canceled now |

**Reverts** with `UnauthorizedCaller` if `who` is neither sender nor recipient.

---

### `getStream` (view)

Returns the full stream struct.

```solidity
function getStream(uint256 streamId) external view returns (Stream memory);
```

```solidity
struct Stream {
    address sender;
    address recipient;
    uint256 deposit;
    address tokenAddress;
    uint256 startTime;
    uint256 stopTime;
    uint256 ratePerSecond;
    uint256 remainingBalance;
}
```

---

## Events

```solidity
event StreamCreated(
    uint256 indexed streamId,
    address indexed sender,
    address indexed recipient,
    uint256 deposit,
    address tokenAddress,
    uint256 startTime,
    uint256 stopTime
);

event WithdrawFromStream(
    uint256 indexed streamId,
    address indexed recipient,
    uint256 amount
);

event StreamCanceled(
    uint256 indexed streamId,
    uint256 senderBalance,
    uint256 recipientBalance
);
```

---

## Errors

| Error | When |
|-------|------|
| `ZeroAddress()` | Recipient or token is zero, contract address, or same as sender |
| `InvalidTimeFrame()` | Start ≥ stop, or start is in the past |
| `ZeroDeposit()` | Deposit amount is 0 |
| `StreamDoesNotExist(uint256)` | Stream ID doesn't exist or was already canceled/drained |
| `UnauthorizedCaller(address)` | Caller is neither sender nor recipient |
| `ArithmeticOverflow()` | Withdraw amount is 0 or exceeds available balance |

---

## Integration Examples

### ethers.js v6

```javascript
import { ethers } from 'ethers';
import StreamManagerABI from './StreamManager.json'; // from forge build output

const STREAM_MANAGER = '0xd210d75702836ea5c13457d064045f39d253A235';
const provider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const sm = new ethers.Contract(STREAM_MANAGER, StreamManagerABI.abi, signer);

// 1) Approve tokens
const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
await token.approve(STREAM_MANAGER, ethers.parseUnits('1000', 18));

// 2) Create a 1-hour stream of 3600 tokens (1 token/sec — perfectly divisible)
const now = Math.floor(Date.now() / 1000);
const tx = await sm.createStream(
    recipientAddress,
    ethers.parseUnits('3600', 18),
    TOKEN_ADDRESS,
    now + 60,            // starts in 1 minute
    now + 60 + 3600      // lasts 1 hour
);
const receipt = await tx.wait();
const streamId = receipt.logs[1].args[0]; // StreamCreated event

// 3) Check real-time balance
const balance = await sm.balanceOf(streamId, recipientAddress);
console.log('Withdrawable:', ethers.formatUnits(balance, 18));

// 4) Withdraw (as recipient)
await sm.withdrawFromStream(streamId, balance);

// 5) Cancel (as sender or recipient)
await sm.cancelStream(streamId);
```

### viem + wagmi (React)

```typescript
import { useReadContract, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';

const STREAM_MANAGER = '0xd210d75702836ea5c13457d064045f39d253A235' as const;

// Read stream info
const { data: stream } = useReadContract({
    address: STREAM_MANAGER,
    abi: StreamManagerABI,
    functionName: 'getStream',
    args: [streamId],
});

// Read real-time balance (poll every second for live updates)
const { data: balance } = useReadContract({
    address: STREAM_MANAGER,
    abi: StreamManagerABI,
    functionName: 'balanceOf',
    args: [streamId, recipientAddress],
    query: { refetchInterval: 1000 },
});

// Create stream
const { writeContract } = useWriteContract();
writeContract({
    address: STREAM_MANAGER,
    abi: StreamManagerABI,
    functionName: 'createStream',
    args: [recipient, parseUnits('3600', 18), tokenAddr, startTime, stopTime],
});
```

### Foundry CLI (`cast`)

```bash
# Read a stream
cast call 0xd210d75702836ea5c13457d064045f39d253A235 \
  "getStream(uint256)" 1 \
  --rpc-url https://testnet-rpc.monad.xyz

# Check balance
cast call 0xd210d75702836ea5c13457d064045f39d253A235 \
  "balanceOf(uint256,address)" 1 0xRecipient... \
  --rpc-url https://testnet-rpc.monad.xyz

# Create stream (write)
cast send 0xd210d75702836ea5c13457d064045f39d253A235 \
  "createStream(address,uint256,address,uint256,uint256)" \
  0xRecipient 3600000000000000000000 0xTokenAddr 1700000000 1700003600 \
  --rpc-url https://testnet-rpc.monad.xyz --private-key $PK
```

---

## Important Gotchas

### 1. Deposit must be divisible by duration
The contract enforces `deposit % duration == 0` to guarantee no precision loss. If you're streaming 1000 USDC over 3 hours (10800 seconds), `1000e6 % 10800 != 0` — this **will revert**. Adjust to a compatible amount (e.g., `10800e6` = 10,800 USDC, or pick a duration that divides evenly).

### 2. Start time must be in the future
You can't use `block.timestamp` as start time — it must be strictly greater. Use `block.timestamp + 60` or similar.

### 3. Recipient can't be the sender
Self-streaming is not allowed. Sender and recipient must be different addresses.

### 4. Streams are deleted when fully withdrawn or canceled
Once `remainingBalance` hits 0 or the stream is canceled, `getStream()` will revert with `StreamDoesNotExist`. Index `StreamCreated` events off-chain if you need historical data.

### 5. ERC-20 approval required before `createStream`
The contract uses `safeTransferFrom` — make sure to call `token.approve(streamManager, amount)` first.

---

## Architecture

```
StreamManager.sol          ← Main contract (254 lines)
├── IStreamManager.sol     ← Interface / ABI definition
└── StreamMath.sol         ← Pure math library (inlined at compile time)
```

- **No admin keys, no upgradability, no proxy** — it's immutable once deployed.
- **ReentrancyGuard** on `withdraw` and `cancel` to prevent reentrancy attacks.
- **SafeERC20** for safe token transfers (handles non-standard ERC-20s).
- **CEI pattern** (Checks-Effects-Interactions) followed throughout.
- **Storage cleanup** — streams are deleted when fully drained (gas refund).

---

## Gas Estimates (Monad Testnet)

| Operation | Approx. Gas |
|-----------|------------|
| Deploy | ~2,100,000 |
| `createStream` | ~180,000 |
| `withdrawFromStream` | ~85,000 |
| `cancelStream` | ~95,000 |
| `balanceOf` (view) | ~5,000 |
| `getStream` (view) | ~3,000 |

---

## Need Help?

- **Full contract source**: [`contracts/StreamManager.sol`](./StreamManager.sol)
- **Interface**: [`contracts/interfaces/IStreamManager.sol`](./interfaces/IStreamManager.sol)
- **Test suite**: [`contracts/test/StreamManager.t.sol`](./test/StreamManager.t.sol) — 24 tests including fuzz tests
- **Deployment guide**: [`DEPLOYMENT.md`](../DEPLOYMENT.md)
