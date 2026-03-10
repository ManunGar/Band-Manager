import Svg, { Path } from "react-native-svg"

function RightArrowIcon({width, height, fill, stroke, strokeWidth}, props) {
  return (
    <Svg
      width={width || 13}
      height={height || 23}
      viewBox="0 0 13 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M.497.497a1.698 1.698 0 000 2.4l8.405 8.405-8.405 8.405a1.698 1.698 0 002.4 2.4l9.606-9.604a1.698 1.698 0 000-2.4L2.898.496a1.698 1.698 0 00-2.4 0z"
        fill={fill || "#000"}
      />
    </Svg>
  )
}

export default RightArrowIcon
