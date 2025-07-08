import { NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";

const slugs = [
  "from-hashtags-to-headlines-the-youth-powering-global-digital-activism-ZxVkK",
  "is-the-boy-child-the-new-victim-of-feminism-sgxum",
  "racism-didn-t-skip-us-we-just-learned-to-call-it-something-else-rDLRK",
  "telling-better-stories-how-to-talk-to-africa-with-respect-CGEcx",
  "10-nigerian-markets-every-food-lover-needs-to-visit-MDO0E",
  "how-ankara-came-to-africa-a-tapestry-of-trade-khuSD",
  "who-protects-us-from-the-police-lM9CA",
  "ojude-oba-where-fashion-culture-and-vibes-meet-d2HP4",
  "oxana-malaya-the-girl-raised-by-dogs-Vkas8",
  "top-6-memorable-locations-to-visit-in-nigeria-QQSot",
  "monday-muse-richard-gakonga-painting-kenya-s-soul-in-colour-1IFqx",
  "hot-oil-loud-streets-the-real-stories-behind-african-street-food-IyxJo",
  "understanding-africa-s-place-in-the-global-hardware-industry-FiM5f",
  "the-mesmerizing-world-of-yinka-shonibare-s-art-GL38F",
  "everything-you-need-to-know-about-nigerian-idol-OUA18",
  "ngugi-wa-thiong-o-a-name-history-won-t-erase-PGBHC",
  "the-teen-who-built-a-30m-startup-and-still-got-rejected-by-ivy-league-EGmw2",
  "african-female-stance-on-heritage-whose-legacy-is-it-anyway-nOVPz",
  "the-rise-of-ai-in-nigeria-friend-foe-or-both-XOJsK",
  "returning-home-stories-nigerians-who-returned-home-to-build-business-5hfnm",
  "how-kevin-o-leary-lost-750k-backing-a-friend-and-what-you-can-learn-qrfj1",
  "african-tattoos-and-scarification-ancient-ink-living-identity-LTPhZ",
  "the-greatest-tech-what-if-how-google-s-1-million-deal-could-have-5mRi2",
  "is-nigeria-ready-for-a-cashless-society-6Ro5A",
  "protein-poverty-in-nigeria-hunger-beyond-the-stomach-pkE8K",
  "magic-in-the-kitchen-ai-tools-that-ll-change-how-you-eat-and-cook-KlmRZ",
  "back-to-the-roots-ancient-african-hygiene-practices-and-the-modern-ickhW",
  "from-air-mattresses-to-a-global-empire-the-dramatic-rise-of-airbnb-wUMbK",
  "sole-stories-the-rise-of-indigenous-shoe-brands-in-nigeria-qNUcR",
  "the-evolution-of-african-hairstyles-from-crowns-to-cornrows-wkF8G",
  "the-guy-who-sold-an-invisible-sculpture-for-18-000-Y729E",
  "bride-price-debate-tradition-or-transaction-SVfUq",
  "how-two-cameroonian-sisters-took-back-their-50million-business-after-7klk1",
  "when-a-typo-cost-250-million-the-mizuho-trade-disaster-tEw3G",
  "meet-the-woman-whose-body-can-t-feel-pain-or-fear-0zaq2",
  "scientific-breakthroughs-the-woman-who-can-smell-cancer-parkinsons-HmJZT",
  "thebe-medupe-and-africa-s-astronomical-heritage-mapping-the-stars-sql7O",
  "the-doors-of-no-return-in-ghana-a-symbol-of-tragedy-and-resilience-Tym5x",
  "jobs-of-tomorrow-7-careers-that-will-exist-soon-r0mBY",
  "trump-reinstates-travel-ban-on-nationals-from-12-countries-amid-A6AqP",
  "ai-didn-t-steal-your-job-but-this-mindset-might-jUHK6",
  "5-thrilling-hangouts-for-sport-and-gaming-lovers-in-nigeria-and-ghana-g5lN3",
  "nigeria-s-maternal-mortality-crisis-examining-the-numbers-behind-the-sd5O2",
  "a-rollercoaster-friendship-the-timelines-of-elon-musk-and-donald-SkRrh",
  "meet-valerie-moran-one-of-the-richest-black-women-in-the-uk-KFmiJ",
  "africa-s-own-titanic-story-the-forgotten-tragedy-of-mv-bukoba-7sG3e",
  "remote-work-is-here-to-stay-but-are-african-countries-ready-PjRml",
  "meet-the-blue-people-of-kentucky-rXIN2",
  "what-happens-to-degrees-in-a-world-full-of-skills-YO3kv",
  "japan-s-artificial-blood-a-transformation-for-transfusion-medicine-pnZZh",
  "stolen-the-ironic-true-story-of-the-mona-lisa-s-first-disappearance-1V0IO",
  "connecting-africa-the-trans-saharan-trade-route-that-took-months-to-6tXxp",
  "the-great-emu-war-when-australia-went-to-war-with-birds-and-lost-c9vL4",
  "the-cadaver-synod-when-a-dead-pope-was-put-on-trial-6iDGG",
  "unusual-beauty-standards-in-africa-when-beauty-breaks-the-western-JfBR7",
  "5-nigerian-hangouts-for-art-and-creativity-loversuntitled-document-fZPsY",
  "must-knows-work-visa-and-trade-opportunities-within-africa-raDMQ",
  "beyond-belief-when-an-entire-town-couldn-t-stop-dancing-for-days-DfsEX",
  "plans-beyond-oil-the-foundations-for-diversifying-nigeria-s-economy-6ZS5e",
  "8-nigerian-cities-with-the-fastest-internet-irERF",
  "6-nigerian-social-media-moments-that-broke-the-internet-gvvhF",
  "gen-z-and-african-politics-are-they-really-changing-the-game-JSKIF",
  "democracy-or-them-o-crazy-asking-for-a-country-4a9VW",
  "bridging-the-gap-how-the-nigerian-diaspora-can-influence-change-at-eMUz4",
  "the-dollar-excuse-nigerians-favourite-scapegoat-KaJot",
  "afrobeats-to-the-world-the-economic-impact-of-nigerian-music-globally-kbKGx",
  "from-hashtags-to-headlines-the-youth-powering-global-digital-activism-ZxVkK",
  "do-you-know-mark-zuckerberg-is-colour-blind-and-that-s-why-facebook-q2fGQ",
  "the-igbo-apprentice-system-africa-s-billion-dollar-training-model-kZBlQ",
  "africa-s-greatest-what-if-when-a-continent-tried-to-become-a-country-ZNm25",
  "earth-s-secrets-part-1-the-submerged-city-beneath-lake-bosumtwi-ghana-c68Es",
  "earth-s-secrets-part-2-the-11-underground-churches-of-lalibela-africa-khLyZ",
  "earth-s-secrets-part-3-the-lake-that-turns-animals-to-stone-aEeK5",
  "from-home-to-harvard-how-african-students-are-shaping-the-future-7MZQT",
  "the-effect-of-different-colors-on-our-mental-health-DUlUd",
  "the-rotten-mold-that-saved-millions-how-alexander-fleming-s-mess-utsZ5",
  "historical-legends-part-1-alhassan-dantata-the-great-grandfather-of-f4WaA",
  "exploring-africa-on-a-budget-five-affordable-travel-destinations-gqL5m",
  "ethiopia-vs-the-world-why-ethiopia-is-still-in-2017-aR4yK",
  "bridging-the-gap-how-diaspora-doctors-are-rewriting-african-3bttX",
  "who-owns-africa-s-data-NcF9W",
  "the-pet-rock-how-a-simple-stone-was-bought-by-millions-gyPsI",
  "why-do-the-yorubas-have-so-many-twins-sT0Hn",
  "earth-s-secrets-part-3-the-eye-of-the-sahara-africa-s-great-8c8ug",
  "living-alone-in-africa-the-silent-revolution-among-young-women-FgIvS",
  "the-whistling-language-how-some-african-tribes-speak-without-words-z1wyf",
  "5-times-african-women-changed-laws-just-by-speaking-up-LzPxt",
  "why-ken-saro-wiwa-was-executed-8g4K7",
  "sisters-in-revolt-a-continent-wide-history-of-women-led-protests-in-ylHp9",
  "cabo-verde-the-african-nation-that-defeated-malaria-lAHdt",
  "the-hidden-beaches-of-sao-tome-unveiling-africa-s-secret-paradise-1NNWs",
  "the-brain-s-balancing-act-the-suspenseful-psychology-of-code-bRdm7",
  "mwape-chimpampa-the-15-year-old-zambian-girl-who-invented-life-saving-f6Yxi",
  "capturing-wind-the-journey-of-william-kamkwamba-Ani2u",
  "the-seven-rarest-genetic-conditions-in-the-world-when-dna-rewrites-tJUXf",
  "the-beauty-of-jos-that-once-was-57EUV",
  "6-countries-where-surrogacy-is-illegal-and-why-africa-must-act-53IoK",
  "chief-owolabi-salis-become-the-first-nigerian-in-space-lVvuP",
  "we-don-t-cry-here-african-men-and-the-loneliness-no-one-talks-about-c9yHZ",
  "zeal-monday-reset-lessons-from-the-desert-flower-AYO51",
  "bright-glowing-unveiling-the-new-disguise-of-skin-bleaching-UjuFw",
];

export const POST = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    const result = await PostModel.updateMany(
      { slug: { $in: slugs } }, // Match any post with these slugs
      {
        $addToSet: {
          category: "Social Insight", // $addToSet ensures no duplicates
        },
      },
    );

    console.log(`Successfully updated ${result.modifiedCount} documents.`);

    console.log("Content update process completed");
    return NextResponse.json({
      message: `Successfully updated ${result.modifiedCount} posts`,
    });
  } catch (error) {
    console.error("Error updating posts:", error);
    return NextResponse.json(
      { message: "Error updating posts" },
      { status: 500 },
    );
  }
};
