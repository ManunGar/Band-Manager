import Svg, { Path } from "react-native-svg";
import * as GlobalStyle from '../../GlobalStyle';

function SvgComponent({width, height, ...props}) {
  return (
    <Svg
      width={width || 33}
      height={height || 33}
      viewBox="0 0 33 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M6.794 8.559H5.03a3.53 3.53 0 00-3.529 3.53V27.97A3.53 3.53 0 005.03 31.5h15.882a3.53 3.53 0 003.529-3.53v-1.764"
        stroke={GlobalStyle.black}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22.676 5.03l5.294 5.294m2.445-2.497a3.706 3.706 0 00-5.242-5.242l-14.85 14.797v5.294h5.295l14.796-14.85z"
        stroke={GlobalStyle.black}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default SvgComponent
