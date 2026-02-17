import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { connectWallet, isWalletConnected } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (isWalletConnected) {
      navigate('/role-selection');
    }
  }, [isWalletConnected, navigate]);

  return (
    <div className="relative z-10 flex items-center justify-center min-h-screen">
      <GlassCard className="text-center max-w-md w-full mx-4">
        <h1 className="text-5xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-magenta animate-pulse-fast">
          HYPERSTREAM
        </h1>
        <p className="text-gray-400 mb-8 font-light tracking-wide">
          HYPERSPEED PAYMENT PROTOCOL
        </p>

        <button
          onClick={connectWallet}
          className="group relative w-full py-4 px-6 bg-glass-button text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(3,179,195,0.4)] border border-white/10 hover:border-neon-cyan"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-cyan" />
            CONNECT WALLET
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </span>
        </button>
      </GlassCard>
    </div>
  );
};
