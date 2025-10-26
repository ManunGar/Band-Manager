import Svg, { Path } from "react-native-svg"

function PhoneIcon({ width, height, fill, stroke, strokeWidth }) {
    return (
        <Svg
            width={width || 19}
            height={19}
            viewBox="0 0 19 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <Path
                d="M17.25 12.75c-1.2 0-2.5-.2-3.6-.6h-.3c-.3 0-.5.1-.7.3l-2.2 2.2c-2.8-1.5-5.2-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.4-.5-3.6 0-.5-.5-1-1-1h-3.5c-.5 0-1 .5-1 1 0 9.4 7.6 17 17 17 .5 0 1-.5 1-1v-3.5c0-.5-.5-1-1-1zm-15-10.5h1.5c.1.9.3 1.8.5 2.6l-1.2 1.2c-.4-1.2-.7-2.5-.8-3.8zm14 14c-1.3-.1-2.6-.4-3.8-.8l1.2-1.2c.8.2 1.7.4 2.6.4v1.6z"
                fill={fill || "#8C8C8C"}
                stroke={stroke || "#8C8C8C"}
                strokeWidth={strokeWidth || 0.5}
            />
        </Svg>
    )
}

export default PhoneIcon
