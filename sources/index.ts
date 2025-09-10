import { GoogleGenAI, Type } from "@google/genai";
import { revalidateTag } from "next/cache";
import { stripHtml } from "string-strip-html";
import { WRITER_DISTRIBUTION } from "@/constants/writers";
import ArticleModel from "@/database/article/article.model";
import PostModel from "@/database/post/post.model";
import { newId } from "@/lib/database";
import { calculateInitialScore } from "@/lib/scoring";
import { SlugGenerator } from "@/lib/slug";
import { generateRandomString } from "@/lib/utils";
import { InMemoryQueue, Task } from "@/lib/queue";
import { IArticle } from "@/types/article.type";
import { IPost } from "@/types/post.type";
import { calculateReadingTime } from "@/utils/post.utils";

interface IBatch {
  name: string;
  articles: string[];
}

export const categoryMap: { title: string; groups: string[] }[] = [
  { title: "Local", groups: ["Headlines", "Zeal Headline News"] },
  {
    title: "Across Africa",
    groups: [
      "Top West African News",
      "Top East African News",
      "Top Southern Africa News",
    ],
  },
  {
    title: "Global",
    groups: [
      "Top US News",
      "UK Top News",
      "EU News",
      "Asian News",
      "Zeal Global",
    ],
  },
  { title: "Politics", groups: ["Politics"] },
  { title: "Climate", groups: ["Weather"] },
  { title: "Startup", groups: ["Startup News"] },
  {
    title: "Economy/Finance",
    groups: ["Economy", "Personal Finance", "Market Watch", "Business 360"],
  },
  { title: "Crypto", groups: ["Crypto"] },
  {
    title: "Career",
    groups: [
      "Latest Job News",
      "Career Tips",
      "Top Global Jobs",
      "Entrepreneurship",
    ],
  },
  {
    title: "Latest Tech News",
    groups: [
      "Latest Tech News",
      "Cartech",
      "Gadgets Buying Guide",
      "Gaming",
      "Zeal Tech",
    ],
  },
  { title: "Fintech", groups: ["Fintech"] },
  { title: "AI", groups: ["Artificial Intelligence"] },
  { title: "Health", groups: ["Health News", "Zeal Lifestyle"] },
  { title: "Food", groups: ["Food & Nutrition"] },
  { title: "Travel", groups: ["Travel & Tourism"] },
  { title: "Parenting", groups: ["Family & Parenting"] },
  { title: "Fashion", groups: ["Style & Beauty"] },
  { title: "Celebrity News", groups: ["Celebrity News"] },
  {
    title: "Profiles",
    groups: ["Hot Interviews", "Zeal Entertainment"],
  },
  { title: "Music", groups: ["Trending Music"] },
  { title: "Movies", groups: ["Top Movies"] },
  {
    title: "Sports",
    groups: ["Top Sports News", "UK Premiership", "Basketball"],
  },
];

const ensureDelay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getImageUrlFromArticles = (articles: IArticle[]) => {
  for (const article of articles) {
    if (article.image_url) {
      return article.image_url;
    }
  }
  return undefined;
};

const getWriterName = (category: string) => {
  const writers = WRITER_DISTRIBUTION[category];
  if (!writers?.length) {
    return undefined;
  }

  const randomIndex = Math.floor(Math.random() * writers.length);
  return writers[randomIndex];
};

const getUserId = async (username?: string) => {
  try {
    return {
      id: username,
      name: username,
      icon: "/favicon.ico",
    };
  } catch (error) {
    throw error;
  }
};

// Task data interfaces for the pipeline
interface AggregationTaskData {
  category: { title: string; groups: string[] };
}

interface GenerationTaskData {
  category: string;
  batch: IBatch;
}

interface ReviewTaskData {
  post: Partial<IPost>;
  originalArticles: string[];
}

// Initialize the queue
export const queue = new InMemoryQueue({ concurrency: 3, retryDelay: 2000 });

