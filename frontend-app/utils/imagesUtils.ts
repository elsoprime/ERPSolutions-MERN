/**
 * Autor: Esteban Soto Ojeda @elsoprimeDev
 */

export function getImagePath(imagePath: string) {
    const cloudinaryBaseURL = 'https://res.cloudinary.com';
    const defaultImagePath = '/no-image.webp'; // Ruta predeterminada de la imagen

    if (imagePath.startsWith(cloudinaryBaseURL)) {
        return imagePath;
    } else {
        // Retornamos la ruta de la imagen predeterminada
        return defaultImagePath;
    }
}