import Svg, { Path } from "react-native-svg"

function AgreementIcon({width, height, stroke, fill, strokeWidth}) {
  return (
    <Svg
      width={width || 21}
      height={height || 25}
      viewBox="0 0 21 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M17.75 1.25H2.35a1.1 1.1 0 00-1.1 1.1v19.8a1.1 1.1 0 001.1 1.1h15.4a1.1 1.1 0 001.1-1.1V2.35a1.1 1.1 0 00-1.1-1.1z"
        stroke={stroke || "#000"}
        strokeWidth={strokeWidth || 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.65 1.25h4.95v8.8l-2.475-2.2-2.475 2.2v-8.8z"
        stroke={stroke || "#000"}
        strokeWidth={strokeWidth || 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.65 14.45h5.5m-5.5 3.3h8.8"
        stroke={stroke || "#000"}
        strokeWidth={strokeWidth || 2.5}
        strokeLinecap="round"
      />
    </Svg>
  )
}

export default AgreementIcon
