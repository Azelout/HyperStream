import { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Activity, ArrowUpRight } from 'lucide-react';

export const EmployerDashboard = () => {
    const [flowRate, setFlowRate] = useState(50); // Nominal percent

    return (
        <div className="relative z-10 p-8 pt-24 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Money Flow Control */}
            <GlassCard className="h-full min-h-[400px] flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-6 text-neon-cyan">Money Flow Control</h2>
                
                <div className="mb-12 text-center">
                    <span className="text-5xl font-black text-white">{flowRate}</span>
                    <span className="text-gray-400 text-xl ml-2">WEI/SEC</span>
                </div>

                <div className="relative mb-8 px-4">
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={flowRate} 
                        onChange={(e) => setFlowRate(Number(e.target.value))}
                        className="w-full h-6 bg-black/50 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-cyan hover:[&::-webkit-slider-thumb]:shadow-[0_0_20px_#03b3c3] transition-all"
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-500 font-mono">
                        <span>STOP</span>
                        <span>MAX SPEED</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-400">TOTAL STREAMED</div>
                        <div className="text-xl font-bold text-white mt-1">12.45 ETH</div>
                    </div>
                     <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-400">REMAINING</div>
                        <div className="text-xl font-bold text-white mt-1">4.20 ETH</div>
                    </div>
                </div>
            </GlassCard>

            {/* Employee Monitor */}
             <GlassCard className="h-full min-h-[400px] flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start mb-8">
                     <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Activity className="text-neon-magenta" /> MONITORING
                        </h2>
                        <p className="text-gray-400 text-sm">Active Employee: <span className="text-white">0x71C...9A2</span></p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                        ONLINE
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="transparent" />
                            <circle cx="96" cy="96" r="88" stroke="#d856bf" strokeWidth="12" fill="transparent" strokeDasharray="552" strokeDashoffset="138" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(216,86,191,0.5)]" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-white">75%</span>
                            <span className="text-xs text-gray-400 uppercase tracking-widest">Complete</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Latest Update</span>
                        <span className="text-white font-mono">2 mins ago</span>
                    </div>
                     <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-400">Efficiency Score</span>
                        <div className="flex items-center gap-1 text-neon-cyan">
                            <ArrowUpRight className="w-4 h-4" /> 98%
                        </div>
                    </div>
                </div>
             </GlassCard>
        </div>
    );
};
