import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import NamedCheckbox from "@/components/forms/Input/NamedCheckbox";
import SearchInput from "@/components/forms/Input/SearchInput";
import { Button } from "@/components/ui/button";
import { onboardingVariants, useOnboardingContext } from "../page";
import { useRouter } from "@/app/_components/useRouter";
import { flattenCategories } from "@/utils/category.utils";
import Categories from "@/categories";
import { IPreferences } from "@/types/preferences.type";
import {
  getPreferences,
  updatePreferences,
} from "@/services/preferences.services";

const TOPICS = [
  "Technology",
  "Sports",
  "Agriculture",
  "Medicine",
  "Enviornment",
  "Food",
  "Domestic",
  "Health",
  "Education",
  "Tourism",
  "Business",
  "Crime",
  "Lifestyle",
];

const TopicsForm = React.forwardRef(({ key }: { key: string }, _) => {
  // const { setStep } = useOnboardingContext();
  const TOPICS = flattenCategories(Categories)
    .filter((c) => c !== "For you")
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
      router.push("/");
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
        disabled={!preferences}
      >
        Finish Account Creation
      </Button>
    </motion.div>
  );
});

TopicsForm.displayName = "TopicsForm";

export default TopicsForm;
