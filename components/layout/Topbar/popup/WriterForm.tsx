import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAuth from "@/context/auth/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface SocialPlatform {
  id: string;
  platform: string;
  handle: string;
}

const platforms = [
  { value: "Twitter / X", label: "Twitter / X" },
  { value: "Facebook", label: "Facebook" },
  { value: "Youtube", label: "YouTube" },
  { value: "Instagram", label: "Instagram" },
  { value: "Linkedin", label: "LinkedIn" },
  { value: "Tiktok", label: "TikTok" },
  { value: "Medium", label: "Medium" },
  { value: "Website", label: "Website" },
];

const WriterForm = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const [brandName, setBrandName] = useState("");
  const [socialPlatforms, setSocialPlatforms] = useState<SocialPlatform[]>([
    { id: "1", platform: "", handle: "" },
  ]);
  const [isPublisher, setIsPublisher] = useState(false);
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [willUploadMedia, setWillUploadMedia] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");

  const addPlatform = () => {
    setSocialPlatforms([
      ...socialPlatforms,
      { id: Math.random().toString(), platform: "", handle: "" },
    ]);
  };

  const removePlatform = (id: string) => {
    if (socialPlatforms.length > 1) {
      setSocialPlatforms(socialPlatforms.filter((p) => p.id !== id));
    }
  };

  const updatePlatform = (
    id: string,
    field: "platform" | "handle",
    value: string,
  ) => {
    setSocialPlatforms(
      socialPlatforms.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault();
      setError("");

      if (!brandName) {
        setError("Brand name is required");
        return;
      }

      if (!socialPlatforms.some((p) => p.platform && p.handle)) {
        setError("At least one social platform with handle is required");
        return;
      }

      if (!agreedToTerms) {
        setError("You must agree to the terms and conditions");
        return;
      }

      // Handle form submission
      console.log({
        brandName,
        socialPlatforms,
        isPublisher,
        isFreelancer,
        willUploadMedia,
        agreedToTerms,
      });
      await fetch("/api/v1/writer-request", {
        method: "POST",
        body: JSON.stringify({
          user_id: user?.id,
          name: user?.display_name,
          brand_name: brandName,
          social_platforms: socialPlatforms.map((p) => ({
            platform: p.platform,
            url: p.handle,
          })),
          is_publisher: isPublisher,
          is_freelancer: isFreelancer,
          will_upload_media: willUploadMedia,
        }),
      });
      setOpen(false);
    } catch (error) {
      setError("Something went wrong.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="scrollbar-change max-h-[95vh] gap-2 overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Sign up as a writer</DialogTitle>
          <DialogDescription className="">
            To make publications/create articles, or to upgrade your account to
            access more features, you need to sign up as a writer.
          </DialogDescription>
        </DialogHeader>
        <form
          // onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="brandName">Brand Name</Label>
            <Input
              id="brandName"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Enter your brand name"
              className="transition-all duration-200 focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {socialPlatforms.map((platform, index) => (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-3"
                >
                  <Select
                    value={platform.platform}
                    onValueChange={(value) =>
                      updatePlatform(platform.id, "platform", value)
                    }
                  >
                    <SelectTrigger className="w-fit gap-1">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative w-full flex-1">
                    <Input
                      placeholder="Enter link"
                      value={platform.handle}
                      onChange={(e) =>
                        updatePlatform(platform.id, "handle", e.target.value)
                      }
                      className="pr-10"
                    />
                    {index > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{ y: "-50%" }}
                        type="button"
                        onClick={() => removePlatform(platform.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive transition-colors hover:text-destructive/80"
                      >
                        <Trash2 className="h-5 w-5" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              type="button"
              variant="outline"
              onClick={addPlatform}
              className="flex w-full items-center gap-2 transition-colors hover:bg-secondary/80"
            >
              <Plus className="h-4 w-4" />
              Add Social Platform
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="publisher"
                checked={isPublisher}
                onCheckedChange={(checked) =>
                  setIsPublisher(checked as boolean)
                }
              />
              <Label htmlFor="publisher">Are you a major publisher?</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="freelancer"
                checked={isFreelancer}
                onCheckedChange={(checked) =>
                  setIsFreelancer(checked as boolean)
                }
              />
              <Label htmlFor="freelancer">
                Are you a freelance writer/content creator?
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="media"
                checked={willUploadMedia}
                onCheckedChange={(checked) =>
                  setWillUploadMedia(checked as boolean)
                }
              />
              <Label htmlFor="media">
                Will you be uploading audio content, video, or both?
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) =>
                  setAgreedToTerms(checked as boolean)
                }
              />
              <Label htmlFor="terms">
                Do you agree with our Terms and conditions?
              </Label>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
        <DialogFooter className="mt-4">
          {/* <DialogClose asChild> */}
          <Button
            // type="submit"
            onClick={handleSubmit}
            className="w-full bg-primary transition-colors hover:bg-primary/90"
          >
            Save changes
          </Button>
          {/* </DialogClose> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WriterForm;
