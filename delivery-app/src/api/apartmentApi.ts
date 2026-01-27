import { Apartment, CustomerApartment } from "../types/apartment";
import { API_CONFIG } from "../config/api";

const BASE_URL = API_CONFIG.BASE_URL;

export const getCatererApartments = async (catererId: number): Promise<Apartment[]> => {
  const res = await fetch(`${BASE_URL}/apartments?catererId=${catererId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch apartments");
  }

  return await res.json();
};

export const createApartment = async (data: Omit<Apartment, "id" | "createdAt">): Promise<Apartment> => {
  const res = await fetch(`${BASE_URL}/apartments`, {
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
  const res = await fetch(`${BASE_URL}/apartments/${id}`, {
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
  const res = await fetch(`${BASE_URL}/apartments/manual-link`, {
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
  const res = await fetch(`${BASE_URL}/apartments/link`, {
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

export const removeCustomerFromApartment = async (id: number): Promise<void> => {
  // Backend doesn't have this endpoint yet
  throw new Error("Remove customer from apartment not yet implemented in new backend");
};

// Get all customers for a caterer with their apartment info
export const getCustomersByCaterer = async (catererId: number): Promise<any[]> => {
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
export const getCustomersByApartment = async (apartmentId: number): Promise<any[]> => {
  try {
    // This would require a custom backend endpoint
    console.warn("getCustomersByApartment not fully implemented with new backend");
    return [];
  } catch (error) {
    console.error("Failed to get customers by apartment:", error);
    return [];
  }
};
