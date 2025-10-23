import Svg, { Path } from "react-native-svg";
import * as GlobalStyle from '../../GlobalStyle';

function BackIcon({width, height, ...props}) {
  return (
    <Svg
      width={width || 13}
      height={height || 23}
      viewBox="0 0 13 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M12.503 22.087a1.698 1.698 0 000-2.4l-8.405-8.405 8.405-8.405a1.698 1.698 0 00-2.4-2.4L.496 10.082a1.698 1.698 0 000 2.4l9.605 9.605a1.698 1.698 0 002.4 0z"
        fill={GlobalStyle.black}
      />
    </Svg>
  )
}

export default BackIcon
