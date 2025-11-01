import { TouchableOpacity } from "react-native"
import Svg, { Path } from "react-native-svg"
import LinkText from "../LinkText"

function SaveIcon({ width, height, stroke, strokeWidth, onSave }) {
    return (
        <TouchableOpacity onPress={onSave} hitSlop={10} style={{ gap:6, flexDirection: 'row', alignContent: 'flex-end', alignItems: 'flex-end' }}>
            <Svg
                width={width || 24}
                height={height || 25}
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <Path
                    d="M16.833 23.083V17.26a1.928 1.928 0 00-.577-1.374 1.965 1.965 0 00-1.392-.566H8.302a1.98 1.98 0 00-1.39.566 1.942 1.942 0 00-.579 1.374v5.824m10.5-21.651v2.887a1.928 1.928 0 01-.577 1.374 1.966 1.966 0 01-1.392.566H8.302a1.982 1.982 0 01-1.39-.566 1.942 1.942 0 01-.579-1.374V1.083m10.5.349a3.989 3.989 0 00-1.63-.349h-8.87m10.5.349c.425.19.817.457 1.154.788l2.943 2.903a3.84 3.84 0 011.154 2.744v11.332a3.85 3.85 0 01-1.155 2.75 3.964 3.964 0 01-2.782 1.135H5.02A3.963 3.963 0 012.24 21.95a3.85 3.85 0 01-1.155-2.75V4.965a3.851 3.851 0 011.155-2.748c.366-.361.8-.647 1.277-.841a3.965 3.965 0 011.505-.293h1.312"
                    stroke={stroke || "#F6AB33"}
                    strokeWidth={strokeWidth || 2.16667}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
            <LinkText style={{ marginBottom: -2 }}>Guardar</LinkText>
        </TouchableOpacity>
    )
}

export default SaveIcon