// Stage 1: Aggregation Task Handler
const handleAggregationTask = async (task: Task<AggregationTaskData>) => {
  const { category } = task.data;
  const { title, groups } = category;

  let query = {};
  if (category.title === "Local") {
    query = {
      country: {
        $in: ["Nigeria"],
      },
      category: {
        $in: groups,
      },
    };
  } else {
    query = {
      category: {
        $in: groups,
      },
    };
  }

  const posts = await ArticleModel.find({
    ...query,
    published_at: {
      $gte: new Date(new Date().setHours(new Date().getHours() - 6)),
      $lt: new Date(),
    },
  })
    .select("_id title source slug link")
    .limit(100)
    .exec();

  const postsList = posts.map((post) => post.title).join(" \n");
  console.log(postsList);

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string,
  });

  const prompt = `
    # Role & Goal
    Act as a meticulous and strict news analyst. Your task is to analyze a list of news article titles and group them into batches based on specific criteria. Be extremely cautious, detail-oriented, and prioritize accuracy according to the rules below. Double-check your reasoning before finalizing the output.
    
    # Input Data
    - **Article Titles:** A list of news article titles provided under "Article Titles".
    - **Category Context:** All provided articles belong to the category: ${title}. Your analysis should remain within this context.
    
    # Batching Rules & Logic
    
    ## Primary Logic: Event-Based Batching
    1.  **Identify Same Event:** Scrutinize the titles to find groups where **two or more titles** clearly and unambiguously refer to the **exact same specific news event**. This requires more than just a similar topic; look for shared specific details like names, locations, specific actions, or outcomes implied in the titles. A **specific** event or story, not one or more closely or loosely related events.
    2.  **Strict Inclusion:** Be highly conservative. If a title's connection to a specific event batch is uncertain or merely topical, **do not include it** in that batch.
    3.  **Form Event Batches:** Create a distinct batch for each group of 2+ titles identified as covering the same specific event.
    
    ## Fallback Logic: Single Important/Interesting Articles
    4.  **Trigger Condition:** Execute this step **only if** the Primary Logic (steps 1-3) results in **zero** event batches being formed.
    5.  **Select Singles:** From the original list, identify what appear to be the most **significant, impactful, or unique** news article titles based *only* on the information present in the title itself. Prioritize titles suggesting major developments, specific data, or unusual occurrences. This will, of course, be relative.
    6.  **Form Single-Article Batches:** Create a separate batch for **each** selected single article title. Each such batch will contain exactly one article title in its articles array.
    
    # Output Requirements
    
    7.  **Minimum and Maximum Batch Count:** You **must** return a minimum of **one (1) batch, with its corresponding articles array,** and a maximum of **two**, in total, only if articles are provided. If there are none, resort to leaving the values empty or undefined. Do **NOT** return any batches if no articles are provided or attempt to explain your rationale for doing so under any circumstance.
        *   **Scenario A (Sufficient Event Batches):** If the Primary Logic yields 2 or more event batches, return the top two hottest batches only.
        *   **Scenario B (No Event Batches):** If the Fallback Logic (step 4) is triggered, ensure you select and create *at least* one single-article batch according to steps 5 and 6.
        *   **Maximum Batch Count:** You are **not allowed** to return more than **two (2) batches** in total. So, ensure to prioritize sensibly.
    8.  **Batch Naming ("batch" field):
        *   For **event batches**, the name must be a concise, descriptive headline summarizing the specific event covered by the articles in that batch. Tend more towards being sensational and interesting than a dry recap.
        *   For **single-article batches**, the name should be a concise, descriptive headline capturing the essence of that single article's title. It can be a rephrasing or abstraction of the original title. Tend more towards being sensational and interesting than a dry recap.
    
    **Correct for Anomalies:** Ensure you take care of any abnormality, mistake, or error in the synthesized result. If there are any errors, typos, or anomalies, correct them. Do not produce an abnormal output. This includes, but is not limited to, unnaturally long sequences of repeated text/characters, content/output that clearly does not conform to the goals of the request, unnaturally long batch titles, anything but article titles under the articles field, and broken responses too long to fit in your token window.
    **Batch Naming:** Each batch should be sufficiently, but reasonably, unique in its titling - without being overly so. It shouldn't be too generic, broad or vague. It should be specific and meaningful, to stand the test of time, so to speak.
    
    # Example Event Batch for an Example Category Context (Latest Tech News):
    {
     "batch": "New in: Major Biotech Company, BB Biotech AG, Reports Net Loss for Q1 2025",
     "articles": [
     "EQS-Adhoc: BB Biotech AG publishes its interim report",
     "BB Biotech AG Reports CHF 241 Million Net Loss for Q1 2025",
     "BB Biotech AG Reports Net Loss",
     "BB Biotech AG fails to meet expectations in Q1 2025",
     "Major Biotech Company, BB Biotech AG, faces major market challenges"
     ]
    }
    
    # Example Single Article Batch for an Example Category Context (Latest Tech News):
    {
     "batch": "New in: Major Biotech Company, BB Biotech AG, Reports Net Loss for Q1 2025",
     "articles": [
     "Major Biotech Company, BB Biotech AG, faces major market challenges"
     ]
    }
    
    # Category Context Value:
    ${title}
    
    # Article Titles:
    ${postsList}
    `;

  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          batch: { type: Type.STRING },
          articles: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["batch", "articles"],
      },
    },
  };

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: prompt,
    config: config,
  });

  let generated_batches = [];
  try {
    console.log(result.text);
    generated_batches = JSON.parse(result.text as string);
  } catch (error) {
    console.log(`Error parsing response: ${error}`);
    throw error;
  }

  const batches: IBatch[] = [];

  for (const generatedBatch of generated_batches) {
    const { batch, articles } = generatedBatch;
    const batchedArticles: string[] = [];

    if (articles.length <= 0) {
      continue;
    }

    for (const article of articles) {
      const post = posts.find((post) => post.title === article);

      if (post) {
        batchedArticles.push(post._id.toString());
      }
    }

    const newBatch = {
      name: batch,
      articles: batchedArticles,
    };

    batches.push(newBatch);
  }

  // Add generation tasks to the queue for each batch
  if (batches.length > 0) {
    for (const batch of batches) {
      queue.addTask(
        "generate",
        {
          category: title,
          batch: batch,
        },
        { priority: 1 },
      );
    }
  }
};

