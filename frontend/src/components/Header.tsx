'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { Zap, Wallet } from 'lucide-react';
import { TOKEN_DECIMALS, TOKEN_SYMBOL } from '@/config/contracts';

export function Header() {
    const { address, isConnected } = useAccount();

    // Read native MON balance (not WMON ERC-20 balance)
    const { data: balance } = useBalance({
        address: address,
        query: { enabled: !!address && isConnected },
    });

    const formattedBalance = balance
        ? Number(formatUnits(balance.value, TOKEN_DECIMALS)).toFixed(4)
        : '0.0000';

    return (
        <header className="glass-strong sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#836EF9] to-[#00FF88] flex items-center justify-center glow-purple">
                            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">
                            <span className="text-glow-purple">Hyper</span>
                            <span className="text-[#00FF88] text-glow-green">Stream</span>
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] -mt-0.5">
                            Pay-per-second Music
                        </p>
                    </div>
                </div>

                {/* Right side: Balance + Connect */}
                <div className="flex items-center gap-4">
                    {isConnected && (
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                            <Wallet className="w-4 h-4 text-[var(--text-muted)]" />
                            <span className="text-sm font-medium text-[var(--text-secondary)]">
                                {formattedBalance}
                            </span>
                            <span className="text-xs text-[var(--text-muted)]">{TOKEN_SYMBOL}</span>
                        </div>
                    )}
                    <ConnectButton
                        showBalance={false}
                        chainStatus="icon"
                        accountStatus={{
                            smallScreen: 'avatar',
                            largeScreen: 'full',
                        }}
                    />
                </div>
            </div>
        </header>
    );
}
