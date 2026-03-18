
import { useMemo } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import * as GlobalStyle from '../GlobalStyle';

export default function EventMapView({
    latitude = 37.3886,
    longitude = -5.9823,
    explorable = true,
    selectable = false,
    mapHeight = 150,
    zoomDelta = 0.01,
    zoom = 15,
    onCoordinateChange,
    onMapTouchStart,
    onMapTouchEnd,
}) {
    // Si se pasa zoomDelta, lo convertimos a un nivel de zoom aproximado
    const zoomLevel = zoomDelta ? Math.round(Math.log2(360 / zoomDelta)) : zoom;
    const html = useMemo(() => `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
            href="https://unpkg.com/maplibre-gl@5.20.2/dist/maplibre-gl.css"
            rel="stylesheet"
        />
        <style>
            html, body, #map {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
            }

            body {
                overflow: hidden;
            }

            #marker {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: ${GlobalStyle.yellow};
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.35);
            }
        </style>
    </head>
    <body>
        <div id="map"></div>

        <script src="https://unpkg.com/maplibre-gl@5.20.2/dist/maplibre-gl.js"></script>
        <script>
            const initialLng = ${longitude};
            const initialLat = ${latitude};

            const map = new maplibregl.Map({
                container: "map",
                style: "https://tiles.openfreemap.org/styles/liberty",
                center: [initialLng, initialLat],
                zoom: ${zoomLevel},
                attributionControl: false,
                dragPan: ${explorable},
                scrollZoom: ${explorable},
                doubleClickZoom: ${explorable},
                touchZoomRotate: ${explorable},
            });

            map.addControl(new maplibregl.NavigationControl(), "top-right");

            const markerEl = document.createElement("div");
            markerEl.id = "marker";

            const marker = new maplibregl.Marker({
                element: markerEl,
                draggable: ${selectable}
            })
                .setLngLat([initialLng, initialLat])
                .addTo(map);

            function sendCoords(lng, lat, source) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    longitude: lng,
                    latitude: lat,
                    source
                }));
            }

            map.on("click", (e) => {
                if (!${selectable}) return;
                const lng = e.lngLat.lng;
                const lat = e.lngLat.lat;
                marker.setLngLat([lng, lat]);
                sendCoords(lng, lat, "map-click");
            });

            if (${selectable}) {
                marker.on("dragend", () => {
                    const pos = marker.getLngLat();
                    sendCoords(pos.lng, pos.lat, "marker-drag");
                });
            }
        </script>
    </body>
</html>
    `, [latitude, longitude, explorable, selectable, zoomLevel]);

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (onCoordinateChange) {
                onCoordinateChange({ latitude: data.latitude, longitude: data.longitude, source: data.source });
            }
        } catch (error) {
            console.warn("Error procesando coordenadas del mapa:", error);
        }
    };

    if (isNaN(latitude) || isNaN(longitude)) {
        return (
            <View style={[styles.container, { height: mapHeight }]}> 
                <Text style={styles.errorText}>Coordenadas inválidas</Text>
            </View>
        );
    }

    const openInGoogleMaps = () => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
            const url = Platform.select({
                ios: `http://maps.apple.com/?ll=${lat},${lng}`,
                android: `geo:${lat},${lng}?q=${lat},${lng}`,
                default: `https://www.google.com/maps?q=${lat},${lng}`
            });
            Linking.openURL(url);
        }
    };

    return (
        <View style={[styles.container, { height: mapHeight }]}> 
            <WebView
                originWhitelist={["*"]}
                source={{ html }}
                onMessage={handleMessage}
                javaScriptEnabled
                domStorageEnabled
                style={styles.webview}
                onTouchStart={onMapTouchStart}
                onTouchEnd={onMapTouchEnd}
            />
            <Text style={styles.attribution}>
                MapLibre + OpenStreetMap
            </Text>
            <Pressable style={styles.mapButton} onPress={openInGoogleMaps} android_ripple={{color:'#e0e0e0'}}>
                <Text style={styles.mapButtonIcon}>📍</Text>
                <Text style={styles.mapButtonText}>Ver en el mapa</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        position: 'relative',
        backgroundColor: '#f8f8f8',
    },
    webview: {
        flex: 1,
        backgroundColor: "transparent",
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
    mapButton: {
        position: 'absolute',
        bottom: 24,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 4,
        paddingHorizontal: 4,
    },
    mapButtonIcon: {
        fontSize: 10,
        marginRight: 6,
    },
    mapButtonText: {
        fontSize: 10,
        color: GlobalStyle.yellow,
    },
    errorText: {
        textAlign: 'center',
        color: '#c0392b',
        fontSize: 14,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
});
