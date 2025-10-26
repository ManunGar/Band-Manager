import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ExpoImagePicker from 'expo-image-picker';

const askLibraryPerm = async () => {
    const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
};

const askCameraPerm = async () => {
    const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
};

const pickFromLibrary = async () => {
    const ok = await askLibraryPerm();
    if (!ok) return null;

    const res = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // recorte cuadrado
        quality: 0.9,
        exif: false,
    });
    if (res.canceled) return null;
    return res.assets[0].uri;
};

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

const toUploadableJpeg = async (uri) => {
    const ctx = ImageManipulator.manipulate(uri);
    ctx.resize({ width: 800 });
    const imageRef = await ctx.renderAsync();
    const result = await imageRef.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.75,
    });

    return result.uri;
};

const assertSizeLT3MB = async (uri) => {
    const file = new File(uri);
    const info = await file.info();

    const max = 3 * 1024 * 1024; // 3 MB
    if (!info.exists) throw new Error('Archivo no encontrado.');
    if (info.size && info.size > max) throw new Error('La imagen supera los 3 MB.');
};

export {
    assertSizeLT3MB, pickFromLibrary,
    takePhoto,
    toUploadableJpeg
};
