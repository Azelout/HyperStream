import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

export const Login = () => {
  const { connectWallet, isWalletConnected } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (isWalletConnected) {
      navigate('/role-selection');
    }
  }, [isWalletConnected, navigate]);

  return (
    <div className="min-h-screen obsidian-bg flex items-center justify-center p-6 antialiased">
      <div className="premium-card max-w-[480px] w-full p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="mb-12 relative">
            <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full" />
            <div className="w-24 h-24 rounded-2xl bg-[#0a0a0c] border border-white/5 flex items-center justify-center relative z-10">
              <Zap className="w-12 h-12 text-[#10b981] jade-glow fill-[#10b981]/10" />
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-5xl font-extrabold mb-3 tracking-tighter text-premium-gradient">
              HyperStream
            </h1>
            <p className="text-gray-400 font-medium text-base leading-relaxed max-w-[280px] mx-auto">
              High-performance continuous settlement protocol.
            </p>
          </div>

          <div className="w-full space-y-6">
            <button
              onClick={connectWallet}
              className="btn-jade w-full group"
            >
              <Sparkles className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Connect Wallet</span>
              <ArrowRight className="w-4 h-4 ml-2 opacity-50 transition-transform group-hover:translate-x-1" />
            </button>
            <div className="flex items-center justify-center gap-6 opacity-30">
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Built for Monad</div>
              <div className="w-1 h-1 rounded-full bg-gray-600" />
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">v1.0.4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
