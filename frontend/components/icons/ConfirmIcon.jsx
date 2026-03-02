import Svg, { Path } from "react-native-svg"

function ConfirmIcon({ width, height, stroke, strokeWidth }, props) {
  return (
    <Svg
      width={width || 21}
      height={height || 21}
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M1.25 10.25a9 9 0 1118.001.001A9 9 0 011.25 10.25z"
        stroke={stroke || "#6A8669"}
        strokeWidth={strokeWidth || 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.25 10.25l3 3 5-5"
        stroke={stroke || "#6A8669"}
        strokeWidth={strokeWidth || 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default ConfirmIcon
