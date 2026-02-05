const tablesService = require('../services/tablesService');

// Create multiple tables with QR codes
exports.createBulkTables = async (req, res) => {
  return await tablesService.createBulkTables(req, res);
};

// Get all tables for a caterer
exports.getTablesByCaterer = async (req, res) => {
  return await tablesService.getTablesByCaterer(req, res);
};

// Get single table by ID
exports.getTableById = async (req, res) => {
  return await tablesService.getTableById(req, res);
};

// Update table
exports.updateTable = async (req, res) => {
  return await tablesService.updateTable(req, res);
};

// Delete table
exports.deleteTable = async (req, res) => {
  return await tablesService.deleteTable(req, res);
};

// Regenerate QR code for a table
exports.regenerateQR = async (req, res) => {
  return await tablesService.regenerateQR(req, res);
};
