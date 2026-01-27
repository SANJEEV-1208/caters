# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native food delivery subscription app built with Expo Router (v6) using file-based routing. The app supports multi-role authentication (customer/caterer/delivery_person) with distinct workflows:

**Customer Features**: Browse caterer-specific menus by date, search/filter food items, manage cart, place orders with UPI/COD payment
**Caterer Features**: Manage daily menus with date-based availability, reuse previously created menu items, view/manage orders, track customer subscriptions, manage apartment delivery locations
**Delivery Features**: View assigned deliveries, update delivery status (planned)

**Tech Stack**: Expo SDK ~54.0.30, React Native 0.81.5, React 19.1.0, TypeScript (strict mode)

## Development Commands

### App Development
```bash
# Install dependencies
npm install

# Start development server (default)
npm start
# or
npx expo start

# Run on specific platforms
npm run android
npm run ios
npm run web

# Code quality
npm run lint
```

### Backend Server
The backend uses JSON Server and must be started separately:
```bash
cd backend
json-server --watch db.json --port 5000 --host 192.168.1.25
```
**Important**: Update `BASE_URL` in all API files (`src/api/*.ts`) when backend IP/port changes.

### Other Commands
```bash
# Reset project (moves starter code to app-example)
npm run reset-project
```

## Environment Setup

Create a `.env` file in the root directory with Razorpay test credentials:
```bash
TEST_API_KEY=rzp_test_S23QmRxRikcnKD
TEST_KEY_SECRET=ox91dtypOKXuw6y5rQMfOx7q
```
These are used by the simulated UPI payment gateway (see `RAZORPAY_TESTING_GUIDE.md` for full payment testing instructions).

## Architecture

### Directory Structure
```
delivery-app/
├── app/                               # Expo Router file-based routing
│   ├── _layout.tsx                   # Root layout (AuthProvider + CartProvider)
│   ├── index.tsx                     # Entry point with role-based redirects
│   ├── login.tsx                     # Phone number login
│   ├── signup.tsx                    # Caterer registration
│   └── (authenticated)/              # Protected routes (role-based)
│       ├── _layout.tsx              # Role-based routing guard
│       ├── customer/                 # Customer-only screens
│       │   ├── _layout.tsx          # Bottom tab navigation
│       │   ├── caterer-selection.tsx # Select caterer to browse
│       │   ├── index.tsx            # Browse caterer menu by date
│       │   ├── search.tsx           # Search with trending items
│       │   ├── cart.tsx             # Shopping cart + checkout
│       │   ├── orders.tsx           # Order history
│       │   ├── details.tsx          # Food item details
│       │   ├── cuisinedetails.tsx   # Cuisine-filtered list
│       │   ├── orderconfirm.tsx     # Post-checkout confirmation
│       │   └── orderdetails.tsx     # Individual order view
│       └── caterer/                  # Caterer-only screens
│           ├── _layout.tsx          # Stack navigation (no tabs)
│           ├── dashboard.tsx        # Stats overview + navigation
│           ├── menu.tsx             # List all menu items
│           ├── menu-add.tsx         # Create new menu item
│           ├── menu-edit.tsx        # Edit existing menu item
│           ├── orders.tsx           # View incoming orders
│           ├── order-details.tsx    # Order details + status management
│           ├── payments.tsx         # Payment history and logs
│           ├── payment-qr.tsx       # Upload/manage payment QR code
│           ├── customers.tsx        # Subscribed customers list
│           ├── customer-add.tsx     # Add customer via access code
│           ├── apartments.tsx       # Delivery locations
│           └── apartment-add.tsx    # Create new apartment
├── src/
│   ├── api/                          # API layer
│   │   ├── authApi.ts               # Login, signup
│   │   ├── foodApi.ts               # Global foods (legacy)
│   │   ├── subscriptionApi.ts       # Customer-caterer relationships
│   │   ├── catererMenuApi.ts        # Caterer menu CRUD
│   │   ├── orderApi.ts              # Order management
│   │   ├── apartmentApi.ts          # Apartment/location management
│   │   └── deliveryApi.ts           # Delivery assignments
│   ├── context/
│   │   ├── AuthContext.tsx          # User authentication state
│   │   └── CartContext.tsx          # Shopping cart state
│   ├── components/
│   │   ├── [customer components]    # FoodCard, CuisineCard, etc.
│   │   └── caterer/                 # Caterer-specific components
│   │       ├── MenuItemCard.tsx
│   │       ├── OrderCard.tsx
│   │       ├── CustomerCard.tsx
│   │       ├── ApartmentCard.tsx
│   │       ├── StatsCard.tsx
│   │       └── DeliveryPersonModal.tsx
│   ├── types/                        # TypeScript type definitions
│   │   ├── auth.ts                  # User, Subscription, SignupData
│   │   ├── menu.ts                  # MenuItem, MenuFormData
│   │   ├── order.ts                 # Order (with status workflow)
│   │   ├── apartment.ts             # Apartment, CustomerApartment
│   │   └── delivery.ts              # DeliveryAssignment
│   ├── utils/                        # Utilities
│   │   ├── orderStorage.ts          # AsyncStorage order persistence
│   │   └── mockRazorpay.ts          # Payment simulation
│   └── config/
│       └── razorpay.ts              # Razorpay test credentials
├── backend/
│   └── db.json                       # JSON Server database (9 collections)
└── assets/                           # Images and static files
```

