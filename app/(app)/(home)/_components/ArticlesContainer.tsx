import { ReactNode } from "react";
import NewsIcon from "@/assets/svgs/utils/NewsIcon";
import { Separator } from "@/components/ui/separator";

const ContainerHeader = ({ header }: { header: string }) => {
  if (header === "Trending") {
    return (
      <h2 className="flex items-center gap-4 text-2xl font-bold text-[#2F2D32]">
        <NewsIcon /> {header}
      </h2>
    );
  } else {
    return (
      <h1 className="flex items-center gap-4 text-2xl font-bold text-[#2F2D32]">
        <NewsIcon /> {header}
      </h1>
    );
  }
};

const ArticlesContainer = ({
  children,
  title,
  className,
}: {
  children?: ReactNode;
  title: string;
  className?: string;
}) => {
  return (
    <section
      className={`mb-3 flex h-fit w-full min-w-[45%] flex-1 flex-col gap-2 rounded-[20px] bg-white px-3 py-4 shadow-sm ${className}`}
    >
      {/* {title === "Headlines" ? (
        <h1 className="flex items-center gap-4 text-2xl font-bold text-[#2F2D32]">
          <NewsIcon /> Headlines
        </h1>
      ) : (
        <h2 className="flex items-center gap-4 text-2xl font-bold text-[#2F2D32]">
          <NewsIcon />
          Trending
        </h2>
      )} */}
      <ContainerHeader header={title} />
      <Separator />
      {children}
    </section>
  );
};

export default ArticlesContainer;
