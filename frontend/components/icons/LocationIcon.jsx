import Svg, { Path } from "react-native-svg"

function LocationIcon({width, height, fill}) {
  return (
    <Svg
      width={width || 13}
      height={height || 18}
      viewBox="0 0 13 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M6.5 8.55a2.36 2.36 0 01-1.641-.659 2.215 2.215 0 01-.68-1.591c0-.597.244-1.169.68-1.591A2.36 2.36 0 016.5 4.05a2.36 2.36 0 011.642.659c.435.422.68.994.68 1.591 0 .295-.06.588-.177.861a2.247 2.247 0 01-.503.73 2.328 2.328 0 01-.754.488 2.386 2.386 0 01-.888.171zM6.5 0a6.606 6.606 0 00-4.596 1.845A6.203 6.203 0 000 6.3C0 11.025 6.5 18 6.5 18S13 11.025 13 6.3c0-1.67-.685-3.273-1.904-4.455A6.606 6.606 0 006.5 0z"
        fill={fill || "#8C8C8C"}
      />
    </Svg>
  )
}

export default LocationIcon
