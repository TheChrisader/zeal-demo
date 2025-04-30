"use client";

import { createContext } from "react";

export type ActionHandlerContextValue = {
  draftRef: HTMLButtonElement | null;
  publishRef: HTMLButtonElement | null;
  setDraftRef: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
  setPublishRef: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
  draftPayload: string | null;
  setDraftPayload: React.Dispatch<React.SetStateAction<string | null>>;
  publishPayload: string | null;
  setPublishPayload: React.Dispatch<React.SetStateAction<string | null>>;
  file: File | string | null;
  setFile: React.Dispatch<React.SetStateAction<File | string | null>>;
  title: string | null;
  setTitle: React.Dispatch<React.SetStateAction<string | null>>;
  category: string | null;
  setCategory: React.Dispatch<React.SetStateAction<string | null>>;
  description: string | null;
  setDescription: React.Dispatch<React.SetStateAction<string | null>>;
  isDraftLoading: boolean;
  setIsDraftLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isPublishLoading: boolean;
  setIsPublishLoading: React.Dispatch<React.SetStateAction<boolean>>;
  draftError: string | null;
  setDraftError: React.Dispatch<React.SetStateAction<string | null>>;
  publishError: string | null;
  setPublishError: React.Dispatch<React.SetStateAction<string | null>>;
};

export const ActionHandlerContext =
  createContext<ActionHandlerContextValue | null>(null);

export default ActionHandlerContext;
