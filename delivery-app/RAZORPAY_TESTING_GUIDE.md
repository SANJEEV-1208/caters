# Realistic UPI Payment Testing Guide

This guide explains how to test the realistic UPI payment flow in the food delivery app.

## Overview

The app now features a **realistic payment gateway experience** that simulates the actual UPI payment flow, just like real apps (Swiggy, Zomato, etc.). When you select UPI payment, you'll see a payment gateway interface with options to pay via GPay, PhonePe, Paytm, BHIM, or by entering a UPI ID.

## How It Works (Realistic Flow)

### Step-by-Step Payment Experience:

1. **Add items to cart** → Click "Proceed to Pay"
2. **Select "Pay with UPI"** in the payment method bottom sheet
3. **Payment Gateway Opens** (looks like real Razorpay):
   - Shows amount to pay
   - "Secured by Razorpay" indicator
   - Multiple payment options

4. **Choose Payment Method**:

   **Option 1: Pay using UPI Apps**
   - See cards for GPay, PhonePe, Paytm, BHIM
   - Click on any app (e.g., Google Pay)
   - Simulates opening the app
   - Shows "Opening Google Pay..." with loading
   - Shows payment processing steps
   - Verifying payment...
   - Success! ✅

   **Option 2: Enter UPI ID**
   - Type your UPI ID (e.g., `test@upi`)
   - Click "Verify & Pay"
   - Simulates UPI ID verification
   - Shows processing and verification
   - Success! ✅

   **Option 3: Scan QR Code**
   - QR code placeholder shown
   - (For testing, use the app options above)

5. **Payment Processing**:
   - "Opening [UPI App]..." (1.5 seconds)
   - "Verifying Payment..." (2 seconds)
   - Total realistic flow: ~3.5 seconds

6. **Payment Success**:
   - Alert shows "Payment Successful"
   - Displays transaction ID
   - Redirects to Order Confirmation

## What Makes It Realistic?

### Real Payment Gateway UI
- ✅ Amount display at top
- ✅ Secure indicator with lock icon
- ✅ Branded as "Razorpay"
- ✅ Professional design matching real apps

### UPI App Selection
- ✅ Google Pay icon (🔵)
- ✅ PhonePe icon (🟣)
- ✅ Paytm icon (🔵)
- ✅ BHIM UPI icon (🟠)

### Payment States
- ✅ Opening UPI app screen
- ✅ Processing payment screen
- ✅ Verifying with bank screen
- ✅ Success confirmation

### Processing Steps Shown
```
✓ Redirecting to UPI app
• Verify payment details
• Enter UPI PIN
```

### Verification Steps
```
🔄 Checking with bank...
```

## Testing Different Scenarios

### Test UPI App Payment (Google Pay):

1. Add items to cart (₹150 total)
2. Click "Proceed to Pay"
3. Select "Pay with UPI"
4. Payment gateway opens showing ₹150
5. Click on "Google Pay" card (🔵)
6. See "Opening Google Pay..." with spinner
7. See payment steps checklist
8. See "Verifying Payment..."
9. Alert: "Payment Successful" with transaction ID
10. Click OK → Order Confirmation Screen

**Result**: Transaction ID like `txn_1704789012345_xk9p2m7q`

### Test UPI ID Payment:

1. Add items to cart
2. Click "Proceed to Pay"
3. Select "Pay with UPI"
4. Scroll down to "Enter UPI ID"
5. Type: `test@upi` or `myname@paytm`
6. Click "Verify & Pay"
7. See verification process
8. Payment successful!

**Result**: Same successful flow

### Test Payment Cancellation:

1. Start payment process
2. When payment gateway opens, click "✕" at top
3. Payment cancelled, returns to cart

**Result**: Can retry payment

## Payment Flow Diagram

```
Cart (₹150)
   ↓ Click "Proceed to Pay"
Payment Method Selection
   ├─ UPI Payment ──────────────┐
   └─ Cash on Delivery          │
                                 ↓
                    Payment Gateway Modal
                    ┌────────────────────┐
                    │  Amount: ₹150      │
                    │  🔒 Secured        │
                    └────────────────────┘
                                 ↓
           ┌─────────────────────┼─────────────────────┐
           ↓                     ↓                     ↓
       GPay/PhonePe          UPI ID              QR Code
       (Click App)           (Enter ID)          (Scan)
           ↓                     ↓                     ↓
    Opening App (1.5s)    Verifying ID (1.5s)    [Same flow]
           ↓                     ↓
    Verifying Payment (2s) ──────┘
           ↓
    ✅ Success Alert
    Transaction ID: txn_xxxx
           ↓
    Order Confirmation
    - Order ID
    - Transaction ID
    - Amount
```

## UI Components Explained

### Payment Gateway Header
```
┌──────────────────────────────┐
│  ✕  Payment Gateway         │
│                               │
│     Amount to Pay             │
│        ₹150                   │
│   🔒 Secured by Razorpay     │
└──────────────────────────────┘
```

### UPI Apps Grid
```
┌──────────┬──────────┐
│    🔵    │    🟣    │
│ Google   │ PhonePe  │
│   Pay    │          │
├──────────┼──────────┤
│    🔵    │    🟠    │
│  Paytm   │   BHIM   │
│          │   UPI    │
└──────────┴──────────┘
```