// Stage 2: Generation Task Handler
const handleGenerationTask = async (task: Task<GenerationTaskData>) => {
  const { category, batch } = task.data;

  if (WRITER_DISTRIBUTION[category]?.length === 0) {
    return;
  }

  const batchedPosts = await ArticleModel.find({
    _id: { $in: batch.articles.map((a) => newId(a)) },
  })
    .select("content image_url")
    .exec();

  const content = batchedPosts
    .map((post) => stripHtml(post.content).result)
    .join("\n----\n");

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string,
  });

  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        article: {
          type: Type.STRING,
        },
        preview: {
          type: Type.STRING,
        },
        keywords: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
      required: ["article", "preview", "keywords"],
    },
  };

  const prompt = `Pre: You are an AI assistant tasked with generating structured article content. Be extremely strict, detailed, and cautiously specific. Adhere *precisely* to all instructions, including formatting, content constraints, and conditional logic. Do *not* use any external knowledge or information beyond what is provided in the 'Input Content' section. Recheck your work carefully before responding.
    
    Instructions:
    
    1.  **Analyze Input Content:** Examine the text provided below under 'Input Content'.
    2.  **Handle Empty Input:**
        *   If the 'Input Content' is completely blank, empty, or contains only whitespace, you MUST leave the article, preview and keywords fields empty.
        *   Do not add any other text or explanation if the input is empty.
    3.  **Process Non-Empty Input:**
        *   If the 'Input Content' is not empty, perform the following steps:
            a.  **Synthesize Article:** Carefully read and synthesize the key information from *all* provided article text(s) in the 'Input Content'. Write a *new*, comprehensive, lengthy and coherent article that integrates the main points and themes found *strictly* within the provided text(s). The goal is a detailed synthesis, not just a summary. Ensure logical flow and structure. Format the *entire* synthesized article as HTML. It MUST be enclosed within a single <div> tag. Each paragraph within the article MUST be enclosed within <p> tags. Ensure the HTML is clean and well-formatted (e.g., <p>Paragraph text.</p>). 
            b.  **Generate Preview:** Write a short (2-3 sentences), well formatted, coherent preview text that accurately summarizes the core topic of the synthesized article and entices a reader, like a real news article preview.
            c.  **Extract Keywords:** Identify and list 5-10 relevant keywords or key phrases from the synthesized article that capture its main subjects and themes. Provide these as an array of strings.
            d.  **Correct for Anomalies:** Ensure you take care of any abnormality, mistake, or error in the synthesized article. If there are any errors, typos, or anomalies, correct them. Do not produce an abnormal output. This includes, but is not limited to, unnaturally long sequences of repeated text/characters, content/output that clearly does not conform to the title of the article (in which case, return null), long generated previews, and incomplete responses.
    
    Example Output:
    {
      "article": "<div>\\n  <p>The Indian SUV market is seeing a surge in demand for compact SUVs, with the sub-segment clocking 1.38 
    million units in wholesales in FY2025, a 10% increase year-on-year. This accounts for nearly 50% of the total SUV sales of 2.79 million units, indicating that every second SUV sold in India is a sub-4-meter model. Out of the nearly 100 SUV models available, 
    20 are compact SUVs, with 10 of them leading the charge in the segment.</p>\\n  <p><b>1. Tata Punch:</b> Topping the sales chart for the first time since its launch in October 2021, the Tata Punch recorded 196,572 units, a 15% year-on-year growth. The Punch, 
    available in petrol, CNG, and electric powertrains, has risen two ranks from the previous year. Total domestic sales have crossed 550,000 units since its launch, contributing to 35% of Tata Motors' total passenger vehicle sales in FY2025.</p>\\n  <p><b>2. Maruti Brezza:</b> The Maruti Brezza, a long-standing player in the compact SUV segment, secured second place with 189,163 units, an 11% increase year-on-year. The Brezza has sold a total of 1.24 million units in India since its launch and is available in petrol and CNG powertrains.</p>\\n  <p><b>3. Maruti Suzuki Fronx:</b> The Baleno-based Maruti Fronx reached third place with 166,216 units, a 23% year-on-year growth. The Fronx recorded its best-ever sales in February 2025 and has achieved cumulative sales of 300,951 units since its launch in April 2023, making it the first Nexa SUV to hit the 300,000 milestone.</p>\\n  <p><b>4. Tata Nexon:</b> The Tata Nexon, previously India's top-selling SUV for three consecutive years, experienced a 5% year-on-year decline, selling 163,088 units. Despite the launch of the Nexon CNG, the model has faced increased competition and pressure from its sibling, the Punch.</p>\\n  <p><b>5. Hyundai Venue:</b> The Hyundai Venue also saw a decrease in sales, with 119,113 units sold, down 8% year-on-year. Demand has been flagging, especially with the introduction of the Hyundai Exter. The next-generation Venue is expected 
    to launch by the end of 2025 or early 2026.</p>\\n  <p><b>6. Mahindra 3XO:</b> The Mahindra 3XO has been a strong performer, selling 100,905 units and moving up to sixth place in FY2025. This represents an impressive 84% year-on-year increase. The 3XO's share in Mahindra's SUV sales has risen to 18% from 12% in FY2024.</p>\\n  <p><b>7. Kia Sonet:</b> With sales of 99,805 units, the Kia 
    Sonet recorded a 23% year-on-year growth and is Kia India's best-selling product for the fiscal year. The Sonet surpassed the 400,000 milestone in early February.</p>\\n  <p><b>8. Mahindra Bolero:</b> The Mahindra Bolero brand, including the Bolero, Bolero Neo, and Bolero Neo Plus, sold an estimated 94,750 units, down 15% year-on-year. The Bolero's sales decline has reduced its share in Mahindra's sales to 17% from 24% in FY2024. The Bolero, sold only with a diesel powertrain, continues to attract buyers in rural areas and Tier 3 cities.</p>\\n  <p><b>9. Hyundai Exter:</b> The Hyundai Exter, the brand's second compact SUV and first CNG model with dual-cylinder technology, sold 77,412 units in FY2025, up 9% year-on-year. Cumulative sales total 148,641 units. The entry-SUV category continues to experience strong demand, with sales of around 20,000 units per month.</p>\\n  <p><b>10. Mahindra Thar 3-door:</b> The 3-door Mahindra Thar sold an estimated 47,000 units, down 28% year-on-year. This decline is attributed to the demand for the five-door Thar Roxx, launched in September 2024, which has already entered the best-selling midsize SUV chart. The Thar brand (3-door and 5-door combined) posted total sales of 84,834 units last year.</p>\\n</div>",
      "keywords": [
        "Tata Punch",
        "Maruti Brezza",
        "Maruti Suzuki Fronx",
        "Tata Nexon",
        "Hyundai Venue",
        "Mahindra 3XO",
        "Kia Sonet",
        "compact SUVs",
        "Indian SUV market",
        "FY2025 sales"
      ],
      "preview": "The Indian SUV market sees compact SUVs leading sales in FY2025, with Tata Punch topping the charts. Maruti Brezza 
    and Fronx follow in the top three, showcasing the popularity of sub-4-meter models in India."
    }
    
    Example Output with missing, malformed, or irrelevant content:
    {
      "article": "",
      "preview": "",
      "keywords": []
    }
    
    Input Content:
    ${content}
    `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: prompt,
    config: config,
  });

  console.log(response.text);
  if (!response.text || response.text === "undefined") return;
  const result = JSON.parse(response.text as string);

  if (!result.article || !result.preview || result.keywords?.length === 0) {
    return;
  }
  console.log(result.article);

  const userData = await getUserId(getWriterName(category));

  const newPostData = {
    content: result.article,
    keywords: result.keywords,
    category: [category],
    image_url: getImageUrlFromArticles(batchedPosts),
    source_type: "auto" as const,
  };

  // Call the heavy, one-time scoring function
  const { initial_score, prominence_score } =
    await calculateInitialScore(newPostData);

  const slugger = new SlugGenerator();
  const post: Partial<IPost> = {
    initial_score,
    prominence_score,
    source_type: "auto",
    title: batch.name,
    slug: slugger.generate(batch.name),
    author_id: userData.id,
    content: result.article,
    description: result.preview,
    image_url: getImageUrlFromArticles(batchedPosts),
    link: `httyd://${generateRandomString(10)}`,
    ttr: calculateReadingTime(result.article),
    category: [category],
    external: false,
    published: true,
    generatedBy: "user",
    keywords: result.keywords,
    source: {
      id: userData.id,
      name: userData.name,
      icon: userData.icon as string,
    },
  };

  // Add review task to the queue, passing the original articles for reference
  queue.addTask(
    "review",
    {
      post: post,
      originalArticles: batch.articles,
    },
    { priority: 1 },
  );

  await ensureDelay(5000);
};