### Authentication & Routing Flow

The app uses Expo Router with file-based routing and **role-based route separation**:

**Root Guard** (`app/index.tsx`):
- Not authenticated → Redirect to `/login`
- Customer → Redirect to `/(authenticated)/customer/caterer-selection`
- Caterer → Redirect to `/(authenticated)/caterer/dashboard`

**Protected Route Guard** (`app/(authenticated)/_layout.tsx`):
- Checks authentication, redirects to login if not authenticated
- **Customer role**: Redirects to `/(authenticated)/customer/` if not already there
- **Caterer role**: Redirects to `/(authenticated)/caterer/` if not already there
- Uses `<Slot />` to render child layouts (customer or caterer)

**Customer Layout** (`app/(authenticated)/customer/_layout.tsx`):
- Bottom tab navigation: Home, Search, Cart, Orders
- Uses `usePathname()` to highlight active tab

**Caterer Layout** (`app/(authenticated)/caterer/_layout.tsx`):
- Stack navigation (no bottom tabs)
- Dashboard-based navigation with cards linking to features

### State Management

**Auth Context** (`src/context/AuthContext.tsx`):
- Manages `user` (User | null) and `selectedCatererId` (for customers)
- Provides `login(phone)`, `signup(data)`, `logout()`, `setSelectedCatererId(id)`
- `isAuthenticated` is derived state (`user !== null`), not separately managed
- Wrapped at root level in `app/_layout.tsx`

**Cart Context** (`src/context/CartContext.tsx`):
- Manages cart items with quantity tracking and real-time totals
- Provides `addToCart(item)`, `removeFromCart(id)`, `clearCart()`
- Persists to AsyncStorage with dual useEffect pattern:
  - On mount: Load cart from storage
  - On change: Save cart to storage (only after initial load)
- Wrapped at root level in `app/_layout.tsx`

### API Layer & Backend

**Backend**: JSON Server (`backend/db.json`) running on `http://192.168.1.25:5000`

**Database Collections** (9 total):
- `cuisines` - Cuisine categories (8 items)
- `foods` - Legacy global food items (33 items) - **Customer flow now uses caterer_menus instead**
- `users` - User accounts (phone, role, name, serviceName?, address?)
- `subscriptions` - Customer-caterer relationships (customerId, catererId)
- `caterer_menus` - **Caterer-specific menu items with date-based availability**
- `orders` - Orders placed by customers (now stored in backend, not just AsyncStorage)
- `apartments` - Delivery locations managed by caterers (id, catererId, name, address, accessCode)
- `customer_apartments` - Links customers to apartments (customerId, apartmentId, catererId, addedVia)
- `delivery_assignments` - Links delivery persons to orders (orderId, deliveryPersonId, status)

**API Modules**:

