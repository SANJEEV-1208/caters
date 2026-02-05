const cuisineService = require('../services/cuisineService');

// Get all cuisines
exports.getAllCuisines = async (req, res) => {
  return await cuisineService.getAllCuisines(req, res);
};

// Create cuisine
exports.createCuisine = async (req, res) => {
  return await cuisineService.createCuisine(req, res);
};

// Delete cuisine
exports.deleteCuisine = async (req, res) => {
  return await cuisineService.deleteCuisine(req, res);
};

// Get caterer cuisines
exports.getCatererCuisines = async (req, res) => {
  return await cuisineService.getCatererCuisines(req, res);
};

// Create caterer cuisine
exports.createCatererCuisine = async (req, res) => {
  return await cuisineService.createCatererCuisine(req, res);
};

// Delete caterer cuisine
exports.deleteCatererCuisine = async (req, res) => {
  return await cuisineService.deleteCatererCuisine(req, res);
};