// Stage 3: Review Task Handler
const handleReviewTask = async (task: Task<ReviewTaskData>) => {
  const { post, originalArticles } = task.data;

  console.log("Reviewing post:", post.title);

  // Get the original articles that were used to generate this post
  const originalArticleObjects = await ArticleModel.find({
    _id: { $in: originalArticles.map((a) => newId(a)) },
  })
    .select("title content")
    .exec();

  const originalContent = originalArticleObjects.map(
    (article) => `Title: ${article.title}
Content: ${stripHtml(article.content).result}`,
  ).join(`

----

`);

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string,
  });

  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        article: {
          type: Type.STRING,
        },
        preview: {
          type: Type.STRING,
        },
        keywords: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
        status: {
          type: Type.STRING,
          enum: ["approved", "rejected"],
        },
        feedback: {
          type: Type.STRING,
        },
      },
      required: ["article", "preview", "keywords", "status", "feedback"],
    },
  };

  const prompt = `You are an expert content editor and fact-checker. Your task is to review, correct, and improve a generated news article to ensure it meets high journalistic standards.

# Role & Goal
Act as a meticulous and strict content editor. Your task is to review and CORRECT a generated news article. You should fix any issues you find by default, rather than flagging them for revision. Only reject articles that are completely unsalvageable.

# Input Data
- **Generated Article:** The article content, preview, and keywords provided below under "Generated Article".
- **Title:** ${post.title}
- **Original Source Articles:** The original articles that were used to generate this content, provided below under "Original Source Articles".

# Review Criteria

## Primary Checks
1. **Accuracy:** Does the article accurately reflect the source material without introducing false information?
2. **Coherence:** Is the article logically structured and well-written?
3. **Completeness:** Does the article cover the topic thoroughly?
4. **Relevance:** Is the content relevant to the title and source material?

## Content Quality
1. **Factual Integrity:** No made-up facts, statistics, or quotes.
2. **Logical Flow:** Paragraphs should transition smoothly.
3. **Grammar & Style:** Proper grammar, punctuation, and journalistic style.
4. **HTML Formatting:** Properly formatted HTML with paragraphs enclosed in <p> tags.

## Output Requirements
You must return a JSON object with the following fields:
- "article": The corrected article content (HTML format, properly enclosed in <div> tags with <p> tags for paragraphs)
- "preview": A short, well-formatted preview text (2-3 sentences)
- "keywords": An array of 5-10 relevant keywords
- "status": One of "approved" or "rejected"
- "feedback": A detailed explanation of what you corrected or why you rejected the article

## Decision Guidelines
- **"approved"**: Article has been corrected and meets quality standards. (This should be the default - fix issues rather than flagging them)
- **"rejected"**: Article has major issues or is completely irrelevant and cannot be salvaged.

## Examples

### Example of Corrected Article:
{
  "article": "<div>\n  <p>Major tech companies reported strong quarterly earnings, with Apple leading the pack...</p>\n</div>",
  "preview": "Tech giants posted strong quarterly results, exceeding market expectations with Apple leading the gains.",
  "keywords": ["tech earnings", "quarterly results", "stock market", "Apple"],
  "status": "approved",
  "feedback": "Improved the vagueness by adding specific details about Apple's performance. Enhanced the preview to be more engaging and informative."
}

### Example of Rejected Article:
{
  "article": "",
  "preview": "",
  "keywords": [],
  "status": "rejected",
  "feedback": "The article is completely empty with no content. It cannot be salvaged."
}

# Generated Article:
Title: ${post.title}
Content: ${post.content}
Preview: ${post.description}
Keywords: ${post.keywords?.join(", ")}

# Original Source Articles:
${originalContent}

Review the article thoroughly, correct any issues, and provide your assessment. Remember to fix problems by default rather than flagging them for revision.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: prompt,
      config: config,
    });

    console.log("Review response:", response.text);
    if (!response.text || response.text === "undefined") {
      // If review fails, save the original post
      await PostModel.create([post], { ordered: false });
      return;
    }

    const result = JSON.parse(response.text as string);

    // If the article is approved (corrected), save it
    if (result.status === "approved") {
      // Update the post with corrected content
      const correctedPost = {
        ...post,
        content: result.article,
        description: result.preview,
        keywords: result.keywords,
      };
      
      await PostModel.create([correctedPost], { ordered: false });
      console.log(`Post corrected and saved: ${post.title}. Feedback: ${result.feedback}`);
    } else if (result.status === "rejected") {
      // Log the rejection but don't save the post
      console.log(`Post rejected: ${post.title}. Feedback: ${result.feedback}`);
    }
  } catch (error) {
    console.log(`Error reviewing post: ${error}`);
    // If review fails, save the original post
    await PostModel.create([post], { ordered: false });
  }
};

// Register handlers with the queue
queue.registerHandler("aggregate", handleAggregationTask);
queue.registerHandler("generate", handleGenerationTask);
queue.registerHandler("review", handleReviewTask);

export const startPipeline = async () => {
  try {
    // Add aggregation tasks for each category
    for (const category of categoryMap) {
      queue.addTask(
        "aggregate",
        {
          category: category,
        },
        { priority: 1 },
      );
    }

    // Wait for all tasks to complete
    await queue.waitForCompletion();

    // Revalidate the frontpage cache
    revalidateTag("frontpage");

    console.log("Pipeline completed successfully");
  } catch (error) {
    console.log(`Error in pipeline: ${error}`);
    throw error;
  }
};

// Legacy functions for backward compatibility
export const getBatches = async () => {
  const batchResults: { [key: string]: IBatch[] } = {};

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY as string,
    });

    for (const category of categoryMap) {
      const { title, groups } = category;

      let query = {};
      if (category.title === "Local") {
        query = {
          country: {
            $in: ["Nigeria"],
          },
          category: {
            $in: groups,
          },
        };
      } else {
        query = {
          category: {
            $in: groups,
          },
        };
      }

      const posts = await ArticleModel.find({
        ...query,
        published_at: {
          $gte: new Date(new Date().setHours(new Date().getHours() - 6)),
          $lt: new Date(),
        },
      })
        .select("_id title source slug link")
        .limit(100)
        .exec();

      const postsList = posts.map((post) => post.title).join(" \n");
      console.log(postsList);

      const prompt = `
    # Role & Goal
    Act as a meticulous and strict news analyst. Your task is to analyze a list of news article titles and group them into batches based on specific criteria. Be extremely cautious, detail-oriented, and prioritize accuracy according to the rules below. Double-check your reasoning before finalizing the output.
    
    # Input Data
    - **Article Titles:** A list of news article titles provided under "Article Titles".
    - **Category Context:** All provided articles belong to the category: ${title}. Your analysis should remain within this context.
    
    # Batching Rules & Logic
    
    ## Primary Logic: Event-Based Batching
    1.  **Identify Same Event:** Scrutinize the titles to find groups where **two or more titles** clearly and unambiguously refer to the **exact same specific news event**. This requires more than just a similar topic; look for shared specific details like names, locations, specific actions, or outcomes implied in the titles. A **specific** event or story, not one or more closely or loosely related events.
    2.  **Strict Inclusion:** Be highly conservative. If a title's connection to a specific event batch is uncertain or merely topical, **do not include it** in that batch.
    3.  **Form Event Batches:** Create a distinct batch for each group of 2+ titles identified as covering the same specific event.
    
    ## Fallback Logic: Single Important/Interesting Articles
    4.  **Trigger Condition:** Execute this step **only if** the Primary Logic (steps 1-3) results in **zero** event batches being formed.
    5.  **Select Singles:** From the original list, identify what appear to be the most **significant, impactful, or unique** news article titles based *only* on the information present in the title itself. Prioritize titles suggesting major developments, specific data, or unusual occurrences. This will, of course, be relative.
    6.  **Form Single-Article Batches:** Create a separate batch for **each** selected single article title. Each such batch will contain exactly one article title in its articles array.
    
    # Output Requirements
    
    7.  **Minimum and Maximum Batch Count:** You **must** return a minimum of **one (1) batch, with its corresponding articles array,** and a maximum of **two**, in total, only if articles are provided. If there are none, resort to leaving the values empty or undefined. Do **NOT** return any batches if no articles are provided or attempt to explain your rationale for doing so under any circumstance.
        *   **Scenario A (Sufficient Event Batches):** If the Primary Logic yields 2 or more event batches, return the top two hottest batches only.
        *   **Scenario B (No Event Batches):** If the Fallback Logic (step 4) is triggered, ensure you select and create *at least* one single-article batch according to steps 5 and 6.
        *   **Maximum Batch Count:** You are **not allowed** to return more than **two (2) batches** in total. So, ensure to prioritize sensibly.
    8.  **Batch Naming ("batch" field):
        *   For **event batches**, the name must be a concise, descriptive headline summarizing the specific event covered by the articles in that batch. Tend more towards being sensational and interesting than a dry recap.
        *   For **single-article batches**, the name should be a concise, descriptive headline capturing the essence of that single article's title. It can be a rephrasing or abstraction of the original title. Tend more towards being sensational and interesting than a dry recap.
    
    **Correct for Anomalies:** Ensure you take care of any abnormality, mistake, or error in the synthesized result. If there are any errors, typos, or anomalies, correct them. Do not produce an abnormal output. This includes, but is not limited to, unnaturally long sequences of repeated text/characters, content/output that clearly does not conform to the goals of the request, unnaturally long batch titles, anything but article titles under the articles field, and broken responses too long to fit in your token window.
    **Batch Naming:** Each batch should be sufficiently, but reasonably, unique in its titling - without being overly so. It shouldn't be too generic, broad or vague. It should be specific and meaningful, to stand the test of time, so to speak.
    
    # Example Event Batch for an Example Category Context (Latest Tech News):
    {
     "batch": "New in: Major Biotech Company, BB Biotech AG, Reports Net Loss for Q1 2025",
     "articles": [
     "EQS-Adhoc: BB Biotech AG publishes its interim report",
     "BB Biotech AG Reports CHF 241 Million Net Loss for Q1 2025",
     "BB Biotech AG Reports Net Loss",
     "BB Biotech AG fails to meet expectations in Q1 2025",
     "Major Biotech Company, BB Biotech AG, faces major market challenges"
     ]
    }
    
    # Example Single Article Batch for an Example Category Context (Latest Tech News):
    {
     "batch": "New in: Major Biotech Company, BB Biotech AG, Reports Net Loss for Q1 2025",
     "articles": [
     "Major Biotech Company, BB Biotech AG, faces major market challenges"
     ]
    }
    
    # Category Context Value:
    ${title}
    
    # Article Titles:
    ${postsList}
    `;

      const config = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              batch: { type: Type.STRING },
              articles: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["batch", "articles"],
          },
        },
      };

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-05-20",
        contents: prompt,
        config: config,
      });

      let generated_batches = [];
      try {
        console.log(result.text);
        generated_batches = JSON.parse(result.text as string);
      } catch (error) {
        console.log(`Error parsing response: ${error}`);
        throw error;
      }

      const batches: IBatch[] = [];

      for (const generatedBatch of generated_batches) {
        const { batch, articles } = generatedBatch;
        const batchedArticles: string[] = [];

        if (articles.length <= 0) {
          continue;
        }

        for (const article of articles) {
          const post = posts.find((post) => post.title === article);

          if (post) {
            batchedArticles.push(post._id.toString());
          }
        }

        const newBatch = {
          name: batch,
          articles: batchedArticles,
        };

        batches.push(newBatch);
      }

      if (batches.length === 0) {
        continue;
      }

      batchResults[title] = batches;
    }

    return batchResults;
  } catch (error) {
    console.log(`Error categorizing post: ${error}`);
    throw error;
  }
};

export const handleBatches = async () => {
  try {
    const config = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          article: {
            type: Type.STRING,
          },
          preview: {
            type: Type.STRING,
          },
          keywords: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        },
        required: ["article", "preview", "keywords"],
      },
    };

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY as string,
    });

    const slugger = new SlugGenerator();

    const batches = await getBatches();
    if (Object.keys(batches).length === 0) {
      throw new Error("No batches generated");
    }

    for (const [category, batchArray] of Object.entries(batches)) {
      if (WRITER_DISTRIBUTION[category]?.length === 0) {
        continue;
      }

      const posts: Partial<IPost>[] = [];

      for (const currentBatch of batchArray) {
        const batchedPosts = await ArticleModel.find({
          _id: { $in: currentBatch.articles.map((a) => newId(a)) },
        })
          .select("content image_url")
          .exec();

        const content = batchedPosts
          .map((post) => stripHtml(post.content).result)
          .join("\n----\n");

        const prompt = `Pre: You are an AI assistant tasked with generating structured article content. Be extremely strict, detailed, and cautiously specific. Adhere *precisely* to all instructions, including formatting, content constraints, and conditional logic. Do *not* use any external knowledge or information beyond what is provided in the 'Input Content' section. Recheck your work carefully before responding.
    
    Instructions:
    
    1.  **Analyze Input Content:** Examine the text provided below under 'Input Content'.
    2.  **Handle Empty Input:**
        *   If the 'Input Content' is completely blank, empty, or contains only whitespace, you MUST leave the article, preview and keywords fields empty.
        *   Do not add any other text or explanation if the input is empty.
    3.  **Process Non-Empty Input:**
        *   If the 'Input Content' is not empty, perform the following steps:
            a.  **Synthesize Article:** Carefully read and synthesize the key information from *all* provided article text(s) in the 'Input Content'. Write a *new*, comprehensive, lengthy and coherent article that integrates the main points and themes found *strictly* within the provided text(s). The goal is a detailed synthesis, not just a summary. Ensure logical flow and structure. Format the *entire* synthesized article as HTML. It MUST be enclosed within a single <div> tag. Each paragraph within the article MUST be enclosed within <p> tags. Ensure the HTML is clean and well-formatted (e.g., <p>Paragraph text.</p>). 
            b.  **Generate Preview:** Write a short (2-3 sentences), well formatted, coherent preview text that accurately summarizes the core topic of the synthesized article and entices a reader, like a real news article preview.
            c.  **Extract Keywords:** Identify and list 5-10 relevant keywords or key phrases from the synthesized article that capture its main subjects and themes. Provide these as an array of strings.
            d.  **Correct for Anomalies:** Ensure you take care of any abnormality, mistake, or error in the synthesized article. If there are any errors, typos, or anomalies, correct them. Do not produce an abnormal output. This includes, but is not limited to, unnaturally long sequences of repeated text/characters, content/output that clearly does not conform to the title of the article (in which case, return null), long generated previews, and incomplete responses.
    
    Example Output:
    {
      "article": "<div>\\n  <p>The Indian SUV market is seeing a surge in demand for compact SUVs, with the sub-segment clocking 1.38 
    million units in wholesales in FY2025, a 10% increase year-on-year. This accounts for nearly 50% of the total SUV sales of 2.79 million units, indicating that every second SUV sold in India is a sub-4-meter model. Out of the nearly 100 SUV models available, 
    20 are compact SUVs, with 10 of them leading the charge in the segment.</p>\\n  <p><b>1. Tata Punch:</b> Topping the sales chart for the first time since its launch in October 2021, the Tata Punch recorded 196,572 units, a 15% year-on-year growth. The Punch, 
    available in petrol, CNG, and electric powertrains, has risen two ranks from the previous year. Total domestic sales have crossed 550,000 units since its launch, contributing to 35% of Tata Motors' total passenger vehicle sales in FY2025.</p>\\n  <p><b>2. Maruti Brezza:</b> The Maruti Brezza, a long-standing player in the compact SUV segment, secured second place with 189,163 units, an 11% increase year-on-year. The Brezza has sold a total of 1.24 million units in India since its launch and is available in petrol and CNG powertrains.</p>\\n  <p><b>3. Maruti Suzuki Fronx:</b> The Baleno-based Maruti Fronx reached third place with 166,216 units, a 23% year-on-year growth. The Fronx recorded its best-ever sales in February 2025 and has achieved cumulative sales of 300,951 units since its launch in April 2023, making it the first Nexa SUV to hit the 300,000 milestone.</p>\\n  <p><b>4. Tata Nexon:</b> The Tata Nexon, previously India's top-selling SUV for three consecutive years, experienced a 5% year-on-year decline, selling 163,088 units. Despite the launch of the Nexon CNG, the model has faced increased competition and pressure from its sibling, the Punch.</p>\\n  <p><b>5. Hyundai Venue:</b> The Hyundai Venue also saw a decrease in sales, with 119,113 units sold, down 8% year-on-year. Demand has been flagging, especially with the introduction of the Hyundai Exter. The next-generation Venue is expected 
    to launch by the end of 2025 or early 2026.</p>\\n  <p><b>6. Mahindra 3XO:</b> The Mahindra 3XO has been a strong performer, selling 100,905 units and moving up to sixth place in FY2025. This represents an impressive 84% year-on-year increase. The 3XO's share in Mahindra's SUV sales has risen to 18% from 12% in FY2024.</p>\\n  <p><b>7. Kia Sonet:</b> With sales of 99,805 units, the Kia 
    Sonet recorded a 23% year-on-year growth and is Kia India's best-selling product for the fiscal year. The Sonet surpassed the 400,000 milestone in early February.</p>\\n  <p><b>8. Mahindra Bolero:</b> The Mahindra Bolero brand, including the Bolero, Bolero Neo, and Bolero Neo Plus, sold an estimated 94,750 units, down 15% year-on-year. The Bolero's sales decline has reduced its share in Mahindra's sales to 17% from 24% in FY2024. The Bolero, sold only with a diesel powertrain, continues to attract buyers in rural areas and Tier 3 cities.</p>\\n  <p><b>9. Hyundai Exter:</b> The Hyundai Exter, the brand's second compact SUV and first CNG model with dual-cylinder technology, sold 77,412 units in FY2025, up 9% year-on-year. Cumulative sales total 148,641 units. The entry-SUV category continues to experience strong demand, with sales of around 20,000 units per month.</p>\\n  <p><b>10. Mahindra Thar 3-door:</b> The 3-door Mahindra Thar sold an estimated 47,000 units, down 28% year-on-year. This decline is attributed to the demand for the five-door Thar Roxx, launched in September 2024, which has already entered the best-selling midsize SUV chart. The Thar brand (3-door and 5-door combined) posted total sales of 84,834 units last year.</p>\\n</div>",
      "keywords": [
        "Tata Punch",
        "Maruti Brezza",
        "Maruti Suzuki Fronx",
        "Tata Nexon",
        "Hyundai Venue",
        "Mahindra 3XO",
        "Kia Sonet",
        "compact SUVs",
        "Indian SUV market",
        "FY2025 sales"
      ],
      "preview": "The Indian SUV market sees compact SUVs leading sales in FY2025, with Tata Punch topping the charts. Maruti Brezza 
    and Fronx follow in the top three, showcasing the popularity of sub-4-meter models in India."
    }
    
    Example Output with missing, malformed, or irrelevant content:
    {
      "article": "",
      "preview": "",
      "keywords": []
    }
    
    Input Content:
    ${content}
    `;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-05-20",
          contents: prompt,
          config: config,
        });

        console.log(response.text);
        if (!response.text || response.text === "undefined") continue;
        const result = JSON.parse(response.text as string);

        if (
          !result.article ||
          !result.preview ||
          result.keywords?.length === 0
        ) {
          continue;
        }
        console.log(result.article);

        const userData = await getUserId(getWriterName(category));

        const newPostData = {
          content: result.article,
          keywords: result.keywords,
          category: [category],
          image_url: getImageUrlFromArticles(batchedPosts),
          source_type: "auto" as const,
        };

        // 2. Call the heavy, one-time scoring function
        const { initial_score, prominence_score } =
          await calculateInitialScore(newPostData);

        posts.push({
          initial_score,
          prominence_score,
          source_type: "auto",
          title: currentBatch.name,
          slug: slugger.generate(currentBatch.name),
          author_id: userData.id,
          content: result.article,
          description: result.preview,
          image_url: getImageUrlFromArticles(batchedPosts),
          link: `httyd://${generateRandomString(10)}`,
          ttr: calculateReadingTime(result.article),
          category: [category],
          external: false,
          published: true,
          generatedBy: "user",
          keywords: result.keywords,
          source: {
            id: userData.id,
            name: userData.name,
            icon: userData.icon as string,
          },
        });

        ensureDelay(5000);
      }
      await PostModel.create(posts, { ordered: false });
    }

    revalidateTag("frontpage");
  } catch (error) {
    console.log(`Error categorizing post: ${error}`);
    throw error;
  }
};
