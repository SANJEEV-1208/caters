const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection on initialization
const testConnection = async () => {
  try {
    await cloudinary.api.ping();
    console.log('✅ Cloudinary connected successfully');
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    console.error('Please check your CLOUDINARY credentials in .env file');
  }
};

// Run test only if credentials are provided
if (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET) {
  testConnection();
} else {
  console.warn('⚠️  Cloudinary credentials not found in .env file');
}

module.exports = cloudinary;
