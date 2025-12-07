import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useLinkBuilder } from '@react-navigation/native';
import { useContext } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import bandDefaultImage from '../../../assets/milestones/band_default.png';
import TopContainer from '../../../components/TopContainer';
import { AuthContext } from '../../../contexts/AuthContext';
import * as GlobalStyle from '../../../GlobalStyle';
import Index from './stack/Index';
import Performances from './stack/Performances';
import Rehearsal from './stack/Rehearsal';
import Repertoire from './stack/Repertoire';

const Tab = createMaterialTopTabNavigator();

const BandScreen = ({ route }) => {
    const { band } = route.params;

    return (
        < Tab.Navigator tabBar={(props) => <MyTabBar {...props} band={band} />} >
            <Tab.Screen name="Inicio" component={Index} initialParams={{ bandId: band?.id }} />
            <Tab.Screen name="Actuaciones" component={Performances} />
            <Tab.Screen name="Ensayos" component={Rehearsal} initialParams={{ bandId: band?.id }} />
            <Tab.Screen name="Repertorio" component={Repertoire} initialParams={{ bandId: band?.id }} />
        </Tab.Navigator >
    )
}

function MyTabBar({ state, descriptors, navigation, band }) {
    const { buildHref } = useLinkBuilder();
    const { user } = useContext(AuthContext);
    const isAdmin = band?.components?.some(component => component.musicianId === user?.musician?.id && component.administrator) ?? false;

    return (
        <TopContainer
            editEnabled={isAdmin}
            createEnabled={isAdmin}
            style={{ paddingTop: 5, paddingBottom: 13 }}>
            <Image source={band?.profile_picture ? { uri: band.profile_picture } : bandDefaultImage} style={{ width: 70, height: 70 }} />
            <Text style={{ fontSize: 26, fontFamily: 'BebasNeue', marginTop: 5 }}>
                {band?.name}
            </Text>
            <Text style={{ fontSize: 12, fontFamily: 'Oswald_500', color: GlobalStyle.yellow, textTransform: 'uppercase', textAlign: 'center' }}>
                {band?.type}
            </Text>
            <View style={{ width: '100%' }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 20}}
                    contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}
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
                                <Text style={{ fontFamily: 'Oswald_500', fontSize: 16, color: isFocused? GlobalStyle.yellow : GlobalStyle.gray, textTransform: 'uppercase', }}>
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

export default BandScreen