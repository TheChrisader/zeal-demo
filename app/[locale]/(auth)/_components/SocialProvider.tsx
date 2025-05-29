import { useRouter } from "@/app/_components/useRouter";
import { Button } from "@/components/ui/button";

const SocialProvider = ({
  Icon,
  name,
  children,
}: {
  Icon: () => JSX.Element;
  name: string;
  children: React.ReactNode;
}) => {
  const router = useRouter();

  const handleProvider = async () => {
    if (name !== "google") return;

    try {
      router.push(`/api/v1/auth/signin/${name}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-[10px]">
      <Button
        className="size-fit items-center justify-center rounded-2xl p-3"
        variant="outline"
        size="icon"
        type="button"
        onClick={handleProvider}
      >
        <Icon />
      </Button>
      <span className="text-center text-sm font-normal text-[#959595]">
        {children}
      </span>
    </div>
  );
};

export default SocialProvider;
