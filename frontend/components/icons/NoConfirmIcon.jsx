import Svg, { Path } from "react-native-svg"

function NoConfirmIcon({ width, height, stroke, strokeWidth, fill }, props) {
  return (
    <Svg
      width={width || 21}
      height={height || 21}
      viewBox="0 0 21 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M10.21.125c5.57 0 10.085 4.515 10.085 10.085 0 5.57-4.515 10.085-10.085 10.085C4.64 20.296.125 15.78.125 10.21.125 4.64 4.64.125 10.21.125zm0 2.017a8.068 8.068 0 100 16.136 8.068 8.068 0 000-16.136zm0 12.102a1.008 1.008 0 110 2.017 1.008 1.008 0 010-2.017zm0-9.58a3.656 3.656 0 011.36 7.049.806.806 0 00-.308.203c-.044.05-.051.115-.05.181l.007.13a1.008 1.008 0 01-2.01.118l-.007-.118v-.252c0-1.163.938-1.86 1.617-2.134A1.64 1.64 0 108.571 8.32a1.009 1.009 0 01-2.017 0 3.656 3.656 0 013.656-3.656z"
        fill={fill || "#8C8C8C"}
        stroke={stroke || "#8C8C8C"}
        strokeWidth={strokeWidth || 0.25}
      />
    </Svg>
  )
}

export default NoConfirmIcon
