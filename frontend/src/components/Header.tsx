import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Wallet } from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  const { balance } = useApp();

  // Hide header on login page
  if (location.pathname === '/') return null;

  return (
    <header className="fixed top-0 right-0 p-6 z-50">
      <div className="glass-panel rounded-full px-6 py-2 flex items-center gap-3">
        <Wallet className="w-5 h-5 text-neon-cyan" />
        <span className="font-mono text-neon-cyan font-bold">
          {balance.toFixed(4)} ETH
        </span>
      </div>
    </header>
  );
};
