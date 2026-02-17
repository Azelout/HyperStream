import { createContext, useContext, useState, type ReactNode } from "react";

type UserRole = "employer" | "employee" | null;

interface RoadmapItem {
  id: string;
  title: string;
  completed: boolean;
}

interface AppContextType {
  isWalletConnected: boolean;
  userRole: UserRole;
  balance: number;
  roadmap: RoadmapItem[];
  connectWallet: () => void;
  setRole: (role: UserRole) => void;
  updateBalance: (amount: number) => void;
  updateRoadmapItem: (id: string, completed: boolean) => void;
  addRoadmapItem: (title: string) => void;
  removeRoadmapItem: (id: string) => void;
  setRoadmapTitle: (id: string, title: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [balance, setBalance] = useState(100.0); // Mock starting balance
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([
    {
      id: "1",
      title: "Initialize smart contract architecture",
      completed: true,
    },
    { id: "2", title: "Deploy to Monad Testnet", completed: false },
    { id: "3", title: "Security audit phase 1", completed: false },
  ]);

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
    setBalance((prev) => prev + amount);
  };

  const updateRoadmapItem = (id: string, completed: boolean) => {
    setRoadmap((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed } : item)),
    );
  };

  const addRoadmapItem = (title: string) => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      completed: false,
    };
    setRoadmap((prev) => [...prev, newItem]);
  };

  const removeRoadmapItem = (id: string) => {
    setRoadmap((prev) => prev.filter((item) => item.id !== id));
  };

  const setRoadmapTitle = (id: string, title: string) => {
    setRoadmap((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title } : item)),
    );
  };

  return (
    <AppContext.Provider
      value={{
        isWalletConnected,
        userRole,
        balance,
        roadmap,
        connectWallet,
        setRole,
        updateBalance,
        updateRoadmapItem,
        addRoadmapItem,
        removeRoadmapItem,
        setRoadmapTitle,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
