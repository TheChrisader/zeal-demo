"use client";
import { ReactNode, useRef } from "react";
import EditorStoreContext from ".";
import { createEditorStore } from "@/stores/editorStore";

interface EditorStoreProviderProps {
  children: ReactNode;
  activeDocumentId?: string;
}

const EditorStoreProvider = ({
  children,
  activeDocumentId,
}: EditorStoreProviderProps) => {
  const store = useRef(createEditorStore({ activeDocumentId })).current;
  return (
    <EditorStoreContext.Provider value={store}>
      {children}
    </EditorStoreContext.Provider>
  );
};

export default EditorStoreProvider;
