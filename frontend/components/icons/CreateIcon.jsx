import Svg, { Path } from "react-native-svg"

function CreateIcon({width, height, fill, stroke, strokeWidth, onCreate, ...props}) {
  return (
    <Svg
      width={width || 28}
      height={height || 28}
      hitSlop={10}
      viewBox="0 0 31 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onPress={onCreate}
      {...props}
    >
      <Path
        d="M11.792 16.792h-10a1.667 1.667 0 00-1.667 1.666v10a1.666 1.666 0 001.667 1.667h10a1.667 1.667 0 001.666-1.667v-10a1.667 1.667 0 00-1.666-1.666zm-1.667 10H3.458v-6.667h6.667v6.667zM28.458.125h-10a1.667 1.667 0 00-1.666 1.667v10a1.667 1.667 0 001.666 1.666h10a1.667 1.667 0 001.667-1.666v-10A1.667 1.667 0 0028.458.125zm-1.666 10h-6.667V3.458h6.667v6.667zm1.666 11.667h-3.333v-3.334a1.667 1.667 0 00-3.333 0v3.334h-3.334a1.667 1.667 0 000 3.333h3.334v3.333a1.667 1.667 0 103.333 0v-3.333h3.333a1.666 1.666 0 100-3.333zM11.792.125h-10A1.667 1.667 0 00.125 1.792v10a1.667 1.667 0 001.667 1.666h10a1.667 1.667 0 001.666-1.666v-10A1.667 1.667 0 0011.792.125zm-1.667 10H3.458V3.458h6.667v6.667z"
        fill={fill || "#000"}
        stroke={stroke || "#000"}
        strokeWidth={strokeWidth || 0}
      />
    </Svg>
  )
}

export default CreateIcon
