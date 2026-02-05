const apartmentService = require('../services/apartmentService');

// Get caterer apartments
exports.getCatererApartments = async (req, res) => {
  return await apartmentService.getCatererApartments(req, res);
};

// Create apartment
exports.createApartment = async (req, res) => {
  return await apartmentService.createApartment(req, res);
};

// Delete apartment
exports.deleteApartment = async (req, res) => {
  return await apartmentService.deleteApartment(req, res);
};

// Link customer to apartment via access code
exports.linkCustomerToApartment = async (req, res) => {
  return await apartmentService.linkCustomerToApartment(req, res);
};

// Manually link customer to apartment (by caterer)
exports.manualLinkCustomerToApartment = async (req, res) => {
  return await apartmentService.manualLinkCustomerToApartment(req, res);
};

// Get customer apartments
exports.getCustomerApartments = async (req, res) => {
  return await apartmentService.getCustomerApartments(req, res);
};

// Get customer apartment links by caterer
exports.getCustomerApartmentLinks = async (req, res) => {
  return await apartmentService.getCustomerApartmentLinks(req, res);
};
