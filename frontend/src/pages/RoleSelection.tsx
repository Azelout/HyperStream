import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User, Sparkles, ArrowRight } from 'lucide-react';

export const RoleSelection = () => {
    const { setRole } = useApp();
    const navigate = useNavigate();

    const handleSelectRole = (role: 'employer' | 'employee') => {
        setRole(role);
        navigate(role === 'employer' ? '/employer-dashboard' : '/employee-dashboard');
    };

    return (
        <div className="min-h-screen obsidian-bg flex flex-col items-center justify-center p-8 antialiased overflow-hidden">
            <div className="mb-20 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 mb-6">
                    <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Select Perspective</span>
                </div>
                <h1 className="text-6xl font-extrabold text-premium-gradient tracking-tighter">
                    Account Type
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl w-full">
                {/* Employer Role */}
                <div 
                    onClick={() => handleSelectRole('employer')}
                    className="premium-card group flex flex-col items-center justify-center p-16 cursor-pointer"
                >
                    <div className="w-24 h-24 rounded-2xl bg-[#0a0a0c] border border-white/5 flex items-center justify-center mb-10 group-hover:border-[#10b981]/30 transition-all duration-300">
                        <Briefcase className="w-10 h-10 text-white group-hover:text-[#10b981] jade-glow transition-all duration-300" />
                    </div>

                    <h2 className="text-3xl font-bold text-premium-gradient mb-4">Employer</h2>
                    <p className="text-gray-500 max-w-[300px] leading-relaxed text-base font-medium text-center opacity-70 group-hover:opacity-100 transition-opacity">
                        Authorize automated stream flows and verify cryptographically signed work proofs.
                    </p>
                    
                    <div className="mt-8 flex items-center gap-2 text-[#10b981] text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                        Enter Manager Protocol <ArrowRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Employee Role */}
                <div 
                    onClick={() => handleSelectRole('employee')}
                    className="premium-card group flex flex-col items-center justify-center p-16 cursor-pointer"
                >
                    <div className="w-24 h-24 rounded-2xl bg-[#0a0a0c] border border-white/5 flex items-center justify-center mb-10 group-hover:border-[#10b981]/30 transition-all duration-300">
                        <User className="w-10 h-10 text-white group-hover:text-[#10b981] jade-glow transition-all duration-300" />
                    </div>

                    <h2 className="text-3xl font-bold text-premium-gradient mb-4">Employee</h2>
                    <p className="text-gray-500 max-w-[300px] leading-relaxed text-base font-medium text-center opacity-70 group-hover:opacity-100 transition-opacity">
                        Monitor your live liquidation stream and commit cryptographic mission proofs.
                    </p>

                    <div className="mt-8 flex items-center gap-2 text-[#10b981] text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                        Enter Receiver Protocol <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};
