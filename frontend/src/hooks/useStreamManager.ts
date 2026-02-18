'use client';

import { useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { decodeEventLog } from 'viem';
import {
    STREAM_MANAGER_ABI,
    STREAM_MANAGER_ADDRESS,
    WMON_ADDRESS,
    DEFAULT_DEPOSIT,
    DEFAULT_STREAM_DURATION,
} from '@/config/contracts';

export function useStreamManager() {
    // ── Create Stream ─────────────────────────────────────────
    const {
        writeContract: createStreamWrite,
        data: createStreamHash,
        isPending: isCreatePending,
        reset: resetCreate,
    } = useWriteContract();

    const {
        isLoading: isCreateConfirming,
        isSuccess: isCreateSuccess,
        data: createReceipt,
    } = useWaitForTransactionReceipt({
        hash: createStreamHash,
    });

    // ── Cancel Stream ─────────────────────────────────────────
    const {
        writeContract: cancelStreamWrite,
        data: cancelStreamHash,
        isPending: isCancelPending,
        reset: resetCancel,
    } = useWriteContract();

    const {
        isLoading: isCancelConfirming,
        isSuccess: isCancelSuccess,
        data: cancelReceipt,
    } = useWaitForTransactionReceipt({
        hash: cancelStreamHash,
    });

    // ── Create Stream Action ──────────────────────────────────
    const createStream = useCallback(
        (recipientAddress: `0x${string}`, deposit?: bigint, duration?: number) => {
            const depositAmount = deposit ?? DEFAULT_DEPOSIT;
            const streamDuration = duration ?? DEFAULT_STREAM_DURATION;

            // startTime must be in the future — use current time + 30 seconds buffer
            // (Monad testnet can take 10-20s to mine, so we need a generous buffer)
            const now = Math.floor(Date.now() / 1000);
            const startTime = BigInt(now + 30);
            const stopTime = BigInt(now + 30 + streamDuration);

            // Ensure deposit is divisible by duration
            const adjustedDeposit = depositAmount - (depositAmount % BigInt(streamDuration));

            createStreamWrite({
                address: STREAM_MANAGER_ADDRESS,
                abi: STREAM_MANAGER_ABI,
                functionName: 'createStream',
                args: [recipientAddress, adjustedDeposit, WMON_ADDRESS, startTime, stopTime],
            });
        },
        [createStreamWrite]
    );

    // ── Cancel Stream Action ──────────────────────────────────
    const cancelStream = useCallback(
        (streamId: bigint) => {
            cancelStreamWrite({
                address: STREAM_MANAGER_ADDRESS,
                abi: STREAM_MANAGER_ABI,
                functionName: 'cancelStream',
                args: [streamId],
            });
        },
        [cancelStreamWrite]
    );

    // ── Extract streamId from creation receipt ────────────────
    const getStreamIdFromReceipt = useCallback(() => {
        if (!createReceipt?.logs) return null;

        for (const log of createReceipt.logs) {
            try {
                const decoded = decodeEventLog({
                    abi: STREAM_MANAGER_ABI,
                    data: log.data,
                    topics: log.topics,
                });
                if (decoded.eventName === 'StreamCreated') {
                    return (decoded.args as { streamId: bigint }).streamId;
                }
            } catch {
                // Not our event, skip
            }
        }
        return null;
    }, [createReceipt]);

    return {
        // Create
        createStream,
        isCreatePending,
        isCreateConfirming,
        isCreateSuccess,
        createReceipt,
        getStreamIdFromReceipt,
        resetCreate,
        // Cancel
        cancelStream,
        isCancelPending,
        isCancelConfirming,
        isCancelSuccess,
        cancelReceipt,
        resetCancel,
    };
}

// ── Read Stream Data (separate hook for specific stream) ────
export function useStreamData(streamId: bigint | null) {
    const { data: streamData } = useReadContract({
        address: STREAM_MANAGER_ADDRESS,
        abi: STREAM_MANAGER_ABI,
        functionName: 'getStream',
        args: streamId ? [streamId] : undefined,
        query: { enabled: !!streamId },
    });

    return { streamData };
}
