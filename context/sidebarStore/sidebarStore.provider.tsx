"use client";
import { ReactNode, useRef } from "react";
import SidebarStoreContext from ".";
import { createSidebarStore } from "@/stores/sidebarStore";

interface SidebarStoreProviderProps {
  children: ReactNode;
  isLeftSidebarOpen?: boolean;
  isRightSidebarOpen?: boolean;
}

const SidebarStoreProvider = ({
  children,
  isLeftSidebarOpen = false,
  isRightSidebarOpen = false,
}: SidebarStoreProviderProps) => {
  const store = useRef(
    createSidebarStore({ 
      isLeftSidebarOpen,
      isRightSidebarOpen
    })
  ).current;
  
  return (
    <SidebarStoreContext.Provider value={store}>
      {children}
    </SidebarStoreContext.Provider>
  );
};

export default SidebarStoreProvider;