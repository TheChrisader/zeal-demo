import { createContext } from "react";
import { StoreApi } from "zustand";
import { SidebarState } from "@/stores/sidebarStore";

const SidebarStoreContext = createContext<StoreApi<SidebarState> | null>(null);

export default SidebarStoreContext;
