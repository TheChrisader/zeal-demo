import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/audio.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/plyr/theme.css";

// import { MediaPlayer, MediaProvider, Poster, Track } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
// import {
//   PlyrLayout,
//   plyrLayoutIcons,
// } from "@vidstack/react/types/vidstack-react.js";

import { MediaPlayer, MediaProvider, Poster } from "@vidstack/react";
import {
  PlyrLayout,
  plyrLayoutIcons,
} from "@vidstack/react/player/layouts/plyr";

interface PlayerProps {
  src: string;
}

const extractVideoId = (url: string): string | undefined => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return "";
};

const Player = ({ src }: PlayerProps) => {
  return (
    <MediaPlayer
      src={src}
      viewType="video"
      streamType="on-demand"
      logLevel="warn"
      crossOrigin
      playsInline
      title="Sprite Fight"
      // poster="https://files.vidstack.io/sprite-fight/poster.webp"
      poster={`https://img.youtube.com/vi_webp/${extractVideoId(src)}/sddefault.webp`}
      className="[&_iframe.vds-youtube[data-no-controls]]:z-20 [&_iframe.vds-youtube[data-no-controls]]:h-auto"
    >
      <MediaProvider>
        <Poster className="vds-poster" />
        {/* {textTracks.map(track => (
      <Track {...track} key={track.src} />
    ))} */}
      </MediaProvider>
      <PlyrLayout icons={plyrLayoutIcons} />
      {/* <DefaultVideoLayout
        // thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
        icons={defaultLayoutIcons}
      /> */}
    </MediaPlayer>
  );
};

export default Player;
