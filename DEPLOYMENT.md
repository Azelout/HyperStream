# HyperStream Smart Contract Deployment Guide

This guide walks you through deploying the HyperStream payment streaming protocol to Monad testnet or mainnet.

---

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- A crypto wallet (MetaMask, Rabby, etc.)
- MON tokens for gas (testnet or mainnet)

### Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Verify installation:
```bash
forge --version
```

---

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Azelout/HyperStream.git
cd HyperStream
git checkout contracts
```

### 2. Install Dependencies

```bash
forge install
```

This installs:
- `forge-std` (Foundry standard library)
- `openzeppelin-contracts` (SafeERC20, ReentrancyGuard, ERC20Mock)

### 3. Compile Contracts

```bash
forge build
```

Expected output:
```
[⠊] Compiling...
[⠒] Compiling 38 files with Solc 0.8.24
[⠰] Solc 0.8.24 finished in 884.03ms
Compiler run successful!
```

---

## Testing

Before deploying, run the test suite to ensure everything works:

```bash
forge test
```

All 24 tests should pass:
```
Ran 24 tests for contracts/test/StreamManager.t.sol:StreamManagerTest
[PASS] testFuzz_BalanceSumInvariant (runs: 256)
[PASS] testFuzz_CalculateUnlockedAmount (runs: 256)
...
Suite result: ok. 24 passed; 0 failed; 0 skipped
```

For verbose output with gas reports:
```bash
forge test -vvv --gas-report
```

---

## Deployment

### 1. Get Testnet Tokens

**Monad Testnet Faucet**:
- Visit: https://faucet.monad.xyz
- Paste your wallet address
- Request test MON tokens

Verify you received funds:
```bash
cast balance <YOUR_WALLET_ADDRESS> --rpc-url https://testnet-rpc.monad.xyz
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env  # If .env.example exists, otherwise create manually
```

Add your configuration:
```bash
# .env
PRIVATE_KEY=0x1234...your_private_key_here
RPC_URL=https://testnet-rpc.monad.xyz

# Optional: For contract verification
ETHERSCAN_API_KEY=your_monad_explorer_api_key
```

> [!CAUTION]
> **Never commit `.env` to git!** It's already in `.gitignore`, but double-check before pushing.

#### How to Get Your Private Key

**MetaMask**:
1. Click ⋮ (three dots) → Account details
2. Show private key → Enter password
3. Copy the key (starts with `0x`)

**For production**: Use a hardware wallet (Ledger/Trezor) or `cast wallet` instead of raw private keys.

### 3. Dry-Run Deployment (Simulation)

Test the deployment without broadcasting:

```bash
source .env
forge script contracts/script/DeployStreamManager.s.sol --rpc-url $RPC_URL
```

This simulates the deployment and shows:
- Gas estimates
- Deployer address
- Predicted contract address

### 4. Deploy to Monad Testnet

**Deploy the contract**:

```bash
source .env
forge script contracts/script/DeployStreamManager.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

> [!TIP]
> Alternatively, use `forge script` with `--ledger` flag if using a hardware wallet.

**Expected output**:
```
=== HyperStream Deployment ===
Deployer: 0xB2bF6fa34580AF4641f6ff5A4804De85F8204450
Chain ID: 10143
---
StreamManager deployed at: 0xd210d75702836ea5c13457d064045f39d253A235
Next stream ID: 1

✅ [Success] Hash: 0xcd85afe...
Contract Address: 0xd210d75702836ea5c13457d064045f39d253A235
Block: 13466319
Paid: 0.214441365 ETH (2081955 gas * 103 gwei)

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.
```

**Save your contract address!** You'll need it for frontend integration.

### 5. Verify Deployment

Check that the contract was deployed correctly:

```bash
# Get next stream ID (should be 1)
cast call <CONTRACT_ADDRESS> "nextStreamId()" --rpc-url $RPC_URL

# Response: 0x0000000000000000000000000000000000000000000000000000000000000001 (1 in hex)
```

View on block explorer (if available):
```
https://explorer.monad.xyz/address/<CONTRACT_ADDRESS>
```

---

## Post-Deployment

### Interacting with the Contract

#### Using `cast` (CLI)

**Read functions** (no gas):
```bash
# Get a stream's details
cast call <CONTRACT_ADDRESS> \
  "getStream(uint256)" <STREAM_ID> \
  --rpc-url $RPC_URL

# Check balance
cast call <CONTRACT_ADDRESS> \
  "balanceOf(uint256,address)" <STREAM_ID> <ADDRESS> \
  --rpc-url $RPC_URL
```

