import { motion } from "framer-motion";
import { useRouter } from "next-nprogress-bar";
import React from "react";
import NamedCheckbox from "@/components/forms/Input/NamedCheckbox";
import SearchInput from "@/components/forms/Input/SearchInput";
import { Button } from "@/components/ui/button";
import { onboardingVariants } from "../page";

export const SOURCES = [
  "BusinessDay",
  "Daily Nigerian",
  "Daily Post",
  "HyNaija",
  "Ripples Nigeria",
  "Sahara Reporters",
  "This Day Live",
];

const SourcesForm = React.forwardRef(({ key }: { key: string }, _) => {
  const router = useRouter();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      key={key}
      variants={onboardingVariants}
    >
      <SearchInput className="mb-4" placeholder="Search for any news source" />
      <div className="scrollbar-change mb-9 max-h-[45vh] overflow-y-auto">
        {SOURCES.map((source) => (
          <NamedCheckbox key={source}>
            <span className="text-sm font-normal text-[#959595]">{source}</span>
          </NamedCheckbox>
        ))}
      </div>
      <Button
        className="mb-1 w-full rounded-full"
        onClick={() => {
          router.push("/");
        }}
      >
        Finish Account Creation
      </Button>
    </motion.div>
  );
});

SourcesForm.displayName = "SourcesForm";

export default SourcesForm;
