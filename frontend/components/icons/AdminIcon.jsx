import Svg, { Path } from "react-native-svg"

function AdminIcon(props) {
  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 23 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M1.25 11.25c0-5.522 4.478-10 10-10s10 4.478 10 10-4.478 10-10 10-10-4.478-10-10z"
        fill="#F6AB33"
        stroke="#F0F0F0"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.25 7.25l2.222 4 2.778-2.667-1.111 6.667H7.36L6.25 8.583l2.778 2.667 2.222-4z"
        stroke="#F0F0F0"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default AdminIcon