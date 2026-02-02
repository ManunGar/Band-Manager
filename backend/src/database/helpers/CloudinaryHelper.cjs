'use strict';

const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
  });
};

/**
 * Clear all images from a Cloudinary folder
 * @param {string} folderPath - The path of the folder to clear in Cloudinary
 */
const clearCloudinaryFolder = async (folderPath) => {
  configureCloudinary();
  
  try {
    const result = await cloudinary.api.delete_resources_by_prefix(folderPath);
    console.log(`✓ Deleted ${result.deleted ? Object.keys(result.deleted).length : 0} images from ${folderPath}`);
    
    // Also delete the folder itself
    try {
      await cloudinary.api.delete_folder(folderPath);
    } catch (err) {
      // Folder might not be empty or might not exist
    }
  } catch (error) {
    console.log(`No images to delete in ${folderPath} or folder doesn't exist`);
  }
};

/**
 * Upload an image to Cloudinary
 * @param {string} filePath - The local path of the file to upload
 * @param {string} folder - The destination folder in Cloudinary
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
const uploadToCloudinary = async (filePath, folder) => {
  configureCloudinary();
  
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      use_filename: true,
      unique_filename: false
    });
    console.log(`✓ Uploaded ${path.basename(filePath)} to ${folder}`);
    return result.secure_url;
  } catch (error) {
    console.error(`✗ Error uploading ${filePath}:`, error.message);
    return '';
  }
};

module.exports = {
  clearCloudinaryFolder,
  uploadToCloudinary
};
