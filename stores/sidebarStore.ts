import { create, createStore } from "zustand";

export interface SidebarState {
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  isMobile: boolean;
  setIsLeftSidebarOpen: (isOpen: boolean) => void;
  setIsRightSidebarOpen: (isOpen: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  isLeftSidebarOpen: false,
  isRightSidebarOpen: false,
  isMobile: false,
  setIsLeftSidebarOpen: (isOpen) => set({ isLeftSidebarOpen: isOpen }),
  setIsRightSidebarOpen: (isOpen) => set({ isRightSidebarOpen: isOpen }),
  setIsMobile: (isMobile) => set({ isMobile }),
  toggleLeftSidebar: () => set({ isLeftSidebarOpen: !get().isLeftSidebarOpen }),
  toggleRightSidebar: () => set({ isRightSidebarOpen: !get().isRightSidebarOpen }),
}));

export const createSidebarStore = (initProps?: Partial<SidebarState>) => {
  const defaultProps = {
    isLeftSidebarOpen: false,
    isRightSidebarOpen: false,
    isMobile: false,
  };

  return createStore<SidebarState>((set) => ({
    ...defaultProps,
    ...initProps,
    setIsLeftSidebarOpen: (isOpen) => set({ isLeftSidebarOpen: isOpen }),
    setIsRightSidebarOpen: (isOpen) => set({ isRightSidebarOpen: isOpen }),
    setIsMobile: (isMobile) => set({ isMobile }),
    toggleLeftSidebar: () => set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),
    toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
  }));
};

export type SidebarStore = ReturnType<typeof createSidebarStore>;