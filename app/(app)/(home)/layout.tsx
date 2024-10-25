import { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import OneTap from "../_components/OneTap";

const HomeLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="flex flex-col gap-5 bg-blue-50/60">
      <Navbar />
      <div className="px-[100px] max-[1024px]:px-7 max-[500px]:px-0">
        {children}
      </div>
      <OneTap />
    </div>
  );
};

export default HomeLayout;
