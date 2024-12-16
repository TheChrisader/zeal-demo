import { motion } from "framer-motion";
import React from "react";
import NamedCheckbox from "@/components/forms/Input/NamedCheckbox";
import SearchInput from "@/components/forms/Input/SearchInput";
import { Button } from "@/components/ui/button";
import { CountryIconList } from "../_utils/svgs";
import { onboardingVariants, useOnboardingContext } from "../page";

const CountryForm = React.forwardRef(({ key }: { key: string }, _) => {
  const { setStep } = useOnboardingContext();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      key={key}
      variants={onboardingVariants}
    >
      <SearchInput className="mb-4" placeholder="Search for country" />
      <div className="mb-9">
        {CountryIconList.map((country) => (
          <NamedCheckbox key={country.name}>
            <div className="flex items-center gap-2">
              <country.Icon className="size-6 rounded-full" />
              <span className="text-sm font-normal text-[#959595]">
                {country.name}
              </span>
            </div>
          </NamedCheckbox>
        ))}
      </div>
      <Button
        className="mb-6 w-full rounded-full"
        onClick={() => {
          setStep("topics");
        }}
      >
        Proceed
      </Button>
    </motion.div>
  );
});

CountryForm.displayName = "CountryForm";

export default CountryForm;
