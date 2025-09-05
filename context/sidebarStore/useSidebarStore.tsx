import { useContext } from "react";

import { useStore } from "zustand";
import { SidebarState } from "@/stores/sidebarStore";
import SidebarStoreContext from ".";

const useGetSidebarStore = () => {
  const context = useContext(SidebarStoreContext);
  if (context === null) {
    throw new Error("useSidebarStore is null");
  }
  if (context === undefined) {
    throw new Error("useSidebarStore was used outside of its Provider");
  }
  return context;
};

export const useSidebarStore: <T>(selector: (state: SidebarState) => T) => T = (
  selector,
) => useStore(useGetSidebarStore(), selector);
