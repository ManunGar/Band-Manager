import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ExpoImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

// Function to ask for media library permissions
const askLibraryPerm = async () => {
    // Read current permission status
    const current = await ExpoImagePicker.getMediaLibraryPermissionsAsync();
    if (current.granted) return { ok: true, limited: current.accessPrivileges === 'limited' };

    // If we can still ask for it, we do
    const req = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (req.granted) {
        return { ok: true, limited: req.accessPrivileges === 'limited' };
    }
    // Denied
    // On iOS, if it cannot be asked again (user checked "Do not allow"), req.canAskAgain is usually false
    if (!req.canAskAgain) {
        showSettingsAlert('la galería de fotos');
    } else {
        Alert.alert('Permiso requerido', 'Sin acceso a la galería no podemos elegir una imagen.');
    }

    return { ok: false, limited: false };
};

// Function to ask for camera permissions
const askCameraPerm = async () => {
    const current = await ExpoImagePicker.getCameraPermissionsAsync();
    if (current.granted) return true;

    const req = await ExpoImagePicker.requestCameraPermissionsAsync();
    if (req.granted) return true;

    if (!req.canAskAgain) {
        showSettingsAlert('la cámara');
    } else {
        Alert.alert('Permiso requerido', 'Sin acceso a la cámara no podemos tomar una foto.');
    }
    return false;
};

// Function to pick an image from the library
const pickFromLibrary = async () => {
    const { ok } = await askLibraryPerm();
    if (!ok) return null;

    const res = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
        exif: false,
    });
    if (res.canceled) return null;
    return res.assets[0].uri;
};

// Function to take a photo using the camera
const takePhoto = async () => {
    const ok = await askCameraPerm();
    if (!ok) return null;

    const res = await ExpoImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
    });
    if (res.canceled) return null;
    return res.assets[0].uri;
};

// Function to convert an image URI to an uploadable JPEG format
const toUploadableJpeg = async (uri) => {
    const ctx = ImageManipulator.manipulate(uri);
    ctx.resize({ width: 800 }); // Resize to max width of 800px
    const imageRef = await ctx.renderAsync();
    const result = await imageRef.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.75,
    });

    return result.uri;
};

// Function to assert that the image size is less than 3 MB
const assertSizeLT3MB = async (uri) => {
    const file = new File(uri);
    const info = await file.info();

    const max = 3 * 1024 * 1024; // 3 MB
    if (!info.exists) throw new Error('Archivo no encontrado.');
    if (info.size && info.size > max) throw new Error('La imagen supera los 3 MB.');
};

// Function to show an alert directing the user to app settings for permissions
const showSettingsAlert = (featureLabel = 'esta función') => {
    Alert.alert(
        'Permiso requerido',
        `Necesitamos permiso para usar ${featureLabel}. Puedes concederlo desde los Ajustes del dispositivo.`,
        [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
        ]
    );
};

export {
    assertSizeLT3MB, pickFromLibrary,
    takePhoto,
    toUploadableJpeg
};

