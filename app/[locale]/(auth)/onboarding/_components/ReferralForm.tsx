"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReferralClient } from "@/hooks/useReferralClient";
import { onboardingVariants, useOnboardingContext } from "../page";

const ReferralForm = ({ key }: { key: string }) => {
  const { setStep } = useOnboardingContext();
  const { referralCode, clearReferralCode, setReferralCodeManually } =
    useReferralClient();
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    // Clear any existing errors when referral code changes
    if (referralCode || manualCode) {
      setError(null);
    }
  }, [referralCode, manualCode]);

  const handleApplyReferral = async () => {
    const codeToApply = manualCode.trim() || referralCode;

    if (!codeToApply) {
      handleContinueWithoutReferral();
      return;
    }

    setIsApplying(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/referral/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ referral_code: codeToApply }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successfully applied referral code
        if (manualCode) {
          setReferralCodeManually(manualCode);
        }
        setStep("topics");
      } else {
        // Failed to apply referral code
        setError(data.message || "Invalid referral code");
      }
    } catch (err) {
      setError("Failed to apply referral code");
    } finally {
      setIsApplying(false);
    }
  };

  const handleContinueWithoutReferral = () => {
    clearReferralCode();
    setStep("topics");
  };

  const hasReferralCode = Boolean(referralCode);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      key={key}
      variants={onboardingVariants}
      className="space-y-6"
    >
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Referral Code (Optional)</h3>
        <p className="text-sm text-muted-foreground">
          If you have a referral code, you can apply it here
        </p>
      </div>

      {hasReferralCode && !showManualInput && (
        <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="size-5" />
            <span className="font-medium">Referral Code Detected</span>
          </div>
          <p className="text-green-700">
            You were referred by:{" "}
            <span className="font-mono font-bold">{referralCode}</span>
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleApplyReferral}
              disabled={isApplying}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isApplying ? "Applying..." : "Apply & Continue"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowManualInput(true)}
              className="flex-1"
            >
              Use Different Code
            </Button>
          </div>
        </div>
      )}

      {showManualInput && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="referral-code" className="text-sm font-medium">
              Referral Code
            </label>
            <Input
              id="referral-code"
              placeholder="Enter referral code (optional)"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              maxLength={10}
              className="uppercase"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="size-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={handleApplyReferral}
              disabled={isApplying || (!manualCode.trim() && !hasReferralCode)}
              className="w-full"
            >
              {isApplying
                ? "Applying..."
                : manualCode.trim()
                  ? "Apply Referral Code"
                  : "Continue"}
            </Button>

            {hasReferralCode && showManualInput && (
              <Button
                variant="outline"
                onClick={() => setShowManualInput(false)}
                className="w-full"
              >
                Back to Detected Code
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={handleContinueWithoutReferral}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Continue without referral code
            </Button>
          </div>
        </div>
      )}

      {!hasReferralCode && !showManualInput && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowManualInput(true)}
            className="w-full"
          >
            I Have a Referral Code
          </Button>
          <Button
            variant="ghost"
            onClick={handleContinueWithoutReferral}
            className="mt-2 w-full text-muted-foreground hover:text-foreground"
          >
            Continue without referral code
          </Button>
        </div>
      )}
    </motion.div>
  );
};

ReferralForm.displayName = "ReferralForm";

export default ReferralForm;
