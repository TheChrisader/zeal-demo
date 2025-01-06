import { Separator } from "@/components/ui/separator";

const ContinueWithSeparator = () => {
  return (
    <div className="relative my-5">
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-sm font-normal text-[#959595]">
        Or Continue with
      </span>
      <Separator />
    </div>
  );
};

export default ContinueWithSeparator;
