const QRCode = require('qrcode');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

/**
 * Generate QR code buffer from data
 * @param {Object} data - Data to encode in QR code
 * @returns {Promise<Buffer>} - QR code image buffer
 */
async function generateQRCodeBuffer(data) {
  try {
    const qrDataString = JSON.stringify(data);
    const buffer = await QRCode.toBuffer(qrDataString, {
      errorCorrectionLevel: 'H', // High error correction
      type: 'png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return buffer;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
}

/**
 * Upload QR code buffer to Cloudinary
 * @param {Buffer} buffer - QR code image buffer
 * @param {number} catererId - Caterer ID
 * @param {string} tableNumber - Table number
 * @returns {Promise<string>} - Cloudinary secure URL
 */
async function uploadQRToCloudinary(buffer, catererId, tableNumber) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'kaaspro/qr-codes',
        public_id: `qr_caterer_${catererId}_table_${tableNumber}`,
        format: 'png',
        overwrite: true,
        resource_type: 'image',
        transformation: [
          {
            quality: 'auto:best',
            fetch_format: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Failed to upload QR code: ${error.message}`));
        } else {
          console.log(`✅ QR code uploaded: ${result.secure_url}`);
          resolve(result.secure_url);
        }
      }
    );

    // Convert buffer to readable stream and pipe to Cloudinary
    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
}

/**
 * Generate QR code and upload to Cloudinary (Main function)
 * @param {number} catererId - Caterer ID
 * @param {string} tableNumber - Table number
 * @param {string} restaurantName - Restaurant name
 * @returns {Promise<Object>} - { qrUrl, qrData }
 */
async function generateAndUploadQR(catererId, tableNumber, restaurantName) {
  try {
    // Create QR data object
    const qrData = {
      catererId,
      tableNumber,
      restaurantName,
      timestamp: new Date().toISOString(),
    };

    console.log(`Generating QR code for Caterer ${catererId}, Table ${tableNumber}...`);

    // Generate QR code buffer
    const qrBuffer = await generateQRCodeBuffer(qrData);

    // Upload to Cloudinary
    const qrUrl = await uploadQRToCloudinary(qrBuffer, catererId, tableNumber);

    console.log(`✅ QR code generated and uploaded for Table ${tableNumber}`);

    return {
      qrUrl,
      qrData: JSON.stringify(qrData),
    };
  } catch (error) {
    console.error('Generate and upload QR error:', error);
    throw error;
  }
}

/**
 * Generate QR code as Data URL (for testing/preview without upload)
 * @param {Object} data - Data to encode
 * @returns {Promise<string>} - Data URL
 */
async function generateQRDataURL(data) {
  try {
    const qrDataString = JSON.stringify(data);
    return await QRCode.toDataURL(qrDataString, {
      errorCorrectionLevel: 'H',
      width: 512,
      margin: 2,
    });
  } catch (error) {
    console.error('QR Data URL generation error:', error);
    throw new Error(`Failed to generate QR data URL: ${error.message}`);
  }
}

module.exports = {
  generateQRCodeBuffer,
  uploadQRToCloudinary,
  generateAndUploadQR,
  generateQRDataURL,
};
