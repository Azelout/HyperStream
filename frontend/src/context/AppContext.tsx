import { createContext, useContext, useState, type ReactNode } from 'react';

type UserRole = 'employer' | 'employee' | null;

interface AppContextType {
  isWalletConnected: boolean;
  userRole: UserRole;
  balance: number;
  connectWallet: () => void;
  setRole: (role: UserRole) => void;
  updateBalance: (amount: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [balance, setBalance] = useState(100.0); // Mock starting balance

  const connectWallet = () => {
    // Simulate wallet connection delay
    setTimeout(() => {
        setIsWalletConnected(true);
    }, 1000);
  };

  const setRole = (role: UserRole) => {
    setUserRole(role);
  };

  const updateBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  return (
    <AppContext.Provider value={{ isWalletConnected, userRole, balance, connectWallet, setRole, updateBalance }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
