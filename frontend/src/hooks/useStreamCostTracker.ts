'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatUnits } from 'viem';
import { TOKEN_DECIMALS } from '@/config/contracts';

interface UseStreamCostTrackerProps {
    ratePerSecond: bigint | null;
    startTimestamp: number | null; // Unix timestamp in seconds
    isActive: boolean;
}

export function useStreamCostTracker({
    ratePerSecond,
    startTimestamp,
    isActive,
}: UseStreamCostTrackerProps) {
    const [elapsedCost, setElapsedCost] = useState<bigint>(BigInt(0));
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const computeCost = useCallback(() => {
        if (!ratePerSecond || !startTimestamp) return BigInt(0);
        const now = Date.now() / 1000;
        const elapsed = Math.max(0, now - startTimestamp);
        // Cost = elapsed seconds × ratePerSecond
        // Use high precision: multiply elapsed by 1000 then divide for sub-second accuracy
        const elapsedMs = Math.floor(elapsed * 1000);
        return (ratePerSecond * BigInt(elapsedMs)) / BigInt(1000);
    }, [ratePerSecond, startTimestamp]);

    useEffect(() => {
        if (!isActive || !ratePerSecond || !startTimestamp) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Update cost every 50ms for smooth animation
        intervalRef.current = setInterval(() => {
            setElapsedCost(computeCost());
        }, 50);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isActive, ratePerSecond, startTimestamp, computeCost]);

    const formattedCost = formatUnits(elapsedCost, TOKEN_DECIMALS);

    // Format with exactly 6 decimal places
    const displayCost = (() => {
        const parts = formattedCost.split('.');
        const integer = parts[0];
        const decimal = (parts[1] || '').padEnd(6, '0').slice(0, 6);
        return `${integer}.${decimal}`;
    })();

    const formattedRate = ratePerSecond
        ? formatUnits(ratePerSecond, TOKEN_DECIMALS)
        : '0';

    const reset = useCallback(() => {
        setElapsedCost(BigInt(0));
    }, []);

    return {
        elapsedCost,
        displayCost,
        formattedRate,
        reset,
    };
}
