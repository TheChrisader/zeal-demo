import { useContext } from "react";

import { useStore } from "zustand";
import { EditorState } from "@/stores/editorStore";
import EditorStoreContext from ".";

const useGetEditorStore = () => {
  const context = useContext(EditorStoreContext);
  if (context === null) {
    throw new Error("useEditorStore is null");
  }
  if (context === undefined) {
    throw new Error("useEditorStore was used outside of its Provider");
  }
  return context;
};

export const useEditorStore: <T>(selector: (state: EditorState) => T) => T = (
  selector,
) => useStore(useGetEditorStore(), selector);
