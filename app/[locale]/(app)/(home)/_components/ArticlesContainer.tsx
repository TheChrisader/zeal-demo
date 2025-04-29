import { ReactNode } from "react";
import NewsIcon from "@/assets/svgs/utils/NewsIcon";
import { Separator } from "@/components/ui/separator";

const ContainerHeader = ({ header }: { header: string }) => {
  if (header === "Trending") {
    return (
      <h2 className="text-foreground-alt flex items-center gap-4 text-2xl font-bold">
        <NewsIcon /> {header}
      </h2>
    );
  } else {
    return (
      <h1 className="text-foreground-alt flex items-center gap-4 text-2xl font-bold">
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
      className={`bg-card-alt-bg mb-3 flex h-fit w-full min-w-[45%] flex-1 flex-col gap-2 rounded-[20px] px-3 py-4 shadow-sm ${className}`}
    >
      <ContainerHeader header={title} />
      <Separator />
      {children}
    </section>
  );
};

export default ArticlesContainer;
