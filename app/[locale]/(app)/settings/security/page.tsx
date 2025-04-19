"use client";
import { useState } from "react";
import CaretRightIcon from "@/assets/svgs/utils/CaretRightIcon";
import LockIcon from "@/assets/svgs/utils/LockIcon";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import PasswordModal from "./popup/PasswordModal";
import TwoFAModal from "./popup/TwoFAModal";

const SecuritySettings = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFAModalOpen, setTwoFAModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");

  const handle2FAToggle = async (checked: boolean) => {
    if (checked) {
      try {
        setTwoFAModalOpen(true);
        const response = await fetch("/api/2fa/generate", {
          method: "POST",
        });
        const data = await response.json();
        setQrCodeData(data.qrCode);
      } catch (error) {
        console.error("Error generating 2FA:", error);
      }
    } else {
      // TODO: Implement 2FA disable flow
      setIs2FAEnabled(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex w-full items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-[#2F2D32]">
            Security Settings
          </h3>
          <span className="text-sm font-normal text-[#696969]">
            Change Passwords, Enable 2FA to make your account more secure
          </span>
        </div>
      </div>
      <Separator className="mb-6" />
      <div className="flex w-full max-w-[40vw] flex-col gap-3 max-[500px]:max-w-full">
        <PasswordModal>
          <div className="flex items-center gap-2">
            <LockIcon />
            <span className="text-sm font-normal text-[#2F2D32]">
              Change Password
            </span>
          </div>
          <CaretRightIcon />
        </PasswordModal>
        <label className="flex cursor-pointer items-center justify-between py-2 hover:bg-gray-100">
          <div className="flex">
            <span className="text-sm font-normal text-[#2F2D32]">
              Enable Login 2FA
            </span>
          </div>
          <Switch checked={is2FAEnabled} onCheckedChange={handle2FAToggle} />
        </label>
      </div>
      <div className="mt-9 flex w-full justify-end">
        <Button>Save Changes</Button>
      </div>
      <TwoFAModal
        open={twoFAModalOpen}
        onOpenChange={setTwoFAModalOpen}
        qrCode={qrCodeData}
        onVerify={async (code) => {
          try {
            const response = await fetch("/api/2fa/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code }),
            });

            if (response.ok) {
              setIs2FAEnabled(true);
              setTwoFAModalOpen(false);
            } else {
              throw new Error("Verification failed");
            }
          } catch (error) {
            console.error("Error verifying 2FA:", error);
            throw error;
          }
        }}
      />
    </div>
  );
};

export default SecuritySettings;
