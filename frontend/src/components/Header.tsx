import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Wallet, LogOut } from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  const { balance, walletAddress, disconnectWallet } = useApp();

  // Hide header on login page
  if (location.pathname === '/') return null;

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  return (
    <header className="fixed top-0 right-0 p-6 z-50 flex items-center gap-3">
      <div className="glass-panel rounded-full px-6 py-2 flex items-center gap-3">
        <Wallet className="w-5 h-5 text-neon-cyan" />
        <span className="font-mono text-neon-cyan font-bold text-sm">
          {parseFloat(balance).toFixed(4)} MON
        </span>
        <span className="text-gray-500 text-xs font-mono">
          {truncatedAddress}
        </span>
      </div>
      <button
        onClick={disconnectWallet}
        className="glass-panel rounded-full p-2 hover:bg-white/10 transition-colors"
        title="Disconnect wallet"
      >
        <LogOut className="w-4 h-4 text-gray-400 hover:text-white" />
      </button>
    </header>
  );
};
