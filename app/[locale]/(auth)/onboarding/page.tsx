"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  Dispatch,
  // ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import CountryForm from "./_components/CountryForm";
import SourcesForm from "./_components/SourcesForm";
import TopicsForm from "./_components/TopicsForm";
import AuthHeader from "../_components/AuthHeader";

const OnboardingSteps = ["country", "topics", "sources"] as const;

type OnboardingStep = (typeof OnboardingSteps)[number];

type OnboardingContextValue = {
  step: OnboardingStep;
  setStep: Dispatch<SetStateAction<OnboardingStep>>;
  setError: Dispatch<SetStateAction<string | null>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  // email: string;
  // setEmail: Dispatch<SetStateAction<string>>;
};

export const OnboardingContext = createContext<OnboardingContextValue | null>(
  null,
);

const OnboardingHeader: Record<
  OnboardingStep,
  { subheader: string; stepTracker: () => JSX.Element }
> = {
  country: {
    subheader:
      "Kindly select the country in which you wish to get news relating to. You can always update this later.",
    stepTracker: () => (
      <span className="text-sm font-normal text-[#9CA3AF] underline">1/2</span>
    ),
  },
  topics: {
    subheader:
      "Kindly select your preferred news topics and categories. You can always update this later.",
    stepTracker: () => (
      <span className="text-sm font-normal text-[#9CA3AF] underline">2/2</span>
    ),
  },
  sources: {
    subheader:
      "Kindly select your preferred African news sources. You can always update this later.",
    stepTracker: () => (
      <span className="text-sm font-normal text-[#9CA3AF] underline">3/3</span>
    ),
  },
};

export const onboardingVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { ease: "easeIn" } },
  exit: { opacity: 0, y: 20, transition: { ease: "easeIn" } },
};

export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);
  if (context === null) {
    throw new Error("useOnboardingContext is null");
  }
  if (context === undefined) {
    throw new Error("useOnboardingContext was used outside of its Provider");
  }
  return context;
};

const OnboardingPage = (/* { children }: { children: ReactNode } */) => {
  const [step, setStep] = useState<OnboardingStep>("country");
  const [, /* error */ setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const AnimateCountryForm = useMemo(() => motion(CountryForm), []);
  const AnimateTopicsForm = useMemo(() => motion(TopicsForm), []);
  const AnimateSourcesForm = useMemo(() => motion(SourcesForm), []);

  const OnboardingHeaderValue = useMemo(() => OnboardingHeader[step], [step]);

  const OnboardingContextValue: OnboardingContextValue = useMemo(
    () => ({
      step,
      setStep,
      setError,
      isLoading,
      setIsLoading,
      //   email,
      //   setEmail,
    }),
    [
      step,
      isLoading,
      // email
    ],
  );
  return (
    <>
      <AuthHeader title="Personalize your news!">
        <OnboardingHeaderValue.stepTracker />
      </AuthHeader>
      <span className="text-muted-alt mb-3 text-sm font-normal">
        {OnboardingHeaderValue.subheader}
      </span>
      <OnboardingContext.Provider value={OnboardingContextValue}>
        <AnimatePresence mode="wait">
          {step === "country" && <AnimateCountryForm key="country" />}
          {step === "topics" && <AnimateTopicsForm key="topics" />}
          {step === "sources" && <AnimateSourcesForm key="sources" />}
        </AnimatePresence>
        {/* {children} */}
      </OnboardingContext.Provider>
    </>
  );
};

export default OnboardingPage;
