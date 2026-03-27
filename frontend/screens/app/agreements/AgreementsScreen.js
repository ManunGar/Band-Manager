import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useLinkBuilder, useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import InputSearch from '../../../components/InputSearch';
import TopContainer from '../../../components/TopContainer';
import * as GlobalStyle from '../../../GlobalStyle';
import Agreement from './stack/Agreement';

const Tab = createMaterialTopTabNavigator();

const AgreementsScreen = () => {
    return (
        < Tab.Navigator
            tabBar={(props) => <MyTabBar {...props} />}
            screenOptions={{ swipeEnabled: false }}
        >
            <Tab.Screen name="Contratos" component={Agreement} />
            <Tab.Screen name="Músicos" component={Agreement} />
            <Tab.Screen name="Mis Ofertas" component={Agreement} />
            <Tab.Screen name="Solicitudes" component={Agreement} />
        </Tab.Navigator >
    )
}

export default AgreementsScreen

function MyTabBar({ state, descriptors, navigation }) {
    const { buildHref } = useLinkBuilder();
    const navigationScreen = useNavigation();

    return (
        <TopContainer backEnabled={false} editEnabled={false} createEnabled={true} style={{ alignItems: 'left', paddingBottom: 12, marginBottom: 10 }}>
            <View style={{ alignItems: 'flex-start', marginTop: -55, marginLeft: -0 }}>
                <Text style={styles.title}>Ofertas de Contratos</Text>
                <Text style={styles.subtitle}>Aquí podrás gestionar tus acuerdos con otros músicos y bandas.</Text>
            </View>
            <View style={{ marginTop: 20 }} >
                <InputSearch
                    placeholder="Buscar ofertas de contratos" />
            </View>
            <View style={{ width: '100%' }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 20 }}
                    contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}
                >
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const label =
                            options.tabBarLabel !== undefined
                                ? options.tabBarLabel
                                : options.title !== undefined
                                    ? options.title
                                    : route.name;

                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name, route.params);
                            }
                        };

                        const onLongPress = () => {
                            navigation.emit({ type: 'tabLongPress', target: route.key });
                        };

                        return (
                            <Pressable
                                key={route.key}
                                href={buildHref ? buildHref(route.name, route.params) : undefined}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                accessibilityState={isFocused ? { selected: true } : {}}
                                onPress={onPress}
                                onLongPress={onLongPress}
                            >
                                <Text style={{ fontFamily: 'Oswald_500', fontSize: 15, color: isFocused ? GlobalStyle.yellow : GlobalStyle.gray, textTransform: 'uppercase', }}>
                                    {label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>
        </TopContainer>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 34,
        fontFamily: 'BebasNeue',
        color: GlobalStyle.black,
        textAlign: 'left'
    },
    subtitle: {
        fontSize: 14,
        color: 'gray',
        fontFamily: 'Oswald_400',
        marginTop: -5,
        textAlign: 'left'
    }
})