| Module | Key Functions | Collections Used |
|--------|---------------|------------------|
| `authApi.ts` | `loginUser(phone)` - GET `/users?phone=...`<br>`signupCaterer(data)` - POST `/users`<br>`getUserById(userId)` - GET `/users/{id}`<br>`updatePaymentQrCode(userId, qrCodeUrl)` - PATCH `/users/{id}` | `users` |
| `foodApi.ts` | **Legacy**: `getAllFoods()`, `getVegFood()`, `getNonVegFood()`, `getTrending()`, `searchFood(text)` | `foods` |
| `subscriptionApi.ts` | `getCustomerSubscriptions(customerId)`<br>`getCatererDetails(catererId)` | `subscriptions`, `users` |
| `catererMenuApi.ts` | `getCatererMenuItems(catererId)`<br>`getMenuItemsByDate(catererId, date)` - filters by availableDates<br>`createMenuItem()`, `updateMenuItem()`, `deleteMenuItem()`<br>`toggleStock(id, inStock)` | `caterer_menus` |
| `orderApi.ts` | `createOrder(order)` - POST `/orders`<br>`getOrdersByCustomer(customerId)`<br>`getOrdersByCaterer(catererId)`<br>`updateOrderStatus(id, status)` | `orders` |
| `apartmentApi.ts` | `getCatererApartments(catererId)`<br>`createApartment(data)`, `deleteApartment(id)`<br>`linkCustomerToApartment()` via access code | `apartments`, `customer_apartments` |
| `deliveryApi.ts` | `assignDeliveryPerson(orderId, deliveryPersonId)`<br>`getDeliveryAssignments(deliveryPersonId)` | `delivery_assignments` |

**JSON Server Query Patterns**:
- Filtering: `?category=veg` or `?catererId=2`
- Full-text search: `?q=search_term`
- Limiting: `?_limit=5`
- HTTP Methods: GET (read), POST (create), PUT (full update), PATCH (partial update), DELETE

**Important**: All API files have hardcoded `BASE_URL = "http://192.168.1.25:5000"`. Update in **all 7 API files** when backend IP/port changes.

### Type Definitions

**Core Types** (`src/types/`):

