import { useState } from 'react';
import { Roadmap } from '../components/Roadmap';
import { ShieldCheck, Wallet, Settings, Zap, Activity, Box, ArrowUpRight } from 'lucide-react';

export const EmployerDashboard = () => {
    const [flowRate, setFlowRate] = useState(50); // Nominal percent

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
                        <span>0x71C...9B4</span>
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
                            <div className="text-4xl font-extrabold text-premium-gradient tracking-tighter mb-1">12.45 ETH</div>
                            <div className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" /> +2.4% <span className="text-gray-600 font-medium ml-1">Today</span>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card p-10 flex flex-col justify-between h-64 hover:bg-white/[0.02]">
                        <div className="flex justify-between items-start">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Active Streams</h2>
                            <Zap className="w-4 h-4 text-[#10b981]" />
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-premium-gradient tracking-tighter mb-1">8 nodes</div>
                            <div className="text-xs text-gray-500 font-medium">99.9% protocol uptime</div>
                        </div>
                    </div>

                    <div className="premium-card p-10 flex flex-col justify-between h-64 hover:bg-white/[0.02]">
                        <div className="flex justify-between items-start">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Network Latency</h2>
                            <Box className="w-4 h-4 text-[#10b981]" />
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-premium-gradient tracking-tighter mb-1">1.2ms</div>
                            <div className="text-xs text-emerald-400 font-bold">Stable Connection</div>
                        </div>
                    </div>

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
                                <p className="text-xs text-gray-400 font-mono tracking-tighter font-bold uppercase">ID: 0x71C...9B4</p>
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
                                        strokeDashoffset={552 * (1 - 0.75)} 
                                        strokeLinecap="round" 
                                        className="transition-all duration-1000 opacity-80 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center relative z-20">
                                    <span className="text-5xl font-extrabold text-premium-gradient tracking-tighter">75%</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Optimization</span>
                                </div>
                            </div>

                            <div className="w-full space-y-6 pt-10 border-t border-white/5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-gray-500">Node Trust</span>
                                    <span className="font-bold text-white uppercase tracking-widest">A+ Verified</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-gray-500">Current Task</span>
                                    <span className="font-bold text-gray-400 uppercase tracking-widest">L2 Settlement</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <button className="btn-jade w-full flex items-center justify-center gap-3 shadow-lg">
                                <ShieldCheck className="w-5 h-5" />
                                <span>Verify Work Proof</span>
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
