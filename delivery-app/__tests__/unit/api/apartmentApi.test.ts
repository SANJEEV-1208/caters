import {
  getCatererApartments,
  getCustomerApartmentLinks,
  createApartment,
  updateApartment,
  deleteApartment,
  verifyAccessCode,
  getApartmentCustomers,
  addCustomerToApartment,
  linkCustomerToApartmentByCode,
  removeCustomerFromApartment,
  getCustomersByCaterer,
  getCustomersByApartment,
} from '@/src/api/apartmentApi';
import { Apartment, CustomerApartment } from '@/src/types/apartment';

// Mock global fetch
global.fetch = jest.fn();

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

describe('apartmentApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCatererApartments', () => {
    test('should fetch all apartments for a caterer', async () => {
      const catererId = 2;
      const mockApartments: Apartment[] = [
        {
          id: 1,
          catererId: 2,
          name: 'Sunrise Apartments',
          address: '123 Main St',
          accessCode: 'ABC123',
          createdAt: '2026-02-01T10:00:00.000Z',
        },
        {
          id: 2,
          catererId: 2,
          name: 'Green Valley Complex',
          address: '456 Oak Ave',
          accessCode: 'XYZ789',
          createdAt: '2026-02-02T10:00:00.000Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApartments,
      });

      const apartments = await getCatererApartments(catererId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/apartments?catererId=${catererId}`)
      );
      expect(apartments).toEqual(mockApartments);
      expect(apartments).toHaveLength(2);
    });

    test('should handle fetch apartments errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(getCatererApartments(2)).rejects.toThrow('Failed to fetch apartments');
    });

    test('should return empty array when caterer has no apartments', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const apartments = await getCatererApartments(2);

      expect(apartments).toHaveLength(0);
    });
  });

  describe('getCustomerApartmentLinks', () => {
    test('should fetch customer apartment links for a caterer', async () => {
      const catererId = 2;
      const mockLinks: CustomerApartment[] = [
        {
          id: 1,
          customerId: 1,
          apartmentId: 1,
          catererId: 2,
          addedVia: 'code',
          createdAt: '2026-02-01T10:00:00.000Z',
        },
        {
          id: 2,
          customerId: 3,
          apartmentId: 2,
          catererId: 2,
          addedVia: 'manual',
          createdAt: '2026-02-02T10:00:00.000Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockLinks,
      });

      const links = await getCustomerApartmentLinks(catererId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/apartments/links?catererId=${catererId}`)
      );
      expect(links).toEqual(mockLinks);
      expect(links).toHaveLength(2);
    });

    test('should handle fetch links errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(getCustomerApartmentLinks(2)).rejects.toThrow(
        'Failed to fetch customer apartment links'
      );
    });
  });

  describe('createApartment', () => {
    test('should create new apartment', async () => {
      const apartmentData = {
        catererId: 2,
        name: 'New Apartments',
        address: '789 Park Blvd',
        accessCode: 'NEW123',
      };

      const mockResponse: Apartment = {
        ...apartmentData,
        id: 3,
        createdAt: '2026-02-04T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const apartment = await createApartment(apartmentData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/apartments'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apartmentData),
        })
      );
      expect(apartment).toEqual(mockResponse);
      expect(apartment.id).toBe(3);
    });

    test('should handle create apartment errors', async () => {
      const apartmentData = {
        catererId: 2,
        name: 'Test Apartments',
        address: '123 Test St',
        accessCode: 'TEST123',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(createApartment(apartmentData)).rejects.toThrow('Failed to create apartment');
    });
  });

  describe('updateApartment', () => {
    test('should throw error for unsupported operation', async () => {
      await expect(updateApartment(1, { name: 'Updated Name' })).rejects.toThrow(
        'Update apartment not yet supported in new backend'
      );
    });
  });

  describe('deleteApartment', () => {
    test('should delete apartment', async () => {
      const apartmentId = 1;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      await deleteApartment(apartmentId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/apartments/${apartmentId}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    test('should handle delete apartment errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(deleteApartment(999)).rejects.toThrow('Failed to delete apartment');
    });
  });

  describe('verifyAccessCode', () => {
    test('should throw error for unsupported operation', async () => {
      await expect(verifyAccessCode('ABC123')).rejects.toThrow(
        'Direct access code verification not supported - use linkCustomerToApartment instead'
      );
    });
  });

  describe('getApartmentCustomers', () => {
    test('should throw error for unimplemented operation', async () => {
      await expect(getApartmentCustomers(1)).rejects.toThrow(
        'Get apartment customers not yet implemented in new backend'
      );
    });
  });

  describe('addCustomerToApartment', () => {
    test('should add customer to apartment manually', async () => {
      const linkData = {
        customerId: 1,
        apartmentId: 1,
        catererId: 2,
        addedVia: 'manual' as const,
      };

      const mockResponse: CustomerApartment = {
        ...linkData,
        id: 1,
        createdAt: '2026-02-04T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const link = await addCustomerToApartment(linkData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/apartments/manual-link'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(link).toEqual(mockResponse);
      expect(link.addedVia).toBe('manual');
    });

    test('should handle direct add with null apartmentId', async () => {
      const linkData = {
        customerId: 1,
        apartmentId: null,
        catererId: 2,
        addedVia: 'manual' as const,
      };

      const mockResponse: CustomerApartment = {
        id: 1,
        customerId: 1,
        apartmentId: null,
        catererId: 2,
        addedVia: 'manual',
        createdAt: '2026-02-04T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const link = await addCustomerToApartment(linkData);

      expect(link.apartmentId).toBeNull();
      expect(link.addedVia).toBe('manual');
    });

    test('should handle add customer errors with JSON response', async () => {
      const linkData = {
        customerId: 1,
        apartmentId: 1,
        catererId: 2,
        addedVia: 'manual' as const,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Customer already linked to apartment' }),
      });

      await expect(addCustomerToApartment(linkData)).rejects.toThrow(
        'Customer already linked to apartment'
      );
    });

    test('should handle add customer errors without JSON response', async () => {
      const linkData = {
        customerId: 1,
        apartmentId: 1,
        catererId: 2,
        addedVia: 'manual' as const,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(addCustomerToApartment(linkData)).rejects.toThrow(
        'Failed to link customer to apartment'
      );
    });
  });

  describe('linkCustomerToApartmentByCode', () => {
    test('should link customer using access code', async () => {
      const customerId = 1;
      const accessCode = 'ABC123';

      const mockResponse: CustomerApartment = {
        id: 1,
        customerId: 1,
        apartmentId: 1,
        catererId: 2,
        addedVia: 'code',
        createdAt: '2026-02-04T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const link = await linkCustomerToApartmentByCode(customerId, accessCode);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/apartments/link'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId, accessCode }),
        })
      );
      expect(link).toEqual(mockResponse);
      expect(link.addedVia).toBe('code');
    });

    test('should handle invalid access code', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Invalid access code' }),
      });

      await expect(linkCustomerToApartmentByCode(1, 'INVALID')).rejects.toThrow(
        'Invalid access code'
      );
    });

    test('should handle generic link errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(linkCustomerToApartmentByCode(1, 'ABC123')).rejects.toThrow(
        'Failed to link customer to apartment'
      );
    });
  });

  describe('removeCustomerFromApartment', () => {
    test('should throw error for unimplemented operation', async () => {
      await expect(removeCustomerFromApartment(1)).rejects.toThrow(
        'Remove customer from apartment not yet implemented in new backend'
      );
    });
  });

  describe('getCustomersByCaterer', () => {
    test('should return empty array for unimplemented operation', async () => {
      const customers = await getCustomersByCaterer(2);

      expect(customers).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'getCustomersByCaterer not fully implemented with new backend'
      );
    });

    test('should handle errors gracefully', async () => {
      // Force an error by modifying console.warn to throw
      (console.warn as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const customers = await getCustomersByCaterer(2);

      expect(customers).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to get customers by caterer:',
        expect.any(Error)
      );
    });
  });

  describe('getCustomersByApartment', () => {
    test('should return empty array for unimplemented operation', async () => {
      const customers = await getCustomersByApartment(1);

      expect(customers).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'getCustomersByApartment not fully implemented with new backend'
      );
    });

    test('should handle errors gracefully', async () => {
      // Force an error by modifying console.warn to throw
      (console.warn as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const customers = await getCustomersByApartment(1);

      expect(customers).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to get customers by apartment:',
        expect.any(Error)
      );
    });
  });

  describe('Apartment Workflow', () => {
    test('should complete apartment creation and customer linking via code', async () => {
      const catererId = 2;

      // Step 1: Create apartment
      const apartmentData = {
        catererId,
        name: 'Test Complex',
        address: '123 Test St',
        accessCode: 'TEST123',
      };

      const mockApartment: Apartment = {
        ...apartmentData,
        id: 1,
        createdAt: '2026-02-04T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApartment,
      });

      const apartment = await createApartment(apartmentData);
      expect(apartment.accessCode).toBe('TEST123');

      // Step 2: Link customer using access code
      const mockLink: CustomerApartment = {
        id: 1,
        customerId: 1,
        apartmentId: 1,
        catererId: 2,
        addedVia: 'code',
        createdAt: '2026-02-04T10:30:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLink,
      });

      const link = await linkCustomerToApartmentByCode(1, 'TEST123');
      expect(link.addedVia).toBe('code');
      expect(link.apartmentId).toBe(1);
    });

    test('should complete manual customer addition workflow', async () => {
      // Caterer manually adds customer
      const linkData = {
        customerId: 1,
        apartmentId: 1,
        catererId: 2,
        addedVia: 'manual' as const,
      };

      const mockLink: CustomerApartment = {
        ...linkData,
        id: 1,
        createdAt: '2026-02-04T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockLink,
      });

      const link = await addCustomerToApartment(linkData);
      expect(link.addedVia).toBe('manual');
    });
  });
});
