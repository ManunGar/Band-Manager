import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ExpoImagePicker from 'expo-image-picker';

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
        return {
            ok: false,
            limited: false,
            needsSettings: true,
            message: 'Necesitamos permiso para usar la galería de fotos. Puedes concederlo desde los Ajustes del dispositivo.',
        };
    }

    return {
        ok: false,
        limited: false,
        needsSettings: false,
        message: 'Sin acceso a la galería no podemos elegir una imagen.',
    };
};

// Function to ask for camera permissions
const askCameraPerm = async () => {
    const current = await ExpoImagePicker.getCameraPermissionsAsync();
    if (current.granted) return { ok: true };

    const req = await ExpoImagePicker.requestCameraPermissionsAsync();
    if (req.granted) return { ok: true };

    if (!req.canAskAgain) {
        return {
            ok: false,
            needsSettings: true,
            message: 'Necesitamos permiso para usar la cámara. Puedes concederlo desde los Ajustes del dispositivo.',
        };
    }

    return {
        ok: false,
        needsSettings: false,
        message: 'Sin acceso a la cámara no podemos tomar una foto.',
    };
};

// Function to pick an image from the library
const pickFromLibrary = async (aspect = [1, 1], onPermissionDenied = null) => {
    const { ok, message, needsSettings } = await askLibraryPerm();
    if (!ok) {
        if (message) onPermissionDenied?.({ message, needsSettings: Boolean(needsSettings) });
        return null;
    }

    const res = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: aspect,
        quality: 0.9,
        exif: false,
    });
    if (res.canceled) return null;
    return res.assets[0].uri;
};

// Function to take a photo using the camera
const takePhoto = async (aspect = [1, 1], onPermissionDenied = null) => {
    const { ok, message, needsSettings } = await askCameraPerm();
    if (!ok) {
        if (message) onPermissionDenied?.({ message, needsSettings: Boolean(needsSettings) });
        return null;
    }

    const res = await ExpoImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: aspect,
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

export {
    assertSizeLT3MB, pickFromLibrary,
    takePhoto,
    toUploadableJpeg
};

