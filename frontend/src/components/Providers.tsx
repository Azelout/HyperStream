'use client';

import { useState, useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from 'react-hot-toast';
import { config } from '@/config/wagmi';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#836EF9',
                        accentColorForeground: 'white',
                        borderRadius: 'medium',
                        overlayBlur: 'small',
                    })}
                >
                    {mounted ? children : (
                        <div className="min-h-screen flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-[#836EF9] border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#141420',
                                color: '#F5F5F7',
                                border: '1px solid rgba(131, 110, 249, 0.3)',
                                borderRadius: '12px',
                                fontSize: '14px',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#00FF88',
                                    secondary: '#141420',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#F43F5E',
                                    secondary: '#141420',
                                },
                            },
                        }}
                    />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
