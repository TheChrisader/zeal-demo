import { Separator } from "@/components/ui/separator";

const AuthHeader = ({
  title,
  children,
  spaceOption = "larger",
}: {
  title: string;
  children: React.ReactNode;
  spaceOption?: "smaller" | "larger";
}) => {
  return (
    <>
      <div className="mb-1 flex w-full items-center justify-between gap-6">
        <h1 className="text-foreground-alt text-nowrap text-[28px] font-semibold">
          {title}
        </h1>
        {children}
      </div>
      <Separator
        className={`w-[calc(100%+35px)] ${spaceOption === "larger" ? "mb-[10px]" : "mb-[10px]"}`}
      />
    </>
  );
};

export default AuthHeader;
