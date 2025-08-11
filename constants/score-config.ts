// --- CONFIGURATION CONSTANTS (Adjust these values to tune your platform) ---
export const SCORE_CONFIG = {
  // Base score based on the source of the content
  base: {
    user: 100, // Content from real writers is most valuable
    auto: 50, // LLM-generated or aggregated content
  },
  // Multipliers for how "rich" the content is
  richness: {
    wordCount: {
      medium: 1.1, // 10% boost for 300-800 words
      long: 1.25, // 25% boost for 800+ words
    },
    imageBonus: {
      tier1: 1.05, // 5% boost for 1-2 images
      tier2: 1.1, // 10% boost for 3-5 images
      tier3: 1.15, // 15% boost for 6+ images
    },
    subheadingBonus: {
      tier1: 1.03, // 3% boost for 2-4 subheadings (basic structure)
      tier2: 1.07, // 7% boost for 5-9 subheadings (well-structured)
      tier3: 1.12, // 12% boost for 10+ subheadings (deeply structured / listicle)
    },
    categoryBonus: {
      tier1: 1.15, // 5% boost for 1-2 categories
      //   tier2: 1.1, // 10% boost for 3-5 categories
      //   tier3: 1.15, // 15% boost for 6+ categories
    },
  },
  // The 'k' constant for the exponential decay formula
  timelinessDecay: {
    user: 0.02, // Writer content decays slowly
    auto: 0.06, // Automated content becomes "old news" faster
  },
  // The threshold for the novelty check
  novelty: {
    similarityThreshold: 0.6, // If >60% similar to another post, apply penalty
    redundancyPenalty: 0.4, // Score is multiplied by this if redundant
  },
};

export const TIER_ONE_PROMOTED_CATEGORIES = ["Local", "Politics"];
