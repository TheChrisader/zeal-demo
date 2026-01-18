"use client";

import { KeyRound, Shield, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/app/_components/useRouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TwoFAVerifyPage() {
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/signin/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: useBackup ? undefined : code,
          backupCode: useBackup ? backupCode : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.usedBackupCode) {
          toast.warning(
            "Backup code used. Please generate new codes from security settings.",
            { duration: 5000 },
          );
        }
        toast.success("Login successful!");
        router.push("/");
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="size-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Two-Factor Authentication
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your verification code to complete sign in
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {!useBackup ? (
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Authenticator Code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                className="h-14 text-center text-2xl tracking-widest"
                autoFocus
                autoComplete="one-time-code"
                inputMode="numeric"
              />
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Smartphone className="size-3" />
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="backupCode" className="text-sm font-medium">
                Backup Code
              </label>
              <Input
                id="backupCode"
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                className="h-14 text-center font-mono text-lg tracking-wide"
                autoFocus
              />
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <KeyRound className="size-3" />
                Enter one of your backup recovery codes
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="h-12 w-full text-base"
            disabled={
              isLoading || (!useBackup ? code.length !== 6 : !backupCode)
            }
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setUseBackup(!useBackup);
              setCode("");
              setBackupCode("");
              setError("");
            }}
            className="w-full text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {useBackup
              ? "← Use authenticator app instead"
              : "Use a backup code instead →"}
          </button>
        </form>
      </div>
    </div>
  );
}
