import { API_CONFIG } from '../config/api';

const BASE_URL = API_CONFIG.BASE_URL;

// TypeScript interfaces
export interface RestaurantTable {
  id: number;
  catererId: number;
  tableNumber: string;
  qrCodeUrl: string;
  qrData: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBulkTablesRequest {
  catererId: number;
  count: number;
  restaurantName: string;
}

export interface CreateBulkTablesResponse {
  message: string;
  tables: RestaurantTable[];
  total: number;
}

export interface UpdateTableRequest {
  tableNumber?: string;
  isActive?: boolean;
}

/**
 * Create multiple tables with QR codes
 */
export const createBulkTables = async (
  data: CreateBulkTablesRequest
): Promise<CreateBulkTablesResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/tables/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create tables');
    }

    return await response.json();
  } catch (error) {
    console.error('Create bulk tables error:', error);
    throw error;
  }
};

/**
 * Get all tables for a caterer
 */
export const getCatererTables = async (
  catererId: number
): Promise<RestaurantTable[]> => {
  try {
    const response = await fetch(`${BASE_URL}/tables?catererId=${catererId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch tables');
    }

    return await response.json();
  } catch (error) {
    console.error('Get caterer tables error:', error);
    throw error;
  }
};

/**
 * Get single table by ID
 */
export const getTableById = async (id: number): Promise<RestaurantTable> => {
  try {
    const response = await fetch(`${BASE_URL}/tables/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch table');
    }

    return await response.json();
  } catch (error) {
    console.error('Get table by ID error:', error);
    throw error;
  }
};

/**
 * Update table
 */
export const updateTable = async (
  id: number,
  data: UpdateTableRequest
): Promise<RestaurantTable> => {
  try {
    const response = await fetch(`${BASE_URL}/tables/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update table');
    }

    return await response.json();
  } catch (error) {
    console.error('Update table error:', error);
    throw error;
  }
};

/**
 * Delete table
 */
export const deleteTable = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/tables/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete table');
    }
  } catch (error) {
    console.error('Delete table error:', error);
    throw error;
  }
};

/**
 * Regenerate QR code for a table
 */
export const regenerateQR = async (id: number): Promise<RestaurantTable> => {
  try {
    const response = await fetch(`${BASE_URL}/tables/${id}/regenerate-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to regenerate QR code');
    }

    const result = await response.json();
    return result.table;
  } catch (error) {
    console.error('Regenerate QR error:', error);
    throw error;
  }
};
