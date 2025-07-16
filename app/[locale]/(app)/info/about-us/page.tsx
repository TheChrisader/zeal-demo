import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MindsBehind from "./_components/MindsBehind";

const AboutUs = () => {
  return (
    <div className="prose mx-auto flex flex-col px-3 py-4 lg:max-w-[80vw] [&_h2]:m-0 [&_h3]:m-0 [&_h4]:m-0 [&_strong]:text-primary">
      <Accordion type="multiple" className="w-full" defaultValue={["about-us"]}>
        <AccordionItem value="about-us">
          <AccordionTrigger>
            <h2 className="text-xl font-bold">ABOUT US</h2>
          </AccordionTrigger>
          <AccordionContent className="pl-6">
            <Accordion
              type="multiple"
              className="w-full"
              defaultValue={["who-told-your-story"]}
            >
              <AccordionItem value="who-told-your-story">
                <AccordionTrigger>
                  <h3 className="text-lg font-semibold">
                    Who Told Your Story? Let’s Start There.
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Most African headlines come wrapped in pity, panic, or
                    propaganda. At ZealNews Africa, we said:{" "}
                    <strong>Enough.</strong>
                    We’re here to tell our stories our way — complex, colourful,
                    and unapologetically African. No parachute journalism. No
                    filter. Just raw, refined, radical storytelling for a
                    continent that refuses to be boxed.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="what-is-zealnews">
                <AccordionTrigger>
                  <h3 className="text-lg font-semibold">
                    What Is ZealNews Africa?
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    We’re not your regular news site. We’re a{" "}
                    <strong>media-tech engine</strong>, a{" "}
                    <strong>content lab</strong>, and a{" "}
                    <strong>cultural amplifier</strong> rolled into one.
                  </p>
                  <ul>
                    <li>
                      We <strong>curate what matters.</strong>
                    </li>
                    <li>
                      We <strong>create what’s missing.</strong>
                    </li>
                    <li>
                      We <strong>champion what’s been silenced.</strong>
                    </li>
                  </ul>
                  <p>
                    From the underground churches of Lalibela to the startup
                    streets of Yaba, we hunt down the stories others overlook —
                    then tell them with fire, depth, and dignity.
                    <strong>We don’t break news. We break it open.</strong>
                  </p>
                  <ul>
                    <li>We question the dominant narrative.</li>
                    <li>
                      We explain complex issues without dumbing them down.
                    </li>
                    <li>
                      We platform voices that were never meant to whisper.
                    </li>
                    <li>
                      We connect the dots between Africa and the Diaspora.
                    </li>
                  </ul>
                  <p>
                    You’ll find us everywhere: In long reads and short reels, in
                    infographics and footnotes, in opinion columns and deep
                    dives. We speak Gen Z. We speak Grandma.{" "}
                    <strong>We speak us.</strong>
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="core-beliefs">
                <AccordionTrigger>
                  <h3 className="text-lg font-semibold">Our Core Beliefs</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <h4>● Curiosity is power</h4>
                  <p>
                    We ask better questions — not just &quot;what
                    happened?&quot; but &quot;why does it matter?&quot;
                  </p>
                  <h4>● Truth needs context</h4>
                  <p>
                    Africa isn’t a single story. It’s a billion—layered, lived,
                    and still unfolding.
                  </p>
                  <h4>● Youth aren’t the future. They’re the now.</h4>
                  <p>
                    We spotlight Africa’s new thinkers, coders, disruptors, and
                    everyday geniuses.
                  </p>
                  <h4>● Narratives shape nations</h4>
                  <p>
                    If the world keeps misreading Africa, maybe it’s time we
                    rewrote the script.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="what-we-offer">
                <AccordionTrigger>
                  <h3 className="text-lg font-semibold">What We Offer</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <h4>● Socially Intelligent Journalism</h4>
                  <p>
                    We tackle the real stuff — governance, gender, mental
                    health, innovation, identity — and we do it in a voice you
                    actually want to read.
                  </p>
                  <h4>● The Afro Blazers Series</h4>
                  <p>
                    Profiling boundary-breakers and continent-shapers. If
                    they’re making Africa proud, we’re telling their story.
                  </p>
                  <h4>● Diaspora Connect</h4>
                  <p>
                    Stories that travel. Conversations that return home. We
                    bridge continents and cultures with purpose.
                  </p>
                  <h4>● History, Rewritten</h4>
                  <p>
                    From kingdoms to kinships, we revisit Africa’s past with
                    fresh eyes and fierce love.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="who-we-are-for">
                <AccordionTrigger>
                  <h3 className="text-lg font-semibold">Who We’re For</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    The students. The changemakers. The thinkers. The
                    tired-of-the-same-old readers. The people who know Africa is
                    more than a hashtag — <strong>it’s a heartbeat.</strong>
                    If you’re ready to read, write, question, or contribute,
                    welcome. <strong>You’ve found your tribe.</strong>
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="still-curious">
                <AccordionTrigger>
                  <h3 className="text-lg font-semibold">
                    Still Curious? Good. Stay That Way.
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    We don’t have all the answers. But we ask the right
                    questions — and we invite you to ask with us.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="minds-behind-mission">
          <AccordionTrigger>
            <h2 className="text-xl font-bold">THE MINDS BEHIND THE MISSION</h2>
          </AccordionTrigger>
          <AccordionContent>
            <MindsBehind />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="disclaimer">
          <AccordionTrigger>
            <h2 className="text-xl font-bold">DISCLAIMER</h2>
          </AccordionTrigger>
          <AccordionContent className="pl-6">
            <p>
              At ZealNews Africa, we are committed to telling Africa’s stories
              with <strong>clarity, context, and care.</strong>
              Our platform features a mix of original content, curated insights,
              and multimedia storytelling — designed to inform, inspire, and
              challenge dominant narratives about the continent and its people.
              Please note:
            </p>
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="disclaimer-1">
                <AccordionTrigger>
                  <h4 className="text-lg font-semibold">
                    1. Content Sources &amp; Attribution
                  </h4>
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    ZealNews Africa functions both as a content creator and a
                    content curator:
                  </p>
                  <ul>
                    <li>
                      Some articles are fully original, written by our in-house
                      writers and contributors.
                    </li>
                    <li>
                      Other pieces may include excerpts or summaries of
                      third-party sources. In such cases, we credit original
                      publishers and include proper links.
                    </li>
                    <li>
                      We do not claim ownership of externally sourced content
                      unless explicitly stated.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="disclaimer-2">
                <AccordionTrigger>
                  <h4 className="text-lg font-semibold">
                    2. Opinions Are Not Endorsements
                  </h4>
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Opinions — including op-eds, guest posts, and youth
                    perspectives — reflect the authors’ views, not necessarily
                    those of ZealNews Africa. We value critical thinking and
                    diverse voices.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="disclaimer-3">
                <AccordionTrigger>
                  <h4 className="text-lg font-semibold">
                    3. Accuracy &amp; Updates
                  </h4>
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    We strive for accuracy and verify facts before publishing.
                    Still, news evolves. If you spot an error or
                    misrepresentation, please email{" "}
                    <strong>
                      <a href="mailto:zealnewsafrica@gmail.com">
                        zealnewsafrica@gmail.com
                      </a>
                    </strong>{" "}
                    so we can investigate and update.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="disclaimer-4">
                <AccordionTrigger>
                  <h4 className="text-lg font-semibold">
                    4. No Legal or Professional Advice
                  </h4>
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Unless explicitly stated, our content is for storytelling
                    and general information. It should not be taken as legal,
                    health, financial, or professional advice.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="disclaimer-5">
                <AccordionTrigger>
                  <h4 className="text-lg font-semibold">
                    5. Copyright &amp; Fair Use
                  </h4>
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    All original ZealNews Africa content — text, visuals, video,
                    and branding — is our intellectual property. Reproduction or
                    redistribution is prohibited without written permission.
                    Third-party content is used under fair use or Creative
                    Commons with proper credit.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="questions-concerns">
          <AccordionTrigger>
            <h2 className="text-xl font-bold">Questions or Concerns?</h2>
          </AccordionTrigger>
          <AccordionContent>
            <p>
              We believe in transparency and welcome your feedback.{" "}
              <strong>Contact us:</strong>{" "}
              <a href="mailto:zealnewsafrica@gmail.com">
                zealnewsafrica@gmail.com
              </a>{" "}
              Let’s build a media space rooted in{" "}
              <strong>
                truth, trust, and the zeal to tell our own stories.
              </strong>
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="partnerships">
          <AccordionTrigger>
            <h2 className="text-xl font-bold">Partnerships with Purpose</h2>
          </AccordionTrigger>
          <AccordionContent>
            <p>
              We believe in collaborations that create real impact, not just
              vanity metrics. If you’re working at the intersection of
              storytelling, innovation, social change, or diaspora connection,
              we want to hear from you. We are open to collaborating with:
            </p>
            <ul>
              <li>Media platforms</li>
              <li>NGOs &amp; advocacy groups</li>
              <li>Universities &amp; youth initiatives</li>
              <li>Diaspora networks</li>
              <li>Startups, cultural brands, and tech innovators</li>
            </ul>
            <p>
              Together, we can co-create campaigns, produce narrative-driven
              content, or amplify the work you’re doing across Africa and
              beyond. 📧{" "}
              <a
                href="mailto:zealnewsafrica@gmail.com"
                className="text-primary"
              >
                zealnewsafrica@gmail.com
              </a>{" "}
              Or request our partnership deck. Let’s build something meaningful
              — and make it move.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AboutUs;
