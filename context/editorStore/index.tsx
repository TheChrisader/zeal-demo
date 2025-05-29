"use client";

import { createContext } from "react";
import { type EditorStore } from "@/stores/editorStore";

const EditorStoreContext = createContext<EditorStore | null>(null);

export default EditorStoreContext;
