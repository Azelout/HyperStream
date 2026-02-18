// ── Contract Addresses ──────────────────────────────────────
export const STREAM_MANAGER_ADDRESS = '0xd210d75702836ea5c13457d064045f39d253A235' as const;

// WMON (Wrapped MON) on Monad Testnet — canonical ERC-20 wrapper for native MON
// Source: https://docs.monad.xyz/networks/testnet
export const WMON_ADDRESS = '0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541' as const;

// MON uses 18 decimals
export const TOKEN_DECIMALS = 18;
export const TOKEN_SYMBOL = 'MON';

// Default deposit: 0.01 MON (for ~1 hour of listening)
// 0.01 MON = 10_000_000_000_000_000 wei — divisible by 3600
export const DEFAULT_DEPOSIT = BigInt('10000000000000000'); // 0.01 * 10^18, but adjusted for divisibility

// Default stream duration: 1 hour (3600 seconds)
export const DEFAULT_STREAM_DURATION = 3600;

// ── StreamManager ABI (from IStreamManager.sol) ─────────────
export const STREAM_MANAGER_ABI = [
    // createStream
    {
        type: 'function',
        name: 'createStream',
        inputs: [
            { name: 'recipient', type: 'address', internalType: 'address' },
            { name: 'deposit', type: 'uint256', internalType: 'uint256' },
            { name: 'tokenAddress', type: 'address', internalType: 'address' },
            { name: 'startTime', type: 'uint256', internalType: 'uint256' },
            { name: 'stopTime', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'streamId', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'nonpayable',
    },
    // cancelStream
    {
        type: 'function',
        name: 'cancelStream',
        inputs: [{ name: 'streamId', type: 'uint256', internalType: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    // withdrawFromStream
    {
        type: 'function',
        name: 'withdrawFromStream',
        inputs: [
            { name: 'streamId', type: 'uint256', internalType: 'uint256' },
            { name: 'amount', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    // balanceOf (view)
    {
        type: 'function',
        name: 'balanceOf',
        inputs: [
            { name: 'streamId', type: 'uint256', internalType: 'uint256' },
            { name: 'who', type: 'address', internalType: 'address' },
        ],
        outputs: [{ name: 'balance', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    // getStream (view)
    {
        type: 'function',
        name: 'getStream',
        inputs: [{ name: 'streamId', type: 'uint256', internalType: 'uint256' }],
        outputs: [
            {
                name: 'stream',
                type: 'tuple',
                internalType: 'struct IStreamManager.Stream',
                components: [
                    { name: 'sender', type: 'address', internalType: 'address' },
                    { name: 'recipient', type: 'address', internalType: 'address' },
                    { name: 'deposit', type: 'uint256', internalType: 'uint256' },
                    { name: 'tokenAddress', type: 'address', internalType: 'address' },
                    { name: 'startTime', type: 'uint256', internalType: 'uint256' },
                    { name: 'stopTime', type: 'uint256', internalType: 'uint256' },
                    { name: 'ratePerSecond', type: 'uint256', internalType: 'uint256' },
                    { name: 'remainingBalance', type: 'uint256', internalType: 'uint256' },
                ],
            },
        ],
        stateMutability: 'view',
    },
    // nextStreamId (view)
    {
        type: 'function',
        name: 'nextStreamId',
        inputs: [],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    // Events
    {
        type: 'event',
        name: 'StreamCreated',
        inputs: [
            { name: 'streamId', type: 'uint256', indexed: true, internalType: 'uint256' },
            { name: 'sender', type: 'address', indexed: true, internalType: 'address' },
            { name: 'recipient', type: 'address', indexed: true, internalType: 'address' },
            { name: 'deposit', type: 'uint256', indexed: false, internalType: 'uint256' },
            { name: 'tokenAddress', type: 'address', indexed: false, internalType: 'address' },
            { name: 'startTime', type: 'uint256', indexed: false, internalType: 'uint256' },
            { name: 'stopTime', type: 'uint256', indexed: false, internalType: 'uint256' },
        ],
    },
    {
        type: 'event',
        name: 'WithdrawFromStream',
        inputs: [
            { name: 'streamId', type: 'uint256', indexed: true, internalType: 'uint256' },
            { name: 'recipient', type: 'address', indexed: true, internalType: 'address' },
            { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
        ],
    },
    {
        type: 'event',
        name: 'StreamCanceled',
        inputs: [
            { name: 'streamId', type: 'uint256', indexed: true, internalType: 'uint256' },
            { name: 'senderBalance', type: 'uint256', indexed: false, internalType: 'uint256' },
            { name: 'recipientBalance', type: 'uint256', indexed: false, internalType: 'uint256' },
        ],
    },
    // Custom Errors
    { type: 'error', name: 'ZeroAddress', inputs: [] },
    { type: 'error', name: 'InvalidTimeFrame', inputs: [] },
    { type: 'error', name: 'ZeroDeposit', inputs: [] },
    {
        type: 'error',
        name: 'StreamDoesNotExist',
        inputs: [{ name: 'streamId', type: 'uint256', internalType: 'uint256' }],
    },
    {
        type: 'error',
        name: 'UnauthorizedCaller',
        inputs: [{ name: 'caller', type: 'address', internalType: 'address' }],
    },
    { type: 'error', name: 'ArithmeticOverflow', inputs: [] },
] as const;

// ── ERC-20 ABI (minimal — approve, allowance, balanceOf) ────
export const ERC20_ABI = [
    {
        type: 'function',
        name: 'approve',
        inputs: [
            { name: 'spender', type: 'address', internalType: 'address' },
            { name: 'amount', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'allowance',
        inputs: [
            { name: 'owner', type: 'address', internalType: 'address' },
            { name: 'spender', type: 'address', internalType: 'address' },
        ],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'account', type: 'address', internalType: 'address' }],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'decimals',
        inputs: [],
        outputs: [{ name: '', type: 'uint8', internalType: 'uint8' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'symbol',
        inputs: [],
        outputs: [{ name: '', type: 'string', internalType: 'string' }],
        stateMutability: 'view',
    },
] as const;
