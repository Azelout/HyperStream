import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { ethers } from "ethers";

type UserRole = "employer" | "employee" | null;

interface RoadmapItem {
  id: string;
  title: string;
  completed: boolean;
}

interface Stream {
  streamId: string;
  sender: string;
  recipient: string;
  deposit: string;
  tokenAddress: string;
  startTime: string;
  stopTime: string;
  ratePerSecond: string;
  remainingBalance: string;
  currentBalance?: string;
}

interface AppContextType {
  isWalletConnected: boolean;
  walletAddress: string | null;
  userRole: UserRole;
  balance: string;
  streams: Stream[];
  roadmap: RoadmapItem[];
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setRole: (role: UserRole) => void;
  updateRoadmapItem: (id: string, completed: boolean) => void;
  addRoadmapItem: (title: string) => void;
  removeRoadmapItem: (id: string) => void;
  setRoadmapTitle: (id: string, title: string) => void;
  fetchStreams: () => Promise<void>;
}

const API_BASE = "http://localhost:3001/api";
const MONAD_CHAIN_ID = "0x279F"; // 10143 in hex

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [balance, setBalance] = useState("0");
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([
    { id: "1", title: "Initialize smart contract architecture", completed: true },
    { id: "2", title: "Deploy to Monad Testnet", completed: false },
    { id: "3", title: "Security audit phase 1", completed: false },
  ]);

  // Switch to Monad Testnet if needed
  const switchToMonad = async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // Chain not added yet — add it
      if (switchError.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: MONAD_CHAIN_ID,
            chainName: "Monad Testnet",
            nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
            rpcUrls: ["https://testnet-rpc.monad.xyz"],
            blockExplorerUrls: ["https://testnet.monadexplorer.com"],
          }],
        });
      }
    }
  };

  // Real MetaMask wallet connection
  const connectWallet = async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      alert("Please install MetaMask to connect your wallet!");
      return;
    }

    setIsLoading(true);
    try {
      // Request account access
      const accounts: string[] = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        setIsWalletConnected(true);

        // Switch to Monad Testnet
        await switchToMonad();

        // Fetch native balance
        const provider = new ethers.BrowserProvider(ethereum);
        const bal = await provider.getBalance(address);
        setBalance(ethers.formatEther(bal));
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsWalletConnected(false);
    setUserRole(null);
    setBalance("0");
    setStreams([]);
  };

  // Fetch streams from backend based on role
  const fetchStreams = useCallback(async () => {
    if (!walletAddress || !userRole) return;

    try {
      const endpoint = userRole === "employer"
        ? `${API_BASE}/employer/${walletAddress}/streams`
        : `${API_BASE}/employee/${walletAddress}/streams`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setStreams(data);
      }
    } catch (error) {
      console.error("Failed to fetch streams:", error);
    }
  }, [walletAddress, userRole]);

  // Listen for account changes
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setWalletAddress(accounts[0]);
      }
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    return () => ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, []);

  // Fetch streams when role is selected
  useEffect(() => {
    if (walletAddress && userRole) {
      fetchStreams();
    }
  }, [walletAddress, userRole, fetchStreams]);

  const setRole = (role: UserRole) => {
    setUserRole(role);
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
        walletAddress,
        userRole,
        balance,
        streams,
        roadmap,
        isLoading,
        connectWallet,
        disconnectWallet,
        setRole,
        updateRoadmapItem,
        addRoadmapItem,
        removeRoadmapItem,
        setRoadmapTitle,
        fetchStreams,
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
