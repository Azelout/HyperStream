import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Roadmap } from '../components/Roadmap';
import { ShieldCheck, Wallet, Settings, Zap, Activity, Box, ArrowUpRight, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';

const API_BASE = "http://localhost:3001/api";

export const EmployerDashboard = () => {
    const { walletAddress, streams, fetchStreams } = useApp();
    const [flowRate, setFlowRate] = useState(50);
    const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
    const [proofs, setProofs] = useState<any[]>([]);
    const [isUpdatingRate, setIsUpdatingRate] = useState(false);

    // Compute stats from real streams
    const totalValueLocked = streams.reduce((acc, s) => {
        return acc + parseFloat(ethers.formatEther(s.remainingBalance || "0"));
    }, 0);
    const activeStreamCount = streams.length;

    const truncatedAddress = walletAddress
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : '0x...';

    // Fetch proofs for selected stream
    const fetchProofs = useCallback(async (streamId: string) => {
        try {
            const res = await fetch(`${API_BASE}/streams/${streamId}/proofs`);
            if (res.ok) {
                const data = await res.json();
                setProofs(data);
            }
        } catch (err) {
            console.error("Failed to fetch proofs:", err);
        }
    }, []);

    // Update stream rate
    const handleUpdateRate = async () => {
        if (!selectedStreamId) return;
        setIsUpdatingRate(true);
        try {
            const newRate = (BigInt(flowRate) * BigInt("1000000000000")).toString();
            const res = await fetch(`${API_BASE}/streams/${selectedStreamId}/update-rate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newRate }),
            });
            if (res.ok) {
                await fetchStreams();
            }
        } catch (err) {
            console.error("Failed to update rate:", err);
        } finally {
            setIsUpdatingRate(false);
        }
    };

    useEffect(() => {
        if (streams.length > 0 && !selectedStreamId) {
            setSelectedStreamId(streams[0].streamId);
            fetchProofs(streams[0].streamId);
        }
    }, [streams, selectedStreamId, fetchProofs]);

    return (
        <div className="min-h-screen obsidian-bg p-8 pt-12 max-w-[1600px] mx-auto antialiased">
            {/* Professional Header */}
            <div className="flex justify-between items-end mb-16">
                <div>
                    <h1 className="text-5xl font-extrabold text-premium-gradient tracking-tighter flex items-center gap-4">
                        <Zap className="text-[#10b981] w-10 h-10 jade-glow" /> Control Room
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Enterprise-grade stream management and node monitoring</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn-obsidian py-2.5 px-5">
                        <Wallet className="w-4 h-4 text-gray-400" />
                        <span>{truncatedAddress}</span>
                    </button>
                    <button className="bg-white/5 p-2.5 rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
                        <Settings className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Metrics Bento Row */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="premium-card p-10 flex flex-col justify-between h-64 hover:bg-white/[0.02]">
                        <div className="flex justify-between items-start">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Total Value Locked</h2>
                            <Activity className="w-4 h-4 text-[#10b981]" />
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-premium-gradient tracking-tighter mb-1">{totalValueLocked.toFixed(4)} MON</div>
                            <div className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" /> {activeStreamCount} active streams
                            </div>
                        </div>
                    </div>

                    <div className="premium-card p-10 flex flex-col justify-between h-64 hover:bg-white/[0.02]">
                        <div className="flex justify-between items-start">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Active Streams</h2>
                            <Zap className="w-4 h-4 text-[#10b981]" />
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-premium-gradient tracking-tighter mb-1">{activeStreamCount} nodes</div>
                            <div className="text-xs text-gray-500 font-medium">Monad Testnet</div>
                        </div>
                    </div>

                    <div className="premium-card p-10 flex flex-col justify-between h-64 hover:bg-white/[0.02]">
                        <div className="flex justify-between items-start">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Work Proofs</h2>
                            <Box className="w-4 h-4 text-[#10b981]" />
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-premium-gradient tracking-tighter mb-1">{proofs.length}</div>
                            <div className="text-xs text-emerald-400 font-bold">Submissions received</div>
                        </div>
                    </div>

                    {/* Stream Selector */}
                    {streams.length > 0 && (
                        <div className="md:col-span-3 premium-card p-8">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-4">Active Streams</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {streams.map((stream) => (
                                    <button
                                        key={stream.streamId}
                                        onClick={() => {
                                            setSelectedStreamId(stream.streamId);
                                            fetchProofs(stream.streamId);
                                        }}
                                        className={`p-4 rounded-xl border text-left transition-all ${
                                            selectedStreamId === stream.streamId
                                                ? "border-[#10b981]/50 bg-[#10b981]/5"
                                                : "border-white/5 bg-white/[0.02] hover:border-white/10"
                                        }`}
                                    >
                                        <div className="text-xs font-bold text-gray-400 mb-1">Stream #{stream.streamId}</div>
                                        <div className="text-sm font-mono text-gray-500">
                                            → {stream.recipient.slice(0, 6)}...{stream.recipient.slice(-4)}
                                        </div>
                                        <div className="text-xs text-emerald-500 mt-2 font-bold">
                                            {parseFloat(ethers.formatEther(stream.remainingBalance || "0")).toFixed(4)} MON remaining
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stream Control Bento */}
                    <div className="md:col-span-3 premium-card p-12">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="space-y-4 max-w-sm">
                                <h2 className="text-xl font-bold text-premium-gradient">Flow Velocity</h2>
                                <p className="text-gray-500 text-sm leading-relaxed"> Adjust the real-time settlement rate across all active protocol nodes.</p>
                            </div>
                            
                            <div className="flex-1 w-full flex flex-col items-center">
                                <div className="text-6xl font-extrabold text-premium-gradient tracking-tighter mb-8">
                                    {flowRate}<span className="text-gray-600 text-2xl ml-2 tracking-normal">WEI/S</span>
                                </div>
                                <div className="w-full max-w-xl relative px-4">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={flowRate} 
                                        onChange={(e) => setFlowRate(Number(e.target.value))}
                                        className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#10b981] transition-all border-none"
                                    />
                                    <div className="flex justify-between mt-6 text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                                        <span>Min Throughput</span>
                                        <span>Protocol Limit</span>
                                    </div>
                                </div>
                                {selectedStreamId && (
                                    <button
                                        onClick={handleUpdateRate}
                                        disabled={isUpdatingRate}
                                        className="btn-jade mt-6 px-8 disabled:opacity-50"
                                    >
                                        {isUpdatingRate ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        <span>{isUpdatingRate ? "Updating..." : "Apply Rate"}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Roadmap Section */}
                    <div className="md:col-span-3 premium-card p-12">
                        <Roadmap mode="edit" />
                    </div>
                </div>

                {/* Sidebar Monitoring Column */}
                <div className="space-y-8">
                    <div className="premium-card flex flex-col p-10 h-full">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-1">Peer Monitor</h2>
                                <p className="text-xs text-gray-400 font-mono tracking-tighter font-bold uppercase">ID: {truncatedAddress}</p>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-500/5 text-[9px] font-bold text-emerald-500 border border-emerald-500/10 uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Synchronized
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center py-6">
                            <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
                                <div className="absolute inset-0 bg-emerald-500/5 blur-3xl" />
                                <svg className="w-full h-full transform -rotate-90 relative z-10">
                                    <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.03)" strokeWidth="12" fill="transparent" />
                                    <circle 
                                        cx="96" 
                                        cy="96" 
                                        r="88" 
                                        stroke="#10b981" 
                                        strokeWidth="12" 
                                        fill="transparent" 
                                        strokeDasharray="552" 
                                        strokeDashoffset={552 * (1 - (proofs.length > 0 ? Math.min(proofs.length / 5, 1) : 0))} 
                                        strokeLinecap="round" 
                                        className="transition-all duration-1000 opacity-80 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center relative z-20">
                                    <span className="text-5xl font-extrabold text-premium-gradient tracking-tighter">
                                        {proofs.length > 0 ? Math.min(Math.round(proofs.length / 5 * 100), 100) : 0}%
                                    </span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Completion</span>
                                </div>
                            </div>

                            <div className="w-full space-y-6 pt-10 border-t border-white/5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-gray-500">Node Trust</span>
                                    <span className="font-bold text-white uppercase tracking-widest">A+ Verified</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-gray-500">Network</span>
                                    <span className="font-bold text-gray-400 uppercase tracking-widest">Monad Testnet</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <button 
                                className="btn-jade w-full flex items-center justify-center gap-3 shadow-lg"
                                onClick={() => selectedStreamId && fetchProofs(selectedStreamId)}
                            >
                                <ShieldCheck className="w-5 h-5" />
                                <span>Refresh Proofs</span>
                            </button>
                            <p className="text-[10px] text-gray-600 text-center uppercase tracking-widest font-bold mt-4 opacity-50">
                                Secure L1 Finalization
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
