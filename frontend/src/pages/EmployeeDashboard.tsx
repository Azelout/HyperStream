import { useState, useEffect, useCallback } from 'react';
import { Roadmap } from '../components/Roadmap';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Zap, Clock, Activity, Wallet, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';

const API_BASE = "http://localhost:3001/api";

export const EmployeeDashboard = () => {
    const { walletAddress, streams } = useApp();
    const [liveBalance, setLiveBalance] = useState("0");
    const [progress, setProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activeStream = streams.length > 0 ? streams[0] : null;

    // Poll live balance from backend
    const pollBalance = useCallback(async () => {
        if (!activeStream || !walletAddress) return;
        try {
            const res = await fetch(
                `${API_BASE}/streams/${activeStream.streamId}/balance/${walletAddress}`
            );
            if (res.ok) {
                const data = await res.json();
                setLiveBalance(data.formatted || ethers.formatEther(data.balance || "0"));
            }
        } catch (err) {
            // Fallback: calculate client-side
            if (activeStream) {
                const now = Math.floor(Date.now() / 1000);
                const elapsed = now - parseInt(activeStream.startTime);
                if (elapsed > 0) {
                    const bal = BigInt(elapsed) * BigInt(activeStream.ratePerSecond);
                    setLiveBalance(ethers.formatEther(bal));
                }
            }
        }
    }, [activeStream, walletAddress]);

    useEffect(() => {
        pollBalance();
        const interval = setInterval(pollBalance, 2000);
        return () => clearInterval(interval);
    }, [pollBalance]);

    // Fetch roadmap progress
    const fetchRoadmap = useCallback(async () => {
        if (!activeStream) return;
        try {
            const res = await fetch(`${API_BASE}/streams/${activeStream.streamId}/roadmap`);
            if (res.ok) {
                const data = await res.json();
                setProgress(Math.round(data.completionPercentage || 0));
            }
        } catch (err) {
            console.error("Failed to fetch roadmap:", err);
        }
    }, [activeStream]);

    useEffect(() => {
        fetchRoadmap();
    }, [fetchRoadmap]);

    // Submit proof of work
    const handleSubmitProof = async () => {
        if (!activeStream || !walletAddress) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/proof-of-work`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    streamId: activeStream.streamId,
                    employeeAddress: walletAddress,
                    title: "Work proof submitted",
                    description: "Proof submitted from dashboard",
                    proofUrl: "",
                }),
            });
            if (res.ok) {
                await fetchRoadmap();
            }
        } catch (err) {
            console.error("Failed to submit proof:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formattedBalance = parseFloat(liveBalance).toFixed(4);
    const streaming = !!activeStream;

    return (
        <div className="min-h-screen obsidian-bg p-8 pt-12 max-w-[1600px] mx-auto antialiased">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-16">
                <div>
                    <h1 className="text-5xl font-extrabold text-premium-gradient tracking-tighter flex items-center gap-4">
                        <Zap className="text-[#10b981] w-10 h-10 jade-glow" /> Terminal
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Real-time liquidation stream and protocol mission hub</p>
                </div>
                <div className="flex gap-4">
                    <div className="btn-obsidian py-2.5 px-5">
                        <Clock className="w-4 h-4 text-[#10b981]" />
                        <span className="text-gray-300">
                            {activeStream 
                                ? `Stream #${activeStream.streamId} Active`
                                : "No Active Stream"
                            }
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Visualization Column */}
                <div className="lg:col-span-3 space-y-8">
                    {/* High-Impact Balance Display */}
                    <div className="premium-card p-16 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-emerald-500/[0.03] blur-[120px] rounded-full" />
                        
                        <div className="relative z-10 text-center">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-6">Live Protocol Balance</h2>
                            <div className="flex items-baseline justify-center gap-4 mb-8">
                                <span className="text-9xl font-extrabold text-premium-gradient tracking-tighter">
                                    {formattedBalance}
                                </span>
                                <span className="text-3xl font-bold text-gray-600 tracking-normal">MON</span>
                            </div>
                            
                            <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full ${
                                streaming 
                                    ? "bg-emerald-500/5 border border-emerald-500/10" 
                                    : "bg-gray-500/5 border border-gray-500/10"
                            }`}>
                                <Activity className={`w-4 h-4 ${streaming ? "text-[#10b981]" : "text-gray-500"}`} />
                                <span className={`text-xs font-bold uppercase tracking-widest ${
                                    streaming ? "text-[#10b981]" : "text-gray-500"
                                }`}>
                                    {streaming ? "Streaming Active" : "No Active Stream"}
                                </span>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#10b981]/20 to-transparent" />
                    </div>

                    {/* Progress Bento */}
                    <div className="premium-card p-12">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-premium-gradient">Mission Velocity</h2>
                                <p className="text-sm text-gray-500 max-w-sm">Advance through cryptographic milestones to increase your stream multiplier.</p>
                            </div>
                            
                            <div className="flex-1 w-full max-w-xl">
                                <div className="flex justify-between items-end mb-4">
                                    <span className="text-3xl font-extrabold text-premium-gradient tracking-tighter">{progress}%</span>
                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Milestone Progress</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] transition-all duration-700 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Monitoring */}
                <div className="space-y-8">
                    <div className="premium-card p-10 h-full flex flex-col">
                        <div className="p-10 border-b border-white/5">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-6">Mission Log</h2>
                            <Roadmap mode="check" />
                        </div>
                        
                        <div className="p-10 mt-auto">
                            <div className="premium-card p-6 bg-white/[0.02] space-y-4 mb-8">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-medium">Network</span>
                                    <span className="text-emerald-500 font-bold uppercase tracking-widest">Monad Testnet</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-medium">Stream Rate</span>
                                    <span className="text-gray-400 font-bold uppercase tracking-widest">
                                        {activeStream ? `${activeStream.ratePerSecond} wei/s` : "N/A"}
                                    </span>
                                </div>
                            </div>

                            <button 
                                className="btn-jade w-full group shadow-md disabled:opacity-50"
                                onClick={handleSubmitProof}
                                disabled={isSubmitting || !activeStream}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <ShieldCheck className="w-5 h-5" />
                                )}
                                <span>{isSubmitting ? "Submitting..." : "Commit Mission"}</span>
                            </button>
                            <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest opacity-60">
                                <Wallet className="w-3 h-3" /> Secure Signature Required
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
