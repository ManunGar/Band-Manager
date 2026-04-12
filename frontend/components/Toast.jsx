import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as GlobalStyle from '../GlobalStyle';

const TOAST_CONFIG = {
    success: { accent: GlobalStyle.green, label: '✓' },
    error: { accent: GlobalStyle.red, label: '!' },
    info: { accent: GlobalStyle.yellow, label: 'i' },
    warning: { accent: '#F59E0B', label: '⚠' },
};

const Toast = ({ title, message, type = 'info', onClose }) => {
    const config = TOAST_CONFIG[type] ?? TOAST_CONFIG.info;
    const translateY = useRef(new Animated.Value(-150)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 70,
                friction: 11,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const dismiss = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -150,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onClose?.());
    };

    return (
        <Animated.View
            style={[styles.wrapper, { transform: [{ translateY }], opacity }]}
            pointerEvents="box-none"
        >
            <View style={[styles.card, { borderLeftColor: config.accent }]}>
                {/* <View style={[styles.iconBadge, { backgroundColor: config.accent }]}>
                    <Text style={styles.iconLabel}>{config.label}</Text>
                </View> */}
                <View style={styles.textArea}>
                    <Text style={styles.title} numberOfLines={2}>{title}</Text>
                    {!!message && (
                        <Text style={styles.message} numberOfLines={3}>{message}</Text>
                    )}
                </View>
                <TouchableOpacity
                    onPress={dismiss}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.closeBtn}
                >
                    <Text style={styles.closeLabel}>✕</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        top: 12,
        left: 14,
        right: 14,
        zIndex: 9999,
        elevation: 12,
    },
    card: {
        backgroundColor: GlobalStyle.lightBackground,
        borderRadius: 6,
        borderLeftWidth: 4,
        paddingVertical: 14,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
        elevation: 12,
    },
    iconBadge: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    iconLabel: {
        color: GlobalStyle.white,
        fontSize: 14,
        fontWeight: '800',
    },
    textArea: {
        flex: 1,
    },
    title: {
        color: GlobalStyle.black,
        fontFamily: 'BebasNeue',
        fontSize: 17,
        letterSpacing: 0.4,
    },
    message: {
        color: GlobalStyle.darkGray,
        fontFamily: 'Oswald_400',
        fontSize: 13,
        marginTop: 2,
        lineHeight: 18,
    },
    closeBtn: {
        paddingLeft: 4,
        flexShrink: 0,
    },
    closeLabel: {
        color: '#6B7A99',
        fontSize: 13,
        fontWeight: '700',
    },
});

export default Toast;
