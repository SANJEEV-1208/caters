// Mock Razorpay for testing in Expo Go
// This simulates the Razorpay payment flow without requiring native modules

export interface RazorpayOptions {
  description: string;
  image: string;
  currency: string;
  key: string;
  amount: number;
  name: string;
  prefill: {
    email: string;
    contact: string;
    name: string;
  };
  theme: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayError {
  code: number;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: unknown;
}

// Mock Razorpay Checkout
export const MockRazorpayCheckout = {
  open: (options: RazorpayOptions): Promise<RazorpayResponse> => {
    return new Promise((resolve, reject) => {
      // Simulate a delay for payment processing
      setTimeout(() => {
        // Simulate payment success (for cancellation testing, manually reject in code)
        const mockPaymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        resolve({
          razorpay_payment_id: mockPaymentId,
          razorpay_order_id: `order_mock_${Date.now()}`,
        });
      }, 2000); // 2 second delay to simulate real payment processing
    });
  },
};

// Test card validation (optional utility)
export const validateTestCard = (cardNumber: string): boolean => {
  const testCards = [
    '4111111111111111', // Visa
    '5555555555554444', // Mastercard
    '378282246310005',  // Amex
    '6074820000000000', // RuPay
  ];

  const cleanCard = cardNumber.replace(/\s/g, '');
  return testCards.includes(cleanCard);
};

// Generate mock payment ID
export const generateMockPaymentId = (): string => {
  return `pay_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
