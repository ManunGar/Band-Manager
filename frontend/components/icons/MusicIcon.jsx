import Svg, { Path } from "react-native-svg"

function MusicIcon({width, height, fill}) {
  return (
    <Svg
      width={width || 20}
      height={height || 20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M19.5.29c.317.254.5.638.5 1.042v12.667c0 1.842-1.792 3.334-4 3.334S12 15.841 12 14c0-1.842 1.792-3.334 4-3.334.467 0 .917.067 1.333.192V5.995L8 8.07v8.596C8 18.508 6.208 20 4 20s-4-1.492-4-3.334c0-1.841 1.792-3.333 4-3.333.467 0 .917.066 1.333.191V4c0-.625.434-1.167 1.046-1.3l12-2.667c.396-.088.808.008 1.125.262L19.5.29z"
        fill={  fill || "#000"}
      />
    </Svg>
  )
}

export default MusicIcon
