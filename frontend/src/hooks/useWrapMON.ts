'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { WMON_ADDRESS } from '@/config/contracts';
import { parseEther } from 'viem';

// WMON ABI for deposit/withdraw (standard WETH-style interface)
const WMON_ABI = [
    {
        type: 'function',
        name: 'deposit',
        inputs: [],
        outputs: [],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        name: 'withdraw',
        inputs: [{ name: 'amount', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;

export function useWrapMON() {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    /**
     * Wrap native MON into WMON by depositing to the WMON contract
     * @param amount - Amount of MON to wrap (as a string, e.g., "0.01")
     */
    const wrapMON = (amount: string) => {
        const value = parseEther(amount);
        writeContract({
            address: WMON_ADDRESS,
            abi: WMON_ABI,
            functionName: 'deposit',
            value,
        });
    };

    /**
     * Unwrap WMON back into native MON
     * @param amount - Amount of WMON to unwrap (in wei as bigint)
     */
    const unwrapMON = (amount: bigint) => {
        writeContract({
            address: WMON_ADDRESS,
            abi: WMON_ABI,
            functionName: 'withdraw',
            args: [amount],
        });
    };

    return {
        wrapMON,
        unwrapMON,
        isPending,
        isConfirming,
        isSuccess,
        error,
        hash,
    };
}
