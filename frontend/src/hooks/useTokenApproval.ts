'use client';

import { useCallback, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ERC20_ABI, STREAM_MANAGER_ADDRESS, WMON_ADDRESS } from '@/config/contracts';

export function useTokenApproval(amount: bigint) {
    const { address } = useAccount();

    // ── Read current allowance ────────────────────────────────
    const {
        data: allowance,
        refetch: refetchAllowance,
    } = useReadContract({
        address: WMON_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, STREAM_MANAGER_ADDRESS] : undefined,
        query: { enabled: !!address },
    });

    // ── Read USDC balance ─────────────────────────────────────
    const { data: balance } = useReadContract({
        address: WMON_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    // ── Approve transaction ───────────────────────────────────
    const {
        writeContract: approveWrite,
        data: approveHash,
        isPending: isApprovePending,
        reset: resetApprove,
    } = useWriteContract();

    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
        useWaitForTransactionReceipt({
            hash: approveHash,
        });

    const isApproved = useMemo(() => {
        if (!allowance) return false;
        return (allowance as bigint) >= amount;
    }, [allowance, amount]);

    const approve = useCallback(() => {
        approveWrite({
            address: WMON_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [STREAM_MANAGER_ADDRESS, amount],
        });
    }, [approveWrite, amount]);

    return {
        allowance: allowance as bigint | undefined,
        balance: balance as bigint | undefined,
        isApproved,
        approve,
        isApprovePending,
        isApproveConfirming,
        isApproveSuccess,
        refetchAllowance,
        resetApprove,
    };
}