| Type | File | Key Fields |
|------|------|------------|
| `User` | `auth.ts` | `id`, `phone`, `role: "customer" \| "caterer" \| "delivery_person"`, `name`, `serviceName?`, `address?`, `paymentQrCode?` (caterer's UPI/GPay QR code URL) |
| `Subscription` | `auth.ts` | `id`, `customerId`, `catererId` |
| `SignupData` | `auth.ts` | Registration form data (name, phone, serviceName, address) |
| `MenuItem` | `menu.ts` | `id`, `catererId`, `name`, `price`, `category: "veg" \| "non-veg"`, `cuisine`, `type: "breakfast" \| "lunch" \| "dinner" \| "snack" \| "main_course"`, `image`, `description`, **`availableDates: string[]`** (YYYY-MM-DD), `inStock`, `createdAt` |
| `MenuFormData` | `menu.ts` | Form-compatible version of MenuItem |
| `Order` | `order.ts` | `id?`, `orderId` (client-generated), `customerId`, `catererId`, `items: CartItem[]`, `totalAmount`, `paymentMethod: "upi" \| "cod"`, `transactionId?`, `deliveryAddress?`, `deliveryPersonId?`, `itemCount`, `orderDate`, **`deliveryDate?`** (YYYY-MM-DD), **`status: "pending" \| "confirmed" \| "preparing" \| "out_for_delivery" \| "delivered" \| "cancelled"`**, `createdAt?` |
| `Apartment` | `apartment.ts` | `id`, `catererId`, `name`, `address`, `accessCode`, `createdAt` |
| `CustomerApartment` | `apartment.ts` | `id`, `customerId`, `apartmentId`, `catererId`, `addedVia: "code" \| "manual"`, `createdAt` |
| `DeliveryAssignment` | `delivery.ts` | `id`, `orderId`, `deliveryPersonId`, `status`, timestamps |
| `FoodItem` | `FoodCard.tsx` | **Legacy type** for global foods (id, name, price, rating, category, cuisine, image, description) |
| `CartItem` | `CartContext.tsx` | `FoodItem & { quantity: number }` |

### Key Components

**Customer Components** (`src/components/`):
| Component | Purpose |
|-----------|---------|
| `FoodCard.tsx` | Food item card (defines legacy `FoodItem` type) |
| `CategoryButton.tsx` | Veg/Non-Veg filter buttons |
| `CuisineCard.tsx` | Cuisine category cards |
| `CatererCard.tsx` | Caterer selection cards |
| `PaymentBottomSheet.tsx` | Payment method modal (UPI/COD) |
| `QrCodePaymentModal.tsx` | Real QR code payment interface for customers |
| `SearchResult.tsx` | Horizontal search result item |
| `Result.tsx` | Vertical list search result item |
| `DayFilterModal.tsx` | Day selection modal (Today/Tomorrow/Week) |
| `Header.tsx` | Common header component |

**Caterer Components** (`src/components/caterer/`):
| Component | Purpose |
|-----------|---------|
| `MenuItemCard.tsx` | Display caterer menu item with edit/delete/stock toggle |
| `OrderCard.tsx` | Display order summary in orders list |
| `CustomerCard.tsx` | Display subscribed customer info |
| `ApartmentCard.tsx` | Display apartment/location with delete option |
| `StatsCard.tsx` | Dashboard stat card (orders, revenue, etc.) |
| `PaymentCard.tsx` | Payment transaction display |
| `DeliveryPersonModal.tsx` | Assign delivery person to order |
| `ItemHistoryModal.tsx` | Display previously created menu items for reuse |

### Critical Data Flow Patterns

**1. Customer Ordering Flow**:
```
Select Caterer → Select Date (Today/Tomorrow/Week)
  → Browse caterer_menus filtered by date and catererId
  → Add items to cart (CartContext)
  → Checkout: Select payment method (PaymentBottomSheet)
  → If UPI:
    - Check if caterer has uploaded paymentQrCode
    - If yes: Show QrCodePaymentModal with caterer's QR code
    - Customer scans QR code using their UPI app (GPay/PhonePe/Paytm)
    - Customer completes payment externally
    - Customer enters transaction ID from payment app
    - App confirms order with transaction ID
    - ⚠️ Disclaimer shown: "App does not provide payment security"
    - If no QR code: Show alert to use COD instead
  → If COD: Direct confirmation (transaction ID = "N/A")
  → POST order to backend (/orders)
  → Navigate to orderconfirm
  → Clear cart
```

**2. Caterer Menu Management**:
```
Create/Edit Menu Item:
  → Option 1 (New Item): Fill form with name, price, category (veg/non-veg), cuisine, type, description, image
  → Option 2 (Reuse Item): Click "Reuse Previous Item" button
    → Opens ItemHistoryModal showing all previously created items
    → Select an item to auto-fill form fields (except dates)
    → Modify any fields as needed
  → Select multiple available dates (date picker array)
  → Set inStock status
  → POST/PUT to /caterer_menus with catererId

View Menu:
  → GET /caterer_menus?catererId={id}
  → Toggle stock: PATCH /caterer_menus/{id} with { inStock }
  → Delete: DELETE /caterer_menus/{id}
```

**3. Order Status Workflow** (Caterer → Customer):
```
pending → confirmed → preparing → out_for_delivery → delivered
                   ↘ cancelled (anytime)
```
Caterer updates status via `updateOrderStatus(id, status)` in order-details screen.

**4. Apartment/Location Management**:
```
Caterer creates apartment with accessCode
  → Customer enters accessCode to join
  → linkCustomerToApartment() creates customer_apartments record
  → Used for delivery address selection
```

**5. Date-Based Menu Filtering** (Critical for customer experience):
```typescript
// Customer selects date → Filter menu items
getMenuItemsByDate(catererId, "2026-01-12")
  → Returns only items where availableDates includes "2026-01-12"
  → AND inStock === true
```

**5a. Payment History Management** (Caterer):
```
View Payment History:
  → GET /orders?catererId={id} - Fetch all orders
  → For each unique customerId, GET /users/{customerId} to get customer name
  → Display payments with filters:
    - All: Show all orders
    - Received: UPI payments with status="delivered"
    - Pending: COD payments or non-delivered orders
    - UPI: Filter by paymentMethod="upi"
    - COD: Filter by paymentMethod="cod"
  → Stats shown:
    - Total Revenue: Sum of all delivered orders
    - Received Payments: Sum of delivered UPI orders
    - Pending Payments: Sum of non-delivered or COD orders
```

**5b. QR Code Payment Setup** (Caterer):
```
Upload Payment QR Code:
  → Caterer navigates to Dashboard → Payment QR
  → Opens payment-qr.tsx screen
  → Steps:
    1. Caterer takes screenshot of their GPay/PhonePe/Paytm QR code
    2. Uploads QR image to image hosting service (Imgur, ImgBB, etc.)
    3. Copies direct image URL
    4. Pastes URL in app
    5. Previews QR code
    6. Saves: PATCH /users/{id} with { paymentQrCode: url }
  → QR code stored in caterer's user record
  → Customers can now scan this QR to pay
  → Can update or remove QR code anytime
```

**6. URL Parameter Serialization** (for navigation with complex objects):
```typescript
// Sending complex objects via navigation
router.push({
  pathname: "/details",
  params: {
    id: String(item.id),
    name: item.name,
    image: JSON.stringify(item.image),  // JSON serialize arrays/objects
    availableDates: JSON.stringify(item.availableDates),
  }
});

// Receiving
const params = useLocalSearchParams();
const item: MenuItem = {
  id: Number(params.id),
  name: params.name as string,
  image: JSON.parse(params.image as string),
  availableDates: JSON.parse(params.availableDates as string),
};
```

**7. Order Persistence** (Hybrid approach):
- **Backend**: Primary storage via `orderApi.ts` POST `/orders`
- **AsyncStorage** (`src/utils/orderStorage.ts`): Local backup/offline support
  - `saveOrder(order)` - Prepends to array
  - `getOrders()` - Returns orders (newest first)
  - Order IDs: `ORD[timestamp][random]`
  - Transaction IDs: `txn_[timestamp]_[random]` or "N/A"

### Styling System

**Framework**: React Native StyleSheet API (no CSS-in-JS)

**Color Palette**:
- Primary: `#10B981` (green)
- Background: `#F8F8F8`
- Card: `#FFFFFF`
- Text: `#1A1A1A` (primary), `#6B7280` (secondary)
- Borders: `#E5E7EB`
- Veg indicator: `#10B981` (green dot)
- Non-veg indicator: `#EF4444` (red dot)

**Design Patterns**:
- Border radius: 12px (cards)
- Spacing: 16px base unit
- Elevation/Shadow: 2-4 (subtle depth)
- Icons: Ionicons from `@expo/vector-icons`
- Animations: `react-native-reanimated` (see `PaymentBottomSheet`)

## Configuration

**TypeScript** (`tsconfig.json`):
- Strict mode enabled
- Path alias: `@/*` → project root

**Expo** (`app.json`):
- New Architecture: Enabled
- React Compiler: Enabled (experimental)
- Typed Routes: Enabled (experimental)
- Deep linking scheme: `deliveryapp://`
- Android: Edge-to-edge enabled, predictive back gesture disabled

**ESLint** (`eslint.config.js`):
- Uses `eslint-config-expo`

## Payment Integration

This app uses a **real QR code-based payment system** where caterers upload their UPI/GPay QR codes and customers scan them to pay directly.

**⚠️ Security Disclaimer**: The app displays a prominent warning that it does not provide payment security. Payments are made directly between customer and caterer outside the app.

**QR Code Payment Modal** (`src/components/QrCodePaymentModal.tsx`):
- Displays caterer's uploaded QR code
- Shows security disclaimer about payment safety
- Customers scan QR using their own UPI app (GPay, PhonePe, Paytm, BHIM)
- Payment happens externally in customer's UPI app
- Customer manually enters transaction ID after payment
- No payment processing happens within the app

**Payment QR Upload Screen** (`app/(authenticated)/caterer/payment-qr.tsx`):
- Caterers upload QR code image URL
- Preview QR code before saving
- Update or remove QR code anytime
- Stored in `users` table: `paymentQrCode` field

**Payment Bottom Sheet** (`src/components/PaymentBottomSheet.tsx`):
- Modal with UPI and Cash on Delivery options
- For UPI: Checks if caterer has uploaded QR code
  - If yes: Opens `QrCodePaymentModal`
  - If no: Shows alert to use COD instead
- Direct confirmation for COD (transaction ID = "N/A")

**Payment Flow**:
1. **Caterer Setup**: Upload QR code via Dashboard → Payment QR
2. **Customer Payment**: Select UPI → Scan QR → Pay externally → Enter transaction ID
3. **No Payment Processing**: App only stores transaction ID as reference
4. **Security**: Customer warned that app provides no payment security

## Important Development Notes

### Architecture Principles
1. **Role-Based Route Separation**: Customer and caterer screens are in completely separate route groups (`/customer/` vs `/caterer/`)
2. **Date-Driven Menus**: Menu items use `availableDates` array for scheduling. Always filter by date when displaying to customers.
3. **Hybrid Data Persistence**: Orders stored in both backend (primary) and AsyncStorage (offline backup)
4. **URL Parameter Serialization**: Always JSON.stringify/parse complex objects (arrays, nested objects) when passing via Expo Router navigation
5. **Derived Auth State**: `isAuthenticated` is derived from `user !== null`, not separately managed

### Current Limitations
- **Authentication**: Phone number only (no OTP verification, no password)
- **Image Upload**: Images use URLs (no file upload, uses Unsplash URLs or image hosting links)
- **QR Code Upload**: Requires external image hosting (Imgur, ImgBB, etc.) for QR codes
- **Payment Security**: No payment processing or verification - customers pay directly to caterers
- **Real-time Updates**: No WebSocket/polling for order status changes
- **Search**: Legacy `foodApi.ts` search still uses global `foods` collection instead of `caterer_menus`
- **Delivery Person UI**: Delivery person role exists in data model but has no UI implementation yet

### Critical Patterns to Follow

**When working with caterer menus**:
- Always include `catererId` when creating/fetching menu items
- Always filter by `availableDates` array when showing menus to customers
- Check `inStock` status before displaying items to customers

**When working with orders**:
- Generate client-side `orderId` (format: `ORD[timestamp][random]`)
- Include `deliveryDate` (YYYY-MM-DD format) for scheduling
- Always update both backend (POST/PATCH) AND AsyncStorage
- Follow status workflow: `pending → confirmed → preparing → out_for_delivery → delivered`

**When implementing date selection**:
- Use YYYY-MM-DD string format for dates (not Date objects)
- Filter `availableDates` arrays with `.includes(selectedDate)`
- DayFilterModal pattern: "Today" | "Tomorrow" | "This Week"

**When updating BASE_URL**:
- Must update in all 7 API files: authApi, foodApi, subscriptionApi, catererMenuApi, orderApi, apartmentApi, deliveryApi
- Consider creating shared config: `src/config/api.ts` with `export const BASE_URL = "..."`

### Test Data (backend/db.json)
- **Customer**: `+919876543210` (id: 1)
- **Caterers**: `+919123456789` (id: 2, "Spice Kitchen"), `+919111111111` (id: 3)
- Customer 1 has subscriptions to both caterers
- 8 cuisines, 33 legacy foods, caterer_menus with date-based items
- Multiple apartments with access codes for customer onboarding

### Known Issues
1. **Cart Type Mismatch**: CartContext uses legacy `FoodItem` type, but customer flow now uses `MenuItem`. May cause type conflicts.
2. **Dual Menu System**: Both `foods` (legacy) and `caterer_menus` (current) exist. Customer flow uses caterer_menus, but search may still use foods.
3. **AsyncStorage Sync**: No sync mechanism between AsyncStorage and backend on app launch. Offline orders may not sync.

### Production Readiness TODOs
1. **Fix Cart Types**: Update CartContext to use `MenuItem` instead of `FoodItem`
2. **Consolidate Menu System**: Remove legacy `foods` collection and `foodApi.ts`, migrate all to `caterer_menus`
3. **Implement Delivery UI**: Create delivery person screens for viewing/updating assignments
4. **Add Real-time Updates**: WebSocket or polling for order status changes
5. **Implement OTP Authentication**: Replace phone-only login with OTP verification
6. **Add Image Upload**: Replace URL-based images with file upload to cloud storage (for menu items and QR codes)
7. **Create Shared API Config**: Centralize BASE_URL in `src/config/api.ts`
8. **Add Offline Sync**: Sync AsyncStorage orders with backend on app launch
9. **Payment Gateway Integration**: Consider integrating proper payment gateway (Razorpay, Stripe) for secure payment processing
10. **Payment Verification**: Add backend payment verification system to validate transaction IDs
11. **Add Push Notifications**: Notify caterers of new orders, customers of status changes
