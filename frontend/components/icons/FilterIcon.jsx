import Svg, { Path } from "react-native-svg"

function FilterIcon({ width, height, stroke, strokeWidth, ...props }) {
  return (
    <Svg
      width={width || 24}
      height={height || 23}
      viewBox="0 0 24 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M22.25 11.25H8.225m-4.95 0H1.25m2.025 0c0-.659.26-1.29.725-1.755a2.471 2.471 0 013.5 0 2.484 2.484 0 010 3.509 2.471 2.471 0 01-3.5 0 2.484 2.484 0 01-.725-1.755zm18.975 7.518h-6.525m0 0c0 .658-.261 1.29-.725 1.755a2.472 2.472 0 01-4.225-1.755m4.95 0c0-.658-.261-1.289-.725-1.754a2.472 2.472 0 00-4.225 1.754m0 0H1.25m21-15.037h-3.525m-4.95 0H1.25m12.525 0c0-.658.26-1.29.725-1.754a2.472 2.472 0 014.036.804 2.485 2.485 0 01-1.34 3.242 2.47 2.47 0 01-2.696-.538 2.484 2.484 0 01-.725-1.754z"
        stroke={stroke || "#111827"}
        strokeWidth={strokeWidth || 2.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
      />
    </Svg>
  )
}

export default FilterIcon
