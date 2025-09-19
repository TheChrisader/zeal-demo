import { ReactNode } from "react";
import NewsIcon from "@/assets/svgs/utils/NewsIcon";
import { extractPath } from "@/categories";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";

const ContainerHeader = ({ header }: { header: string }) => {
  return (
    <h1 className="flex items-center gap-4 text-2xl font-bold text-foreground-alt">
      <NewsIcon />{" "}
      <Link className="text-primary underline" href={extractPath(header)}>
        {header}
      </Link>
    </h1>
  );
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
      className={`mb-3 flex h-fit w-full min-w-[45%] flex-1 flex-col gap-2 rounded-[20px] bg-card-alt-bg px-3 py-4 shadow-sm ${className}`}
    >
      <ContainerHeader header={title} />
      <Separator />
      {children}
    </section>
  );
};

export default ArticlesContainer;
