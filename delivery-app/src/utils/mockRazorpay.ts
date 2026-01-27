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
  metadata: any;
}

// Mock Razorpay Checkout
export const MockRazorpayCheckout = {
  open: (options: RazorpayOptions): Promise<RazorpayResponse> => {
    return new Promise((resolve, reject) => {
      // Simulate a delay for payment processing
      setTimeout(() => {
        // For testing, you can change this to simulate different scenarios
        const shouldSucceed = true; // Set to false to test failure
        const shouldCancel = false; // Set to true to test cancellation

        if (shouldCancel) {
          // Simulate user cancellation
          reject({
            code: 2,
            description: 'Payment cancelled by user',
            source: 'customer',
            step: 'payment_authorization',
            reason: 'user_cancelled',
            metadata: {},
          });
        } else if (shouldSucceed) {
          // Simulate successful payment
          const mockPaymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          resolve({
            razorpay_payment_id: mockPaymentId,
            razorpay_order_id: `order_mock_${Date.now()}`,
          });
        } else {
          // Simulate payment failure
          reject({
            code: 0,
            description: 'Payment processing failed',
            source: 'gateway',
            step: 'payment_authorization',
            reason: 'payment_failed',
            metadata: {},
          });
        }
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
