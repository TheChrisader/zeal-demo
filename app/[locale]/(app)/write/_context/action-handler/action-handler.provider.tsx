"use client";
import React, { ReactNode, useState } from "react";
import ActionHandlerContext, { ActionHandlerContextValue } from ".";

const ActionHandlerProvider = ({ children }: { children: ReactNode }) => {
  const [draftRef, setDraftRef] = useState<HTMLButtonElement | null>(null);
  const [publishRef, setPublishRef] = useState<HTMLButtonElement | null>(null);

  const [draftPayload, setDraftPayload] = useState<string | null>(null);
  const [publishPayload, setPublishPayload] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const value: ActionHandlerContextValue = {
    draftRef,
    setDraftRef,
    publishRef,
    setPublishRef,
    draftPayload,
    setDraftPayload,
    publishPayload,
    setPublishPayload,
    file,
    setFile,
    title,
    setTitle,
    category,
    setCategory,
    isLoading,
    setIsLoading,
    error,
    setError,
  };

  return (
    <ActionHandlerContext.Provider value={value}>
      {children}
    </ActionHandlerContext.Provider>
  );
};

export default ActionHandlerProvider;
