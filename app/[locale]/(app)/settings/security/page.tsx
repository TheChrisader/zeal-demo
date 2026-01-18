"use client";
import {
  AlertCircle,
  CheckCircle2,
  Key,
  KeyRound,
  Lock,
  Shield,
  ShieldCheck,
  ShieldX,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import PasswordModal from "./popup/PasswordModal";
import TwoFAModal from "./popup/TwoFAModal";

const SecuritySettings = () => {
  const { user, refresh } = useAuth();
  const [twoFAModalOpen, setTwoFAModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [isLoading2FA, setIsLoading2FA] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [regeneratingCodes, setRegeneratingCodes] = useState(false);

  // Backup codes regeneration handler
  const handleRegenerateBackupCodes = async () => {
    const password = prompt("Enter your password to regenerate backup codes:");
    if (!password) return;

    setRegeneratingCodes(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/v1/2fa/backup-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setBackupCodes(data.backupCodes);
        setShowBackupCodesModal(true);
        setSuccessMessage("New backup codes generated!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(data.error || "Failed to regenerate backup codes");
      }
    } catch (error) {
      setErrorMessage("Something went wrong");
    } finally {
      setRegeneratingCodes(false);
    }
  };

  const handle2FAToggle = async (checked: boolean) => {
    setIsLoading2FA(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (checked) {
      try {
        setTwoFAModalOpen(true);
        const response = await fetch("/api/v1/2fa/generate", {
          method: "POST",
        });
        const data = await response.json();
        setQrCodeData(data.qrCode);
      } catch (error) {
        console.error("Error generating 2FA:", error);
        setErrorMessage("Failed to setup 2FA. Please try again.");
      } finally {
        setIsLoading2FA(false);
      }
    } else {
      try {
        const response = await fetch("/api/v1/2fa/disable", {
          method: "POST",
        });
        if (response.ok) {
          await refresh();
          setSuccessMessage("2FA disabled successfully");
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      } catch (error) {
        console.error("Error disabling 2FA:", error);
        setErrorMessage("Failed to disable 2FA. Please try again.");
      } finally {
        setIsLoading2FA(false);
      }
    }
  };

  return (
    <div className="w-full space-y-4 sm:mx-auto sm:max-w-4xl sm:space-y-6 sm:p-0">
      {/* Header Section */}
      <div className="flex flex-col space-y-3">
        <CardTitle className="text-xl font-bold text-foreground/80 sm:text-2xl">
          Security Settings
        </CardTitle>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px]">
              Ctrl+P
            </kbd>
            change password
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px]">
              Ctrl+2
            </kbd>
            toggle 2FA
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px]">
              Esc
            </kbd>
            cancel
          </span>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 animate-in fade-in-0 slide-in-from-top-2 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle2 className="size-4 shrink-0 text-green-500" />
          <span className="text-sm text-green-600 dark:text-green-400">
            {successMessage}
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 animate-in fade-in-0 slide-in-from-top-2 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="size-4 shrink-0 text-red-500" />
          <span className="text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </span>
        </div>
      )}

      {/* Security Options Card */}
      <Card className="w-full border-0 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
        <CardHeader className="px-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Shield className="size-5 text-muted-foreground" />
              Security Options
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your account security and authentication preferences
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          {/* Password Change Section */}
          <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
            <div className="relative flex w-full items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-lg bg-blue-500/5 p-3 transition-all duration-200 group-hover:bg-blue-500/10">
                  <Key className="size-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground/80">
                      Password
                    </p>
                    <Badge
                      variant="outline"
                      className="h-4 gap-1 px-1.5 text-[10px]"
                    >
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Change your account password regularly to maintain security
                  </p>
                </div>
              </div>
              <PasswordModal>
                <Lock className="size-4" />
                <span className="hidden sm:inline">Change</span>
              </PasswordModal>
            </div>
          </div>

          {/* 2FA Section */}
          <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`shrink-0 rounded-lg p-3 transition-all duration-200 ${
                    user?.two_fa_enabled
                      ? "bg-green-500/10 group-hover:bg-green-500/20"
                      : "bg-orange-500/5 group-hover:bg-orange-500/10"
                  }`}
                >
                  {user?.two_fa_enabled ? (
                    <ShieldCheck className="size-5 text-green-600" />
                  ) : (
                    <ShieldX className="size-5 text-orange-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground/80">
                      Two-Factor Authentication
                    </p>
                    {user?.two_fa_enabled ? (
                      <Badge className="h-4 gap-1 bg-green-500/10 px-1.5 text-[10px] text-green-600 hover:text-white">
                        <CheckCircle2 className="size-2.5" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="h-4 gap-1 border-yellow-600 px-1.5 text-[10px] text-yellow-600"
                      >
                        <AlertCircle className="size-2.5" />
                        Disabled
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user?.two_fa_enabled
                      ? "Your account is protected with 2FA"
                      : "Add an extra layer of security to your account"}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground/60">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="size-2.5" />
                      Authenticator app required
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={user?.two_fa_enabled}
                  onCheckedChange={handle2FAToggle}
                  disabled={isLoading2FA}
                  className="shrink-0 data-[state=checked]:bg-green-600"
                />
              </div>
            </div>
          </div>

          {/* Backup Codes Section - Only shown when 2FA is enabled */}
          {user?.two_fa_enabled && (
            <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-lg bg-purple-500/5 p-3 transition-all duration-200 group-hover:bg-purple-500/10">
                    <KeyRound className="size-5 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground/80">
                        Backup Codes
                      </p>
                      <Badge
                        variant="outline"
                        className="h-4 px-1.5 text-[10px]"
                      >
                        Recovery
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Generate recovery codes for when you can&apos;t access
                      your authenticator
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRegenerateBackupCodes}
                  disabled={regeneratingCodes}
                  className="shrink-0"
                >
                  {regeneratingCodes ? "Generating..." : "Regenerate"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TwoFA Modal */}
      <TwoFAModal
        open={twoFAModalOpen}
        onOpenChange={setTwoFAModalOpen}
        qrCode={qrCodeData}
        onVerify={async (code) => {
          try {
            const response = await fetch("/api/v1/2fa/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code }),
            });

            if (response.ok) {
              const data = await response.json();
              await refresh();
              setSuccessMessage("2FA enabled successfully!");
              setTimeout(() => setSuccessMessage(null), 3000);
              // Return the data with backup codes to the modal
              return { success: true, backupCodes: data.backupCodes };
            } else {
              throw new Error("Verification failed");
            }
          } catch (error) {
            console.error("Error verifying 2FA:", error);
            setErrorMessage("Invalid code. Please try again.");
            throw error;
          }
        }}
      />

      {/* Backup Codes Modal */}
      {showBackupCodesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold">
              Save Your Backup Codes
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              These codes won&apos;t be shown again. Store them securely.
            </p>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {backupCodes.map((code, i) => (
                <code
                  key={i}
                  className="rounded bg-muted p-2 text-center font-mono text-xs"
                >
                  {code}
                </code>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join("\n"));
                  toast.success("Codes copied to clipboard");
                }}
                className="flex-1"
              >
                Copy All
              </Button>
              <Button
                onClick={() => setShowBackupCodesModal(false)}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
