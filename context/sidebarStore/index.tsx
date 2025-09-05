import { createContext } from "react";
import { StoreApi, UseBoundStore } from "zustand";
import { SidebarState } from "@/stores/sidebarStore";

const SidebarStoreContext = createContext<StoreApi<SidebarState> | null>(null);

export default SidebarStoreContext;
