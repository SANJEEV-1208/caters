// Cloudinary Configuration for Image Uploads
// Using production credentials from backend

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgejbxsy7',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'kaaspro_menu_images',
  folder: 'kaaspro/menu-items',
};

export const CLOUDINARY_QR_CONFIG = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgejbxsy7',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'kaaspro_menu_images',
  folder: 'kaaspro/qr-codes',
};

export const getCloudinaryUploadUrl = () => {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
};

// QR Code folder configuration (used by backend)
export const QR_CODE_FOLDER = 'kaaspro/qr-codes';
