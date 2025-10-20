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
  useEffect,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import CountryForm from "./_components/CountryForm";
import ReferralForm from "./_components/ReferralForm";
import TopicsForm from "./_components/TopicsForm";
import AuthHeader from "../_components/AuthHeader";

const OnboardingSteps = ["country", "referral", "topics"] as const;

type OnboardingStep = (typeof OnboardingSteps)[number];

type OnboardingContextValue = {
  step: OnboardingStep;
  setStep: Dispatch<SetStateAction<OnboardingStep>>;
  setError: Dispatch<SetStateAction<string | null>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  shouldSkipReferral: boolean;
  // email: string;
  // setEmail: Dispatch<SetStateAction<string>>;
};

export const OnboardingContext = createContext<OnboardingContextValue | null>(
  null,
);

const getOnboardingHeader = (
  step: OnboardingStep,
  totalSteps: number,
  currentStep: number,
) => {
  const headers: Record<OnboardingStep, { subheader: string }> = {
    country: {
      subheader:
        "Kindly select the country in which you wish to get news relating to. You can always update this later.",
    },
    referral: {
      subheader:
        "If you have a referral code, you can apply it here. This step is completely optional.",
    },
    topics: {
      subheader:
        "Kindly select your preferred news topics and categories. You can always update this later.",
    },
  };

  return {
    ...headers[step],
    stepTracker: () => (
      <span className="text-sm font-normal text-[#9CA3AF] underline">
        {currentStep}/{totalSteps}
      </span>
    ),
  };
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
  const { user } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("country");
  const [, /* error */ setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Determine if user should skip referral step
  const shouldSkipReferral = !!user?.referred_by;

  // Calculate visible steps and current step number
  const visibleSteps = useMemo(() => {
    if (shouldSkipReferral) {
      return OnboardingSteps.filter((s) => s !== "referral");
    }
    return OnboardingSteps;
  }, [shouldSkipReferral]);

  const currentStepNumber = useMemo(() => {
    return visibleSteps.indexOf(step) + 1;
  }, [step, visibleSteps]);

  const totalSteps = visibleSteps.length;

  // Auto-skip referral step if user already has a referrer
  useEffect(() => {
    if (shouldSkipReferral && step === "country") {
      // This will be handled by CountryForm navigation logic
    }
  }, [shouldSkipReferral, step]);

  const AnimateCountryForm = useMemo(() => motion(CountryForm), []);
  const AnimateReferralForm = useMemo(() => motion(ReferralForm), []);
  const AnimateTopicsForm = useMemo(() => motion(TopicsForm), []);

  const OnboardingHeaderValue = useMemo(
    () => getOnboardingHeader(step, totalSteps, currentStepNumber),
    [step, totalSteps, currentStepNumber],
  );

  const OnboardingContextValue: OnboardingContextValue = useMemo(
    () => ({
      step,
      setStep,
      setError,
      isLoading,
      setIsLoading,
      shouldSkipReferral,
      //   email,
      //   setEmail,
    }),
    [
      step,
      isLoading,
      shouldSkipReferral,
      // email
    ],
  );
  return (
    <>
      <AuthHeader title="Personalize your news!">
        <OnboardingHeaderValue.stepTracker />
      </AuthHeader>
      <span className="mb-3 text-sm font-normal text-muted-alt">
        {OnboardingHeaderValue.subheader}
      </span>
      <OnboardingContext.Provider value={OnboardingContextValue}>
        <AnimatePresence mode="wait">
          {step === "country" && <AnimateCountryForm key="country" />}
          {step === "referral" && <AnimateReferralForm key="referral" />}
          {step === "topics" && <AnimateTopicsForm key="topics" />}
        </AnimatePresence>
        {/* {children} */}
      </OnboardingContext.Provider>
    </>
  );
};

export default OnboardingPage;
