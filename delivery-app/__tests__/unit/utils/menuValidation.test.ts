import { Alert } from 'react-native';
import { validateMenuForm, MenuFormData } from '@/src/utils/menuValidation';

// Mock React Native Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('menuValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateMenuForm', () => {
    test('should return valid for complete form data', () => {
      const formData: MenuFormData = {
        name: 'Biryani',
        price: '150',
        imageUrl: 'http://example.com/image.jpg',
        requireDates: false,
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(true);
      expect(result.priceNum).toBe(150);
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    test('should validate name field', () => {
      const formData: MenuFormData = {
        name: '',
        price: '150',
        imageUrl: 'http://example.com/image.jpg',
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(false);
      expect(result.priceNum).toBeUndefined();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter item name');
    });

    test('should reject whitespace-only names', () => {
      const formData: MenuFormData = {
        name: '   ',
        price: '150',
        imageUrl: 'http://example.com/image.jpg',
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter item name');
    });

    test('should validate price field presence', () => {
      const formData: MenuFormData = {
        name: 'Biryani',
        price: '',
        imageUrl: 'http://example.com/image.jpg',
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(false);
      expect(result.priceNum).toBeUndefined();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter price');
    });

    test('should reject whitespace-only price', () => {
      const formData: MenuFormData = {
        name: 'Biryani',
        price: '   ',
        imageUrl: 'http://example.com/image.jpg',
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter price');
    });

    test('should validate numeric price', () => {
      const formData: MenuFormData = {
        name: 'Biryani',
        price: 'invalid',
        imageUrl: 'http://example.com/image.jpg',
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid price');
    });

    test('should reject zero price', () => {
      const formData: MenuFormData = {
        name: 'Biryani',
        price: '0',
        imageUrl: 'http://example.com/image.jpg',
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid price');
    });

    test('should reject negative price', () => {
      const formData: MenuFormData = {
        name: 'Biryani',
        price: '-50',
        imageUrl: 'http://example.com/image.jpg',
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid price');
    });

    test('should accept decimal prices', () => {
      const formData: MenuFormData = {
        name: 'Coffee',
        price: '45.50',
        imageUrl: 'http://example.com/image.jpg',
        requireDates: false,
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(true);
      expect(result.priceNum).toBe(45.5);
    });

    test('should validate dates when required', () => {
      const formData: MenuFormData = {
        name: 'Biryani',
        price: '150',
        imageUrl: 'http://example.com/image.jpg',
        requireDates: true,
        selectedDates: [],
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Please select at least one available date'
      );
    });

    test('should validate dates when undefined and required', () => {
      const formData: MenuFormData = {
        name: 'Biryani',
        price: '150',
        imageUrl: 'http://example.com/image.jpg',
        requireDates: true,
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Please select at least one available date'
      );
    });

    test('should accept valid dates when required', () => {
      const formData: MenuFormData = {
        name: 'Biryani',
        price: '150',
        imageUrl: 'http://example.com/image.jpg',
        requireDates: true,
        selectedDates: ['2026-02-04', '2026-02-05'],
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(true);
      expect(result.priceNum).toBe(150);
    });

    test('should not validate dates when not required', () => {
      const formData: MenuFormData = {
        name: 'Biryani',
        price: '150',
        imageUrl: 'http://example.com/image.jpg',
        requireDates: false,
        selectedDates: [],
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(true);
      expect(result.priceNum).toBe(150);
    });

    test('should validate image URL presence', () => {
      const formData: MenuFormData = {
        name: 'Biryani',
        price: '150',
        imageUrl: '',
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter image URL');
    });

    test('should reject whitespace-only image URL', () => {
      const formData: MenuFormData = {
        name: 'Biryani',
        price: '150',
        imageUrl: '   ',
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter image URL');
    });

    test('should validate in correct order (name, price, dates, image)', () => {
      // Test that name is checked first
      const noName: MenuFormData = {
        name: '',
        price: '',
        imageUrl: '',
      };
      validateMenuForm(noName);
      expect(Alert.alert).toHaveBeenLastCalledWith('Error', 'Please enter item name');

      jest.clearAllMocks();

      // Test that price is checked second
      const noPrice: MenuFormData = {
        name: 'Biryani',
        price: '',
        imageUrl: '',
      };
      validateMenuForm(noPrice);
      expect(Alert.alert).toHaveBeenLastCalledWith('Error', 'Please enter price');

      jest.clearAllMocks();

      // Test that dates are checked third
      const noDates: MenuFormData = {
        name: 'Biryani',
        price: '150',
        imageUrl: '',
        requireDates: true,
        selectedDates: [],
      };
      validateMenuForm(noDates);
      expect(Alert.alert).toHaveBeenLastCalledWith(
        'Error',
        'Please select at least one available date'
      );

      jest.clearAllMocks();

      // Test that image is checked last
      const noImage: MenuFormData = {
        name: 'Biryani',
        price: '150',
        imageUrl: '',
        requireDates: false,
      };
      validateMenuForm(noImage);
      expect(Alert.alert).toHaveBeenLastCalledWith('Error', 'Please enter image URL');
    });

    test('should handle large price values', () => {
      const formData: MenuFormData = {
        name: 'Premium Thali',
        price: '99999.99',
        imageUrl: 'http://example.com/image.jpg',
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(true);
      expect(result.priceNum).toBe(99999.99);
    });

    test('should handle price with leading/trailing whitespace', () => {
      const formData: MenuFormData = {
        name: 'Biryani',
        price: '  150  ',
        imageUrl: 'http://example.com/image.jpg',
      };

      const result = validateMenuForm(formData);

      expect(result.valid).toBe(true);
      expect(result.priceNum).toBe(150);
    });
  });
});
