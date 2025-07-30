import { Play } from "lucide-react";
import React from "react";

interface VideoPosterProps {
  src: string;
  logo?: React.ReactNode;
  title: string;
  onClick?: () => void;
  className?: string;
}

const VideoPoster: React.FC<VideoPosterProps> = ({
  src,
  logo,
  title,
  onClick,
  className = "",
}) => {
  return (
    <div
      className={`group relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg bg-black ${className}`}
      onClick={onClick}
    >
      <img
        src={src}
        alt={title}
        className="absolute inset-0 size-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      <div className="absolute left-4 top-4 z-10 flex items-center space-x-3">
        {logo && (
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white p-1 text-white drop-shadow-lg md:size-12">
            {logo}
          </div>
        )}
        <h3 className="line-clamp-1 text-lg font-semibold text-white drop-shadow-lg">
          {title}
        </h3>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/50 shadow-2xl transition-all duration-200 hover:bg-red-700 group-hover:scale-110">
          <Play className="ml-1 size-8 text-white" fill="currentColor" />
        </div>
      </div>

      <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </div>
  );
};

export default VideoPoster;
