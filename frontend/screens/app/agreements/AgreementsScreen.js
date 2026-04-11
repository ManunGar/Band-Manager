import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useLinkBuilder } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AgreementFilterSheet from '../../../components/AgreementFilterSheet';
import FilterIcon from '../../../components/icons/FilterIcon';
import InputSearch from '../../../components/InputSearch';
import TopContainer from '../../../components/TopContainer';
import { useAgreementSearch } from '../../../contexts/AgreementSearchContext';
import * as GlobalStyle from '../../../GlobalStyle';
import Agreement from './stack/Agreement';
import Applications from './stack/Applications';
import Musicians from './stack/Musicians';
import MyAgreements from './stack/MyAgreements';

const Tab = createMaterialTopTabNavigator();

const AgreementsScreen = () => {
    const filterSheetRef = useRef(null);
    const [activeRouteName, setActiveRouteName] = useState('Contratos');

    return (
        <>
            <Tab.Navigator
                tabBar={(props) => (
                    <MyTabBar
                        {...props}
                        onFilterPress={() => filterSheetRef.current?.present()}
                        onTabChange={setActiveRouteName}
                    />
                )}
                screenOptions={{ swipeEnabled: false }}
            >
                <Tab.Screen name="Contratos" component={Agreement} />
                <Tab.Screen name="Músicos" component={Musicians} />
                <Tab.Screen name="Mis Ofertas" component={MyAgreements} />
                <Tab.Screen name="Solicitudes" component={Applications} />
            </Tab.Navigator>
            <AgreementFilterSheet sheetRef={filterSheetRef} activeRouteName={activeRouteName} />
        </>
    )
}

export default AgreementsScreen

function MyTabBar({ state, descriptors, navigation, onFilterPress, onTabChange }) {
    const { buildHref } = useLinkBuilder();
    const { search, setSearch, clearAll, startDate, endDate, musicianInstrumentId } = useAgreementSearch();

    const activeRouteName = state.routes[state.index]?.name;

    useEffect(() => {
        onTabChange?.(activeRouteName);
    }, [activeRouteName, onTabChange]);

    const searchPlaceholder = activeRouteName === 'Músicos'
        ? 'Buscar músico por nombre o lugar'
        : 'Buscar ofertas de contratos';

    const hasActiveFilters = useMemo(() => {
        if (activeRouteName === 'Músicos') {
            return musicianInstrumentId !== null;
        }

        return startDate !== null || endDate !== null;
    }, [activeRouteName, musicianInstrumentId, startDate, endDate]);

    return (
        <TopContainer backEnabled={false} editEnabled={false} createEnabled={false} style={{ alignItems: 'left', paddingBottom: 12, marginBottom: 10 }}>
            <View style={{ alignItems: 'flex-start', marginTop: -55, marginLeft: -0 }}>
                <Text style={styles.title}>Ofertas de Contratos</Text>
                <Text style={styles.subtitle}>Aquí podrás gestionar tus acuerdos con otros músicos y bandas.</Text>
            </View>
            <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' }} >
                <View style={{ flex: 1 }}>
                    <InputSearch
                        placeholder={searchPlaceholder}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <Pressable
                    onPress={onFilterPress}
                    hitSlop={10}
                    style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
                >
                    <FilterIcon
                        width={18}
                        height={18}
                        stroke={hasActiveFilters ? GlobalStyle.yellow : GlobalStyle.gray}
                        strokeWidth={2.25}
                    />
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
    },
    filterButton: {
        width: 35,
        height: 35,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterButtonActive: {
        borderColor: GlobalStyle.yellow,
    },
})