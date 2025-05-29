import { createContext } from "react";
import { create, createStore } from "zustand";

export interface EditorState {
  activeDocumentId: string | undefined;
  currentContent: string;
  isContentUpdating: boolean;
  setActiveDocumentId: (id: string | undefined) => void;
  setCurrentContent: (content: string) => void;
  setIsContentUpdating: (isUpdating: boolean) => void;
}

// export const useEditorStore = create<EditorState>((set) => ({
//   activeDocumentId: undefined,
//   currentContent: "",
//   isContentUpdating: false,
//   setActiveDocumentId: (id) => set({ activeDocumentId: id }),
//   setCurrentContent: (content) => set({ currentContent: content }),
//   setIsContentUpdating: (isUpdating) => set({ isContentUpdating: isUpdating }),
// }));

export const createEditorStore = (initProps?: Partial<EditorState>) => {
  const defaultProps = {
    activeDocumentId: undefined,
    currentContent: "",
    isContentUpdating: false,
  };

  return createStore<EditorState>((set) => ({
    ...defaultProps,
    ...initProps,
    setActiveDocumentId: (id) => set({ activeDocumentId: id }),
    setCurrentContent: (content) => set({ currentContent: content }),
    setIsContentUpdating: (isUpdating) =>
      set({ isContentUpdating: isUpdating }),
  }));
};

export type EditorStore = ReturnType<typeof createEditorStore>;
