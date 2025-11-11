"use client";
import { useState } from "react";

export const useReferralGeneration = () => {
  const [email, setEmail] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [showLinkPreview, setShowLinkPreview] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState("Copy");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReferralLink = (inputEmail: string) => {
    if (!inputEmail.trim()) {
      alert("Please enter your email to generate a link.");
      return false;
    }

    setIsGenerating(true);

    // Simulate processing time
    setTimeout(() => {
      const handle = inputEmail
        .split("@")[0]
        .replace(/[^a-z0-9]/gi, "")
        .toLowerCase();

      const link = `https://zealnews.africa/r/${handle}`;
      setReferralLink(link);
      setShowLinkPreview(true);
      setIsGenerating(false);
    }, 500);

    return true;
  };

  const copyToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopyButtonText("Copied");
      setTimeout(() => setCopyButtonText("Copy"), 1500);
      return true;
    } catch (e) {
      alert("Copy failed, please select and copy manually.");
      return false;
    }
  };

  const resetForm = () => {
    setEmail("");
    setReferralLink("");
    setShowLinkPreview(false);
    setCopyButtonText("Copy");
    setIsGenerating(false);
  };

  return {
    email,
    setEmail,
    referralLink,
    showLinkPreview,
    copyButtonText,
    isGenerating,
    generateReferralLink,
    copyToClipboard,
    resetForm,
  };
};