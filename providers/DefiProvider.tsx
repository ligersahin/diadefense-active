// /Users/mahmut/diadefense/providers/DefiProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type DefiContextType = {
  showDefi: boolean;
  openDefi: (reason?: string) => void;
  closeDefi: () => void;
};

const DefiCtx = createContext<DefiContextType>({
  showDefi: false,
  openDefi: () => {},
  closeDefi: () => {}
});

export const DefiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showDefi, setShowDefi] = useState(false);

  useEffect(() => {
    const check = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const last = await AsyncStorage.getItem("defiLastShown");
      if (last !== today) setShowDefi(true); // günde 1 kez
    };
    check();
  }, []);

  const openDefi = () => setShowDefi(true);

  const closeDefi = async () => {
    const today = new Date().toISOString().slice(0, 10);
    await AsyncStorage.setItem("defiLastShown", today);
    setShowDefi(false);
  };

  return (
    <DefiCtx.Provider value={{ showDefi, openDefi, closeDefi }}>
      {children}
    </DefiCtx.Provider>
  );
};

export const useDefi = () => useContext(DefiCtx);
