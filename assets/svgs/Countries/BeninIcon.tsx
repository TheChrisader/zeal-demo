const BeninIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_79_47048)">
        <mask
          id="mask0_79_47048"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="-3"
          y="0"
          width="29"
          height="22"
        >
          <path
            d="M-2.00195 0.000976562H25.9992V21.0004H-2.00195V0.000976562Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask0_79_47048)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M-4.84375 0.000976562H9.15682V21.0004H-4.84375V0.000976562Z"
            fill="#319400"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.15723 0.000976562H37.1584V10.5007H9.15723V0.000976562Z"
            fill="#FFD600"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.15723 10.5005H37.1584V21.0002H9.15723V10.5005Z"
            fill="#DE2110"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_79_47048">
          <rect width="28" height="21" fill="white" transform="translate(-2)" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default BeninIcon;
