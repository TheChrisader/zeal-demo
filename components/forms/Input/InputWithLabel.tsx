import * as React from "react";
import { FormControl, FormLabel } from "@/components/ui/form";

import { Input, InputProps } from "@/components/ui/input";

interface InputWithLabelProps extends InputProps {
  label: string;
}

export const InputWithLabel = React.forwardRef<
  HTMLInputElement,
  InputWithLabelProps
>(({ label, ...props }: InputWithLabelProps, ref) => {
  return (
    <div
      className={`grid min-w-full max-w-sm items-center gap-1 ${props.className}`}
    >
      <FormLabel
        className="text-sm font-normal text-[#959595]"
        htmlFor={props.id}
      >
        {label}
      </FormLabel>
      <FormControl>
        <Input {...props} ref={ref} />
      </FormControl>
    </div>
  );
});

InputWithLabel.displayName = "InputWithLabel";