**Write functions** (costs gas):
```bash
# Create a stream
cast send <CONTRACT_ADDRESS> \
  "createStream(address,uint256,address,uint256,uint256)" \
  <RECIPIENT> <DEPOSIT> <TOKEN> <START_TIME> <STOP_TIME> \
  --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# Withdraw from stream
cast send <CONTRACT_ADDRESS> \
  "withdrawFromStream(uint256,uint256)" \
  <STREAM_ID> <AMOUNT> \
  --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

#### Using Frontend (Wagmi/Viem)

Import the ABI from compiled artifacts:

```javascript
import StreamManagerABI from './out/StreamManager.sol/StreamManager.json';

const CONTRACT_ADDRESS = '0xd210d75702836ea5c13457d064045f39d253A235';

// Read contract
const { data: streamData } = useContractRead({
  address: CONTRACT_ADDRESS,
  abi: StreamManagerABI.abi,
  functionName: 'getStream',
  args: [streamId],
});

// Write contract
const { write: createStream } = useContractWrite({
  address: CONTRACT_ADDRESS,
  abi: StreamManagerABI.abi,
  functionName: 'createStream',
});
```

---

## Deployment to Mainnet

> [!WARNING]
> Mainnet deployments use **real money**. Test thoroughly on testnet first!

Update `.env`:
```bash
RPC_URL=https://rpc.monad.xyz  # Mainnet RPC
```

Follow the same deployment steps. Estimated costs:
- Deployment: ~2M gas (~0.2 MON at 100 gwei)
- Create stream: ~200k gas per stream
- Withdraw: ~100k gas per withdrawal

---

## Troubleshooting

### Error: "Insufficient funds for gas"
- **Solution**: Request more MON from the faucet or fund your wallet.

### Error: "Nonce too low"
- **Solution**: Your wallet has a pending transaction. Wait for it to confirm or cancel it.

### Error: "Could not find artifact"
- **Solution**: Run `forge build` first to compile contracts.

### Error: "Transport error: RPC request failed"
- **Solution**: Check your `RPC_URL` is correct and the network is reachable.

### Deployment Files Not Created
If `broadcast/` folder is empty:
- Ensure `--broadcast` flag is included
- Check you have sufficient gas balance
- Verify RPC endpoint is correct

---

## Deployment Artifacts

After deployment, Foundry saves transaction logs:

```
broadcast/DeployStreamManager.s.sol/
└── 10143/                          # Chain ID
    ├── run-latest.json             # Latest deployment
    └── run-<timestamp>.json        # Historical runs
```

These files contain:
- Transaction hashes
- Contract addresses
- Gas used
- Block numbers

---

## Network Configuration

### Monad Testnet
- **Chain ID**: `10143`
- **RPC URL**: `https://testnet-rpc.monad.xyz`
- **Explorer**: `https://explorer-testnet.monad.xyz`
- **Faucet**: `https://faucet.monad.xyz`

### Monad Mainnet (when available)
- **Chain ID**: TBD
- **RPC URL**: `https://rpc.monad.xyz`
- **Explorer**: `https://explorer.monad.xyz`

---

## Contract Addresses

### Testnet Deployment
- **StreamManager**: `0xd210d75702836ea5c13457d064045f39d253A235`
- **Deployer**: `0xB2bF6fa34580AF4641f6ff5A4804De85F8204450`
- **Block**: `13466319`

### Mainnet
*(Not yet deployed)*

---

## Security Checklist

Before mainnet deployment:

- [ ] All tests passing (`forge test`)
- [ ] Code reviewed by team
- [ ] Testnet deployment successful and tested
- [ ] Gas optimizations verified
- [ ] Contract verified on block explorer
- [ ] Documentation complete
- [ ] Frontend integration tested
- [ ] Consider professional audit for high-value deployments

---

## Additional Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Monad Docs](https://docs.monad.xyz)
- [Smart Contracts Documentation](./SMART_CONTRACTS.md)
- [Project README](./README.md)

---

## Support

For issues or questions:
- Open an issue on [GitHub](https://github.com/Azelout/HyperStream/issues)
- Join the Monad Discord
- Check [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) for technical details

---

**Built for Monad Hackathon** 🚀 | Pull-based streaming protocol
