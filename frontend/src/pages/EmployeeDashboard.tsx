import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Zap } from 'lucide-react';

export const EmployeeDashboard = () => {
    const { balance, updateBalance } = useApp();
    const [progress, setProgress] = useState(0);
    const [streaming] = useState(true);

    // Simulate streaming payments
    useEffect(() => {
        if (!streaming) return;
        const interval = setInterval(() => {
            updateBalance(0.0001);
        }, 100);
        return () => clearInterval(interval);
    }, [streaming, updateBalance]);

    const handleDeliver = () => {
        alert("Deliverable Announced! Employer notified.");
    };

    return (
        <div className="relative z-10 p-8 pt-24 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Stream Visualization */}
            <GlassCard className="h-full min-h-[400px] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-pulse-fast" />
                
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                        <Zap className="text-neon-cyan fill-neon-cyan" /> LIVE STREAM
                    </h2>
                    <p className="text-gray-400 text-sm">Incoming Payment Flow</p>
                </div>

                <div className="text-center py-12">
                   <div className="text-6xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neon-cyan">
                        {balance.toFixed(6)}
                   </div>
                   <div className="text-sm text-neon-cyan/80 mt-2 font-mono">ETH SENT</div>
                </div>

                <div className="w-full bg-white/5 rounded-full h-2 mt-4 overflow-hidden">
                    <div className="bg-neon-cyan h-full w-full animate-pulse opacity-50" />
                </div>
            </GlassCard>

            {/* Work Progress Control */}
            <GlassCard className="h-full min-h-[400px] flex flex-col justify-center">
                 <h2 className="text-2xl font-bold mb-6">Work Progress</h2>
                 
                 <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-300">Completion</span>
                        <span className="text-neon-magenta font-mono">{progress}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={progress} 
                        onChange={(e) => setProgress(Number(e.target.value))}
                        className="w-full h-4 bg-black/50 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-magenta hover:[&::-webkit-slider-thumb]:shadow-[0_0_15px_#d856bf]"
                    />
                 </div>

                 <button
                    onClick={handleDeliver}
                    className="w-full py-4 bg-neon-magenta/10 border border-neon-magenta/50 text-neon-magenta font-bold rounded-xl hover:bg-neon-magenta hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                 >
                    <CheckCircle2 className="w-5 h-5" />
                    ANNOUNCE DELIVERABLE
                 </button>
            </GlassCard>
        </div>
    );
};
