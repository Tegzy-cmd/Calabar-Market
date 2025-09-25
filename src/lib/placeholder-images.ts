
import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const placeholderImages: ImagePlaceholder[] = data.placeholderImages;

const defaultImage = placeholderImages.find(p => p.id === 'hero-image-1')!;

if (!defaultImage) {
    throw new Error('The default placeholder image (hero-image-1) is missing from placeholder-images.json');
}

/**
 * Safely gets a placeholder image URL by its ID.
 * If the ID is not found, it returns the URL of a default fallback image.
 * @param id The ID of the placeholder image to retrieve.
 * @returns The URL of the image.
 */
export function getPlaceholderImage(id: string): string {
    const image = placeholderImages.find(p => p.id === id);
    return image ? image.imageUrl : defaultImage.imageUrl;
}

/**
 * Safely gets a full placeholder image object by its ID.
 * If the ID is not found, it returns the default fallback image object.
 * @param id The ID of the placeholder image object to retrieve.
 * @returns The ImagePlaceholder object.
 */
export function getPlaceholderImageObject(id: string): ImagePlaceholder {
    return placeholderImages.find(p => p.id === id) || defaultImage;
}
