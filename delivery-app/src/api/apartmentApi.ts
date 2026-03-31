import { Apartment, CustomerApartment } from "../types/apartment";
import { API_CONFIG } from "../config/api";
import { authenticatedFetch } from "../utils/apiHelper";

const BASE_URL = API_CONFIG.BASE_URL;

export const getCatererApartments = async (catererId: number): Promise<Apartment[]> => {
  const res = await authenticatedFetch(`${BASE_URL}/apartments?catererId=${catererId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch apartments");
  }

  return await res.json();
};

// Fetch all customer-apartment links for a caterer
export const getCustomerApartmentLinks = async (catererId: number): Promise<CustomerApartment[]> => {
  const res = await authenticatedFetch(`${BASE_URL}/apartments/links?catererId=${catererId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch customer apartment links");
  }

  return await res.json();
};

export const createApartment = async (data: Omit<Apartment, "id" | "createdAt">): Promise<Apartment> => {
  const res = await authenticatedFetch(`${BASE_URL}/apartments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create apartment");
  }

  return await res.json();
};

export const updateApartment = async (id: number, data: Partial<Apartment>): Promise<Apartment> => {
  // Note: Backend doesn't currently support apartment updates
  // Would need to add a PUT /api/apartments/:id endpoint
  throw new Error("Update apartment not yet supported in new backend");
};

export const deleteApartment = async (id: number): Promise<void> => {
  const res = await authenticatedFetch(`${BASE_URL}/apartments/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete apartment");
  }
};

export const verifyAccessCode = async (code: string): Promise<Apartment | null> => {
  // This functionality is now part of linkCustomerToApartment
  // We'll need to fetch apartments and filter client-side
  throw new Error("Direct access code verification not supported - use linkCustomerToApartment instead");
};

export const getApartmentCustomers = async (apartmentId: number): Promise<CustomerApartment[]> => {
  // Backend doesn't have this specific endpoint yet
  // You could implement it or fetch all customer_apartments and filter
  throw new Error("Get apartment customers not yet implemented in new backend");
};

export const addCustomerToApartment = async (
  data: Omit<CustomerApartment, "id" | "createdAt">
): Promise<CustomerApartment> => {
  // Use manual-link endpoint for manual linking (by caterer selection or direct add)
  const res = await authenticatedFetch(`${BASE_URL}/apartments/manual-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId: data.customerId,
      apartmentId: data.apartmentId, // Can be a number (apartment ID) or null (direct add)
      catererId: data.catererId,
      addedVia: data.addedVia,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to link customer to apartment" }));
    throw new Error(error.error || "Failed to link customer to apartment");
  }

  return await res.json();
};

export const linkCustomerToApartmentByCode = async (
  customerId: number,
  accessCode: string
): Promise<CustomerApartment> => {
  const res = await authenticatedFetch(`${BASE_URL}/apartments/link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ customerId, accessCode }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to link customer to apartment");
  }

  return await res.json();
};

export const removeCustomerFromApartment = async (customerId: number, catererId: number): Promise<void> => {
  const res = await authenticatedFetch(`${BASE_URL}/apartments/unlink`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ customerId, catererId }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to remove customer from apartment" }));
    throw new Error(error.error || "Failed to remove customer from apartment");
  }
};

// Get customer's current apartment assignment for a specific caterer
export const getCustomerApartmentLink = async (customerId: number, catererId: number): Promise<CustomerApartment | null> => {
  try {
    const res = await authenticatedFetch(`${BASE_URL}/apartments/customer-link?customerId=${customerId}&catererId=${catererId}`);

    if (!res.ok) {
      if (res.status === 404) {
        return null; // No apartment assignment found
      }
      throw new Error("Failed to fetch customer apartment link");
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to get customer apartment link:", error);
    return null;
  }
};

// Update customer's apartment assignment (removes old link and creates new one)
export const updateCustomerApartment = async (
  customerId: number,
  catererId: number,
  newApartmentId: number | null // null for direct add
): Promise<CustomerApartment> => {
  // Step 1: Remove existing apartment link
  try {
    await removeCustomerFromApartment(customerId, catererId);
    console.log("Removed existing apartment link");
  } catch (error) {
    // Ignore 404 error if no existing link, but log others
    console.log("No existing apartment link to remove or removal failed:", error);
  }

  // Step 2: Create new apartment link
  try {
    return await addCustomerToApartment({
      customerId,
      apartmentId: newApartmentId,
      catererId,
      addedVia: "manual",
    });
  } catch (error) {
    console.error("Failed to add customer to apartment:", error);
    throw error;
  }
};

// Get all customers for a caterer with their apartment info
export const getCustomersByCaterer = async (catererId: number): Promise<unknown[]> => {
  try {
    // This would require a custom backend endpoint or multiple API calls
    // For now, return empty array
    console.warn("getCustomersByCaterer not fully implemented with new backend");
    return [];
  } catch (error) {
    console.error("Failed to get customers by caterer:", error);
    return [];
  }
};

// Get customers by specific apartment
export const getCustomersByApartment = async (apartmentId: number): Promise<unknown[]> => {
  try {
    // This would require a custom backend endpoint
    console.warn("getCustomersByApartment not fully implemented with new backend");
    return [];
  } catch (error) {
    console.error("Failed to get customers by apartment:", error);
    return [];
  }
};
