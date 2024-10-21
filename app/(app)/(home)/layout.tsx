import { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";

const HomeLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="flex flex-col gap-5 bg-blue-50/60">
      <Navbar />
      <div className="px-[100px] max-[1024px]:px-7 max-[500px]:px-0">
        {children}
      </div>
    </div>
  );
};

export default HomeLayout;
