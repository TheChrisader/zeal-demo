import CaretRightIcon from "@/assets/svgs/utils/CaretRightIcon";
import LockIcon from "@/assets/svgs/utils/LockIcon";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import PasswordModal from "./popup/PasswordModal";

const SecuritySettings = () => {
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
        {/* <Button
          variant="unstyled"
          size="unstyled"
          className="flex w-full items-center justify-between py-2"
        > */}
        <PasswordModal>
          <div className="flex items-center gap-2">
            <LockIcon />
            <span className="text-sm font-normal text-[#2F2D32]">
              Change Password
            </span>
          </div>
          <CaretRightIcon />
        </PasswordModal>
        {/* </Button> */}
        <label className="flex cursor-pointer items-center justify-between py-2 hover:bg-gray-100">
          <div className="flex">
            <span className="text-sm font-normal text-[#2F2D32]">
              Enable Login 2FA
            </span>
          </div>
          <Switch />
        </label>
      </div>
      <div className="mt-9 flex w-full justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};

export default SecuritySettings;
