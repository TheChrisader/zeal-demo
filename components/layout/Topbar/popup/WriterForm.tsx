import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuth from "@/context/auth/useAuth";

const WriterForm = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="scrollbar-change max-h-[85vh] gap-2 overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sign up as a writer</DialogTitle>
          <DialogDescription className="">
            To make publications/create articles, or to upgrade your account to
            access more features, you need to sign up as a writer.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="name" className="text-right">
              Brand Name
            </Label>
            <Input
              id="name"
              defaultValue={user?.display_name}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Twitter:
            </Label>
            <Input
              id="username"
              defaultValue={`@${user?.username}TW`}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Facebook:
            </Label>
            <Input
              id="username"
              defaultValue={`@${user?.username}FB`}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Youtube:
            </Label>
            <Input
              id="username"
              defaultValue={`@${user?.username}YT`}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Blog:
            </Label>
            <Input
              id="username"
              defaultValue={`@${user?.username}`}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              TikTok:
            </Label>
            <Input
              id="username"
              defaultValue={`@${user?.username}`}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Medium:
            </Label>
            <Input
              id="username"
              defaultValue={`@${user?.username}`}
              className="col-span-3"
            />
          </div>
          <div className="mb-5 grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Website:
            </Label>
            <Input
              id="username"
              defaultValue={`@${user?.username}`}
              className="col-span-3"
            />
          </div>
          <div className="flex items-center justify-between gap-4 px-7">
            <Label htmlFor="major-publisher" className="text-right">
              Are you a major publisher?
            </Label>
            <Checkbox id="major-publisher" className="col-span-3" />
          </div>
          <div className="flex items-center justify-between gap-4 px-7">
            <Label htmlFor="content-audio-video" className="text-right">
              Will you be uploading audio content, video, or both?
            </Label>
            <Checkbox id="content-audio-video" className="col-span-3" />
          </div>
          <div className="flex items-center justify-between gap-4 px-7">
            <Label htmlFor="terms-and-conditions" className="text-right">
              Do you agree with the Terms and conditions?
            </Label>
            <Checkbox id="terms-and-conditions" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit">Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WriterForm;
