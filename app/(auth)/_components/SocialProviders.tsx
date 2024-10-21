import SocialProvider from "./SocialProvider";
import { SVG_LIST } from "../_utils/svgs";

const SocialProviders = () => {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="flex gap-6">
        {Object.keys(SVG_LIST).map((title) => (
          <SocialProvider
            key={title}
            name={title.toLowerCase()}
            Icon={SVG_LIST[title]!}
          >
            {title}
          </SocialProvider>
        ))}
      </div>
    </div>
  );
};

export default SocialProviders;
