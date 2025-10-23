import Svg, { Path } from "react-native-svg"

function NotificationIcon({width, height, stroke, fill, strokeWidth}) {
  return (
    <Svg
      width={width || 23}
      height={height || 25}
      viewBox="0 0 23 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M11.21 19.369h8.098a1.849 1.849 0 001.798-2.587c-.428-1.294-2.135-2.846-2.135-4.373 0-3.389 0-4.28-1.67-6.274a5.945 5.945 0 00-1.965-1.526l-.931-.452a1.308 1.308 0 01-.608-.868 2.406 2.406 0 00-2.588-2.03 2.406 2.406 0 00-2.521 2.03 1.296 1.296 0 01-.674.868l-.931.452a5.946 5.946 0 00-1.965 1.526C3.449 8.128 3.449 9.02 3.449 12.409c0 1.527-1.629 2.923-2.057 4.295-.258.828-.4 2.665 1.76 2.665h8.057z"
        stroke={stroke || "#000"}
        strokeWidth={strokeWidth || 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.09 19.369a3.805 3.805 0 01-3.88 3.88 3.798 3.798 0 01-3.88-3.88"
        stroke={stroke || "#000"}
        strokeWidth={strokeWidth || 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default NotificationIcon
