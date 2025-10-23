import Svg, { Path } from "react-native-svg"

function AccountIcon({width, height, stroke, fill, strokeWidth}) {
  return (
    <Svg
      width={width || 23}
      height={height || 25}
      viewBox="0 0 23 25"
      fill={fill || "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M1.25 20.5c0-1.459.538-2.858 1.496-3.89C3.704 15.58 5.003 15 6.357 15h10.214c1.355 0 2.654.58 3.612 1.61.957 1.032 1.496 2.431 1.496 3.89 0 .73-.27 1.429-.748 1.945a2.464 2.464 0 01-1.806.805H3.804c-.678 0-1.327-.29-1.806-.805A2.86 2.86 0 011.25 20.5z"
        stroke={stroke || "#000"}
        strokeWidth={strokeWidth || 2.6}
        strokeLinejoin="round"
      />
      <Path
        d="M11.464 9.5c2.116 0 3.83-1.847 3.83-4.125S13.58 1.25 11.465 1.25c-2.115 0-3.83 1.847-3.83 4.125S9.349 9.5 11.464 9.5z"
        stroke={stroke || "#000"}
        strokeWidth={strokeWidth || 2.6}
      />
    </Svg>
  )
}

export default AccountIcon
