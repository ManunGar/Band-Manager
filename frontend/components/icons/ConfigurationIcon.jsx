import Svg, { G, Path } from "react-native-svg";
import * as GlobalStyle from '../../GlobalStyle';

function ConfigurationIcon({ width, height, stroke, strokeWidth }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || 35}
      height={height || 35}
      viewBox="0 0 48 48"
    >
      <G fill="none" stroke={stroke || GlobalStyle.black} strokeLinejoin="round" strokeWidth={strokeWidth || 4}>
        <Path d="M24 4l-6 6h-8v8l-6 6 6 6v8h8l6 6 6-6h8v-8l6-6-6-6v-8h-8z" />
        <Path d="M24 30a6 6 0 100-12 6 6 0 000 12z" />
      </G>
    </Svg>
  )
}

export default ConfigurationIcon
