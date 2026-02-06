import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useRouter } from "@/app/_components/useRouter";
import Categories from "@/categories";
import NamedCheckbox from "@/components/forms/Input/NamedCheckbox";
import SearchInput from "@/components/forms/Input/SearchInput";
import { Button } from "@/components/ui/button";
import {
  getPreferences,
  updatePreferences,
} from "@/services/preferences.services";
import { IPreferences } from "@/types/preferences.type";
import { flattenCategories } from "@/utils/category.utils";
import { onboardingVariants } from "../page";

const TopicsForm = React.forwardRef(({ key }: { key: string }, _) => {
  const TOPICS = flattenCategories(Categories)
    .filter((c) => c !== "Home")
    .filter((c) => c !== "Headlines");
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<IPreferences | null>(null);
  const router = useRouter();

  const toggleTopic = (topic: string) => {
    if (topics.includes(topic)) {
      setTopics(topics.filter((t) => t !== topic));
    } else {
      setTopics([...topics, topic]);
    }
  };

  useEffect(() => {
    const fetchPreferences = async () => {
      const fethedPreferences = await getPreferences();
      setPreferences(fethedPreferences);
    };

    fetchPreferences();
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await updatePreferences({
        ...preferences,
        category_updates: [
          ...new Set([...preferences!.category_updates, ...topics]),
        ],
      });

      // Check if user came from promo signup
      const isPromoSignup = sessionStorage.getItem("promo_signup") === "true";

      // Clear the promo flag
      sessionStorage.removeItem("promo_signup");

      // Use hard redirect to ensure fresh auth state
      window.location.href = isPromoSignup ? "/settings/referral" : "/";
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      key={key}
      variants={onboardingVariants}
    >
      <SearchInput className="mb-4" placeholder="Search for any news topic" />
      <div className="scrollbar-change mb-9 max-h-[45vh] overflow-y-auto">
        {TOPICS.map((topic) => (
          <NamedCheckbox onCheckedChange={() => toggleTopic(topic)} key={topic}>
            <span className="text-sm font-normal text-[#959595]">{topic}</span>
          </NamedCheckbox>
        ))}
      </div>
      <Button
        className="mb-1 w-full rounded-full"
        onClick={async () => {
          await handleSubmit();
        }}
        disabled={!preferences || isLoading}
      >
        Finish Account Creation
      </Button>
    </motion.div>
  );
});

TopicsForm.displayName = "TopicsForm";

export default TopicsForm;