### Processing Screen
```
┌──────────────────────────────┐
│         ⏳ Spinner            │
│                               │
│  Opening Google Pay...        │
│  Please complete the payment  │
│  in your UPI app              │
│                               │
│  ✓ Redirecting to UPI app    │
│  • Verify payment details     │
│  • Enter UPI PIN              │
└──────────────────────────────┘
```

## Transaction ID Format

Generated IDs follow this pattern:
```
txn_[timestamp]_[random]

Example: txn_1704789012345_xk9p2m7q
         ^^^               ^^^^^^^^
         Timestamp         Random ID
```

## Customization Options

### Change Processing Delay

Edit `src/components/UpiPaymentModal.tsx`:

```typescript
// Line ~53: Opening app delay
setTimeout(() => {
  setStep('verify');
}, 1500); // Change this (in milliseconds)

// Line ~58: Verification delay
setTimeout(() => {
  setProcessing(false);
  const mockTransactionId = ...
  onSuccess(mockTransactionId);
}, 3500); // Change this (total time from start)
```

### Add More UPI Apps

Edit `src/components/UpiPaymentModal.tsx`:

```typescript
const UPI_APPS: UpiApp[] = [
  { id: 'gpay', name: 'Google Pay', icon: '🔵', package: '...' },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣', package: '...' },
  // Add your app here:
  { id: 'myapp', name: 'My UPI App', icon: '🟢', package: 'com.myapp' },
];
```

### Simulate Payment Failure

In `UpiPaymentModal.tsx`, modify the success handler to call `onFailure`:

```typescript
// Instead of:
onSuccess(mockTransactionId);

// Use:
onFailure('Payment declined by bank');
```

## Differences from Real Razorpay

| Feature | This Implementation | Real Razorpay |
|---------|-------------------|---------------|
| UPI App Selection | ✅ Visual UI | ✅ Actual app launch |
| Payment Gateway UI | ✅ Realistic design | ✅ Official Razorpay UI |
| Processing States | ✅ Simulated (3.5s) | ✅ Real bank verification |
| Transaction ID | ✅ Mock format | ✅ Real Razorpay ID |
| UPI PIN Entry | ❌ Skipped | ✅ Required in real app |
| Bank Verification | ❌ Simulated | ✅ Real-time check |
| Refunds | ❌ Not implemented | ✅ Available |
| Payment History | ❌ Not saved | ✅ Stored in backend |

## Why This Approach?

### Benefits:
1. **Expo Go Compatible** - No need to build custom native code
2. **Realistic Experience** - Feels like real payment gateway
3. **Fast Testing** - No waiting for real bank verification
4. **Predictable** - Always succeeds (configurable)
5. **Educational** - Shows complete payment flow

### Limitations:
1. **No Real Money** - Payments are simulated
2. **No Actual UPI Apps** - Doesn't launch GPay/PhonePe
3. **No Bank Integration** - No real verification
4. **No PIN Entry** - Security step is skipped

## Production Transition

For real Razorpay integration:

### 1. Use Development Build
```bash
npx expo prebuild
npx expo run:android  # or run:ios
```

### 2. Install Razorpay
```bash
npm install react-native-razorpay
```

### 3. Update Code
Replace in `PaymentBottomSheet.tsx`:
```typescript
// Remove:
import UpiPaymentModal from './UpiPaymentModal';

// Add:
import RazorpayCheckout from 'react-native-razorpay';
```

### 4. Backend Setup
- Create order endpoint
- Generate order_id on server
- Verify payment signatures
- Store transaction records

### 5. Use Live Keys
```typescript
key: 'rzp_live_YOUR_LIVE_KEY'
```

## Testing Checklist

- [ ] Add multiple items to cart
- [ ] Test Google Pay flow
- [ ] Test PhonePe flow
- [ ] Test Paytm flow
- [ ] Test BHIM UPI flow
- [ ] Test UPI ID entry (test@upi)
- [ ] Test payment cancellation (click ✕)
- [ ] Verify transaction ID appears
- [ ] Check order confirmation details
- [ ] Test Cash on Delivery (for comparison)
- [ ] Verify cart clears after order

## Common Questions

**Q: Why doesn't it actually open Google Pay?**
A: This is a simulation for testing in Expo Go. Real UPI app launching requires native code and a development build.

**Q: Can I make it fail sometimes?**
A: Yes! Edit `UpiPaymentModal.tsx` and add failure conditions in the payment processing logic.

**Q: Does it work on iOS?**
A: Yes! The UI works on both Android and iOS. Real Razorpay would also work on both platforms.

**Q: Can I customize the UPI apps shown?**
A: Absolutely! Edit the `UPI_APPS` array in `UpiPaymentModal.tsx`.

**Q: Is the transaction ID saved anywhere?**
A: Currently no - it's only displayed. For production, you'd save it to your backend.

## Demo Credentials

**UPI IDs for testing:**
- test@upi
- demo@paytm
- user@phonepe
- anything@googlepay

**Expected Amount:**
- Whatever items you added to cart
- Displays in ₹ (Indian Rupees)

---

**Enjoy the realistic payment experience!** 🎉

This simulation gives you a real feel for how UPI payments work in production apps, all while testing safely in development mode.
