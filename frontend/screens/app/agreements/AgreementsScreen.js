import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useLinkBuilder } from '@react-navigation/native';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AgreementFilterSheet from '../../../components/AgreementFilterSheet';
import FilterIcon from '../../../components/icons/FilterIcon';
import InputSearch from '../../../components/InputSearch';
import TopContainer from '../../../components/TopContainer';
import { useAgreementSearch } from '../../../contexts/AgreementSearchContext';
import * as GlobalStyle from '../../../GlobalStyle';
import Agreement from './stack/Agreement';

const Tab = createMaterialTopTabNavigator();

const AgreementsScreen = () => {
    const filterSheetRef = useRef(null);

    return (
        <>
            <Tab.Navigator
                tabBar={(props) => <MyTabBar {...props} onFilterPress={() => filterSheetRef.current?.present()} />}
                screenOptions={{ swipeEnabled: false }}
            >
                <Tab.Screen name="Contratos" component={Agreement} />
                <Tab.Screen name="Músicos" component={Agreement} />
                <Tab.Screen name="Mis Ofertas" component={Agreement} />
                <Tab.Screen name="Solicitudes" component={Agreement} />
            </Tab.Navigator>
            <AgreementFilterSheet sheetRef={filterSheetRef} />
        </>
    )
}

export default AgreementsScreen

function MyTabBar({ state, descriptors, navigation, onFilterPress }) {
    const { buildHref } = useLinkBuilder();
    const { search, setSearch, clearAll } = useAgreementSearch();

    return (
        <TopContainer backEnabled={false} editEnabled={false} createEnabled={false} filterEnabled={true} onFilter={onFilterPress} style={{ alignItems: 'left', paddingBottom: 12, marginBottom: 10 }}>
            <View style={{ alignItems: 'flex-start', marginTop: -55, marginLeft: -0 }}>
                <Text style={styles.title}>Ofertas de Contratos</Text>
                <Text style={styles.subtitle}>Aquí podrás gestionar tus acuerdos con otros músicos y bandas.</Text>
            </View>
            <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' }} >
                <View style={{ flex: 1 }}>
                    <InputSearch
                        placeholder="Buscar ofertas de contratos"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <Pressable onPress={onFilterPress} hitSlop={10}>
                    <FilterIcon />
                </Pressable>
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
                                clearAll();
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