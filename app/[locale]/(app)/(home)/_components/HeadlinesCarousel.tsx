import useEmblaCarousel, { UseEmblaCarouselType } from "embla-carousel-react";
import { ComponentPropsWithRef, useCallback, useEffect, useState } from "react";
// import { useMediaQuery } from "react-responsive";

type UseDotButtonType = {
  selectedIndex: number;
  scrollSnaps: number[];
  onDotButtonClick: (index: number) => void;
};

export const useDotButton = (
  emblaApi: UseEmblaCarouselType[1] | undefined,
): UseDotButtonType => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onDotButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const onInit = useCallback((emblaApi: UseEmblaCarouselType[1]) => {
    setScrollSnaps(emblaApi!.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: UseEmblaCarouselType[1]) => {
    setSelectedIndex(emblaApi!.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit).on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  return {
    selectedIndex,
    scrollSnaps,
    onDotButtonClick,
  };
};

type PropType = ComponentPropsWithRef<"button">;

export const DotButton: React.FC<PropType> = (props) => {
  const { children, ...restProps } = props;

  return (
    <button type="button" {...restProps}>
      {children}
    </button>
  );
};

export default function HeadlinesCarousel({
  children,
  timer = 5000,
  hideSnaps = false,
}: {
  children: React.ReactNode;
  timer?: number;
  hideSnaps?: boolean;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
  });

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.reInit();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, timer);

    return () => clearInterval(interval);
  });

  return (
    <div className="w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">{children}</div>
      </div>
      <div className="embla__dots">
        {!hideSnaps &&
          scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={`embla__dot ${index === selectedIndex ? "embla__dot--selected" : ""}`}
            />
          ))}
      </div>
    </div>
  );
}
