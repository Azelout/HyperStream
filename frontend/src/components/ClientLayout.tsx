'use client';

import dynamic from 'next/dynamic';

// Dynamically import Providers with SSR disabled to prevent WalletConnect
// from accessing localStorage during server-side rendering / prerendering
const Providers = dynamic(
    () => import('@/components/Providers').then((m) => m.Providers),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex items-center justify-center bg-[#08080D]">
                <div className="w-8 h-8 border-2 border-[#836EF9] border-t-transparent rounded-full animate-spin" />
            </div>
        ),
    }
);

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return <Providers>{children}</Providers>;
}
