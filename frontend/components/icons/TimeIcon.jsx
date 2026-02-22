import Svg, { Path } from "react-native-svg"

function TimeIcon({width, height, fill, ...props}) {
  return (
    <Svg
      width={width || 20}
      height={height || 20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 20A10 10 0 1010-.001 10 10 0 0010 20zm1.111-16.111a1.111 1.111 0 00-2.222 0v5.833a1.39 1.39 0 001.389 1.39h3.61a1.111 1.111 0 000-2.223h-2.777v-5z"
        fill={fill || "#000"}
      />
    </Svg>
  )
}

export default TimeIcon
