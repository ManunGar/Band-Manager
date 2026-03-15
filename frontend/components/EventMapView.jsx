import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';

const hasNativeMapView = () => {
    if (Platform.OS === 'web') {
        return false;
    }

    const getConfig = UIManager.getViewManagerConfig;
    if (typeof getConfig !== 'function') {
        return false;
    }

    return Boolean(getConfig('AIRMap') || getConfig('AIRGoogleMap'));
};

const EventMapView = ({
    latitude,
    longitude,
    location,
    interactive = false,
    onCoordinateChange,
    mapHeight = 150,
    zoomDelta = 0.01,
}) => {
    const mapRef = useRef(null);
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const [markerCoordinate, setMarkerCoordinate] = useState(
        Number.isFinite(lat) && Number.isFinite(lng)
            ? { latitude: lat, longitude: lng }
            : null,
    );

    useEffect(() => {
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            setMarkerCoordinate({ latitude: lat, longitude: lng });

            // Keep map centered when coordinates change from form input/autocomplete.
            if (mapRef.current) {
                mapRef.current.animateToRegion(
                    {
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: zoomDelta,
                        longitudeDelta: zoomDelta,
                    },
                    350,
                );
            }
        }
    }, [lat, lng, zoomDelta]);

    if (isNaN(lat) || isNaN(lng)) {
        return (
            <View style={[styles.container, { height: mapHeight }]}>
                <Text style={styles.errorText}>Coordenadas inválidas</Text>
            </View>
        );
    }

    const openInGoogleMaps = () => {
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        Linking.openURL(url);
    };

    if (!hasNativeMapView()) {
        return (
            <View style={[styles.container, { height: mapHeight }]}>
                <Text style={styles.errorText}>El modulo nativo del mapa no esta disponible en esta build.</Text>
                <Pressable style={styles.fallbackButton} onPress={openInGoogleMaps}>
                    <Text style={styles.fallbackButtonText}>Abrir en Google Maps</Text>
                </Pressable>
            </View>
        );
    }

    const updateCoordinates = (nextCoordinate) => {
        setMarkerCoordinate(nextCoordinate);
        if (onCoordinateChange) {
            onCoordinateChange(nextCoordinate);
        }
    };

    return (
        <View style={[styles.container, { height: mapHeight }]}>
            <MapView
                ref={mapRef}
                style={[styles.map, { height: mapHeight }]}
                mapType={Platform.OS === 'android' ? 'none' : 'standard'}
                initialRegion={{
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: zoomDelta,
                    longitudeDelta: zoomDelta,
                }}
                scrollEnabled={interactive}
                rotateEnabled={interactive}
                zoomEnabled={interactive}
                pitchEnabled={interactive}
                onPress={(event) => {
                    if (interactive) {
                        updateCoordinates(event.nativeEvent.coordinate);
                        return;
                    }

                    openInGoogleMaps();
                }}
            >
                <UrlTile
                    urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                    maximumZ={20}
                    shouldReplaceMapContent={Platform.OS === 'ios'}
                />
                {markerCoordinate && (
                    <Marker
                        coordinate={markerCoordinate}
                        draggable={interactive}
                        onDragEnd={(event) => updateCoordinates(event.nativeEvent.coordinate)}
                    />
                )}
            </MapView>
            <Text style={styles.attribution}>
                Map tiles by CARTO, data by OpenStreetMap contributors
            </Text>
        </View>
    );
};

export default EventMapView;

const styles = StyleSheet.create({
    container: {
        height: 150,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    map: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#bdc3c7',
    },
    attribution: {
        position: 'absolute',
        bottom: 6,
        right: 8,
        fontSize: 10,
        color: '#444',
        backgroundColor: 'rgba(255,255,255,0.85)',
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    errorText: {
        textAlign: 'center',
        color: '#c0392b',
        fontSize: 14,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    fallbackButton: {
        backgroundColor: '#2d6cdf',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 12,
    },
    fallbackButtonText: {
        color: '#ffffff',
        fontSize: 13,
    },
});
