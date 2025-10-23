import { TouchableOpacity, View } from 'react-native';
import * as GlobalStyle from '../GlobalStyle';

function MyTabBar({ state, descriptors, navigation }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: GlobalStyle.white,
        height: 64,
        paddingTop: 6,
        paddingBottom: 8,
        paddingHorizontal: 8,
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        shadowOffset: { height: 0 },
        shadowRadius: 0,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        const color = isFocused ? GlobalStyle.yellow : GlobalStyle.blue;
        const size = 26;
        const isCenter = index === Math.floor(state.routes.length / 2);

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.8}
          >
            {options.tabBarIcon
              ? options.tabBarIcon({ color, size, focused: isFocused })
              : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default MyTabBar;
