# KaasproFoods Application - Skeletal Workflow Structure

**Date Generated:** February 18, 2026

---

## 🏗️ High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    KAASPRO FOODS APP                        │
│                   (React Native + Expo)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────▼────────┐  ┌───────▼────────┐
            │   Frontend     │  │    Backend     │
            │ (delivery-app) │  │ (backend-api)  │
            └────────────────┘  └────────────────┘
```

---

## 📱 FRONTEND WORKFLOW (delivery-app)

### 1. ENTRY POINT & AUTHENTICATION LAYER

```
app/index.tsx (Entry Point)
    │
    ├─→ Check AsyncStorage for saved user
    │
    ├─→ useAuth() Context Check
    │   │
    │   ├─ Not Authenticated → /login
    │   │
    │   └─ Authenticated → Role-based Redirect
    │       │
    │       ├─ CUSTOMER → /(authenticated)/customer/caterer-selection
    │       ├─ CATERER → /(authenticated)/caterer/dashboard
    │       └─ DELIVERY_PERSON → /delivery-dashboard (planned)
    │
    └─→ app/login.tsx
        │
        ├─ User enters phone number
        ├─ API Call: loginUser(phone)
        ├─ Check PIN (backend validation)
        └─ Save JWT token + user data
            │
            └─→ app/signup.tsx (if new user)
                │
                ├─ Caterer Type Selection:
                │  ├─ Home Kitchen
                │  └─ Restaurant
                │
                ├─ Fill form data
                ├─ Upload profile/QR image (Cloudinary)
                └─ Create account → Auto login
```

---

### 2. CUSTOMER WORKFLOW

```
Customer Entry: /(authenticated)/customer/caterer-selection
    │
    ├─→ Browse & Select Caterer
    │   ├─ View list of subscribed caterers
    │   ├─ Select one to start ordering
    │   └─ Set selectedCatererId in AuthContext
    │
    └─→ /(authenticated)/customer/index.tsx (Home/Menu Browse)
        │
        ├─ FILTERS:
        │  ├─ By Date (Day Filter Modal)
        │  ├─ By Meal Type (Breakfast/Lunch/Dinner/Snack)
        │  └─ By Category (Veg/Non-Veg)
        │
        ├─ API: getMenuItemsByDate(catererId, date)
        │
        ├─ DISPLAY: FoodCard Components
        │  ├─ Item name, price, image
        │  ├─ Add to Cart button
        │  └─ View Details
        │
        ├─ CART MANAGEMENT (CartContext):
        │  ├─ addToCart(item)
        │  ├─ removeFromCart(itemId)
        │  ├─ updateQuantity(itemId, qty)
        │  └─ totalAmount (computed)
        │
        └─→ Multiple screens in Tab Navigation:
            ├─ HOME (Browse Menu)
            ├─ SEARCH (Trending items + filters)
            ├─ CART (Review items + checkout)
            ├─ ORDERS (Order history)
            └─ PROFILE (User settings)
                │
                └─→ Additional Routes:
                    ├─ /details (Food item detail)
                    ├─ /cuisinedetails (Cuisine-filtered)
                    ├─ /orderconfirm (Post-checkout)
                    └─ /orderdetails (Individual order view)

Cart Flow:
    Customer adds items → /(authenticated)/customer/cart
        │
        ├─ Review items + quantities
        ├─ See total amount (₹)
        ├─ CHECKOUT:
        │   ├─ Choose Payment Method:
        │   │  ├─ UPI (Razorpay - test mode)
        │   │  └─ COD (Cash on Delivery)
        │   │
        │   ├─ API: createOrder({
        │   │    catererId,
        │   │    items[],
        │   │    totalAmount,
        │   │    paymentMethod,
        │   │    status: 'pending'
        │   │  })
        │   │
        │   └─→ orderconfirm.tsx (Success screen)
        │       │
        │       └─ Display order details + tracking
        │
        └─ View in Orders section with status tracking

Restaurant QR Ordering (Alternative Flow):
    app/qr-scanner.tsx
        │
        ├─ Camera permission check
        ├─ Scan table QR code
        ├─ Decode table ID
        │
        └─→ app/restaurant-menu.tsx
            │
            ├─ Browse restaurant menu
            ├─ Add items to cart
            └─→ Checkout with table reference
                │
                └─ Order linked to table (no delivery address needed)
```

---

### 3. CATERER WORKFLOW

```
Caterer Entry: /(authenticated)/caterer/dashboard
    │
    ├─ DASHBOARD STATS:
    │  ├─ Today's orders count
    │  ├─ Revenue
    │  ├─ Active subscriptions
    │  └─ Quick action cards
    │
    └─→ MAIN FEATURES (Action Cards):
        │
        ├─ [1] MENU MANAGEMENT
        │  └─→ /(authenticated)/caterer/menu.tsx
        │      │
        │      ├─ View all menu items by category
        │      ├─ Refresh to reload
        │      │
        │      ├─ Per Item Actions:
        │      │  ├─ Edit (menu-edit.tsx)
        │      │  ├─ Delete
        │      │  └─ Toggle Stock (In Stock ↔ Out of Stock)
        │      │
        │      └─ ADD NEW ITEM:
        │         └─→ /(authenticated)/caterer/menu-add.tsx
        │            │
        │            ├─ Form Data:
        │            │  ├─ Name, Description
        │            │  ├─ Price
        │            │  ├─ Category (Veg/Non-Veg)
        │            │  ├─ Cuisine type
        │            │  ├─ Meal Type (main/side/dessert)
        │            │  ├─ Image (Cloudinary upload)
        │            │  ├─ Select Available Dates (date picker)
        │            │  └─ Stock status
        │            │
        │            ├─ REUSE PREVIOUS ITEMS:
        │            │  └─ ItemHistoryModal
        │            │     │
        │            │     ├─ Show previously created items
        │            │     ├─ Click to auto-fill form
        │            │     ├─ Modify fields as needed
        │            │     └─ Change dates/dates only
        │            │
        │            ├─ Validation check
        │            ├─ API: createMenuItem()
        │            └─ Success → Back to menu list
        │
        ├─ [2] ORDER MANAGEMENT
        │  └─→ /(authenticated)/caterer/orders.tsx
        │      │
        │      ├─ View all incoming orders
        │      ├─ Filter by status:
        │      │  ├─ Pending
        │      │  ├─ Preparing
        │      │  ├─ Ready
        │      │  └─ Delivered
        │      │
        │      └─ OrderCard (per order):
        │         │
        │         ├─ Customer name
        │         ├─ Items ordered
        │         ├─ Order total
        │         ├─ Current status
        │         │
        │         └─→ /(authenticated)/caterer/order-details.tsx
        │            │
        │            ├─ Full order details
        │            ├─ Customer delivery address
        │            ├─ Items breakdown
        │            │
        │            ├─ STATUS UPDATE:
        │            │  └─ Update order status
        │            │     │
        │            │     ├─ API: updateOrderStatus(orderId, status)
        │            │     └─ Trigger push notifications to customer
        │            │
        │            └─ Delivery Address Display
        │
        ├─ [3] CUSTOMER MANAGEMENT
        │  └─→ /(authenticated)/caterer/customers.tsx
        │      │
        │      ├─ View subscribed customers list
        │      ├─ CustomerCard (per customer):
        │      │  ├─ Name, phone
        │      │  ├─ Subscription status
        │      │  └─ Associated apartments
        │      │
        │      └─ /(authenticated)/caterer/customer-add.tsx
        │         │
        │         ├─ Generate access code
        │         ├─ Share with customer
        │         ├─ Customer enters code in app
        │         │
        │         └─ MANUAL ADD:
        │            ├─ Enter customer phone
        │            └─ Create subscription
        │
        ├─ [4] APARTMENT/DELIVERY LOCATION MANAGEMENT
        │  └─→ /(authenticated)/caterer/apartments.tsx
        │      │
        │      ├─ View all delivery locations
        │      ├─ ApartmentCard (per location):
        │      │  ├─ Name/Address
        │      │  ├─ Access code
        │      │  └─ Associated customers
        │      │
        │      └─ /(authenticated)/caterer/apartment-add.tsx
        │         │
        │         ├─ Form:
        │         │  ├─ Apartment name
        │         │  ├─ Address details
        │         │  └─ Generate access code
        │         │
        │         ├─ Validate address
        │         ├─ API: createApartment()
        │         └─ Generate shareable code
        │
        ├─ [5] PAYMENT MANAGEMENT
        │  └─→ /(authenticated)/caterer/payments.tsx
        │      │
        │      ├─ View payment history
        │      ├─ Filter by date period
        │      ├─ Revenue statistics
        │      │
        │      └─ Transaction details:
        │         ├─ Order reference
        │         ├─ Amount
        │         ├─ Payment method
        │         └─ Timestamp
        │
        ├─ [6] PAYMENT QR CODE
        │  └─→ /(authenticated)/caterer/payment-qr.tsx
        │      │
        │      ├─ Upload/manage payment QR
        │      ├─ Used for COD payments
        │      │
        │      └─ Actions:
        │         ├─ Upload new QR (Cloudinary)
        │         ├─ View current QR
        │         └─ Remove/Replace QR
        │
        └─ [7] RESTAURANT FEATURES (Subscription feature)
           └─→ /(authenticated)/caterer/restaurant/ (if caterer_type = 'restaurant')
               │
               ├─ Tables Management
               │  └─ /(authenticated)/caterer/restaurant/tables.tsx
               │     │
               │     ├─ View all tables
               │     ├─ Create/Edit/Delete tables
               │     │
               │     └─ Per Table:
               │        ├─ Table number
               │        ├─ QR code (generated)
               │        ├─ Status (occupied/free)
               │        │
               │        └─ /(authenticated)/caterer/restaurant/table-qr-view.tsx
               │           │
               │           ├─ Display QR code
               │           ├─ Generate new QR (regenerate)
               │           ├─ Download QR image
               │           └─ File system operations (save QR)
               │
               ├─ Restaurant Menu (Separate from subscription)
               │  └─ /(authenticated)/caterer/restaurant/menu.tsx
               │     │
               │     ├─ Simpler workflow (no date selection needed)
               │     ├─ Always available items
               │     └─ Similar CRUD operations
               │
               └─ Restaurant Orders
                  └─ Filtered by table ID
```

---

### 4. GLOBAL STATE MANAGEMENT

```
Context API Layer:
    │
    ├─ AuthContext (src/context/AuthContext.tsx)
    │  ├─ State:
    │  │  ├─ user (User | null)
    │  │  ├─ isAuthenticated (boolean)
    │  │  ├─ selectedCatererId (for customers)
    │  │  └─ loading
    │  │
    │  └─ Methods:
    │     ├─ login(phone) → API call → Save JWT + user
    │     ├─ logout() → Clear state + AsyncStorage
    │     ├─ signup(data) → API call → Auto login
    │     ├─ setSelectedCaterer(catererId)
    │     └─ autoLogin() → Check AsyncStorage on app start
    │
    └─ CartContext (src/context/CartContext.tsx)
       ├─ State:
       │  ├─ items (CartItem[])
       │  ├─ totalAmount (computed)
       │  └─ loading
       │
       └─ Methods:
          ├─ addToCart(item)
          ├─ removeFromCart(itemId)
          ├─ updateQuantity(itemId, qty)
          ├─ clearCart()
          ├─ getTotalAmount() → useMemo
          └─ persistToStorage() → AsyncStorage
```

---

### 5. API LAYER STRUCTURE

```
src/api/ (All API calls from here)
    │
    ├─ authApi.ts
    │  ├─ loginUser(phone)
    │  ├─ signupUser(userData)
    │  ├─ logoutUser()
    │  ├─ validatePin(phone, pin)
    │  └─ refreshToken()
    │
    ├─ catererMenuApi.ts
    │  ├─ getCatererMenuItems(catererId)
    │  ├─ getMenuItemsByDate(catererId, date)
    │  ├─ createMenuItem(menuData)
    │  ├─ updateMenuItem(itemId, newData)
    │  ├─ deleteMenuItem(itemId)
    │  ├─ toggleStock(itemId, inStock)
    │  └─ getCatererCuisines(catererId)
    │
    ├─ orderApi.ts
    │  ├─ createOrder(orderData)
    │  ├─ getOrdersByCustomer(customerId)
    │  ├─ getOrdersByCaterer(catererId)
    │  ├─ getOrderDetails(orderId)
    │  ├─ updateOrderStatus(orderId, status)
    │  └─ deleteOrder(orderId)
    │
    ├─ subscriptionApi.ts
    │  ├─ getSubscribedCaterers(customerId)
    │  ├─ createSubscription(customerId, catererId)
    │  ├─ deleteSubscription(subscriptionId)
    │  └─ generateAccessCode(catererId)
    │
    ├─ apartmentApi.ts
    │  ├─ createApartment(apartmentData)
    │  ├─ getApartments(catererId)
    │  ├─ deleteApartment(apartmentId)
    │  ├─ linkCustomerToApartment(customerId, accessCode)
    │  └─ getCustomerApartments(customerId)
    │
    └─ deliveryApi.ts (Planned)
       ├─ getAssignedDeliveries(deliveryPersonId)
       ├─ updateDeliveryStatus(deliveryId, status)
       └─ trackOrder(orderId)
```

---

### 6. TYPE SYSTEM

```
src/types/ (TypeScript Interfaces)
    │
    ├─ auth.ts
    │  ├─ User (id, phone, role, name, serviceName, address, profilePicture)
    │  ├─ SignupData
    │  └─ Subscription
    │
    ├─ menu.ts
    │  ├─ MenuItem (id, name, price, category, cuisine, image, dates, inStock)
    │  ├─ MenuFormData
    │  └─ MealType
    │
    ├─ order.ts
    │  ├─ Order (id, customerId, catererId, items, total, status, timestamp)
    │  ├─ OrderItem
    │  └─ OrderStatus
    │
    ├─ apartment.ts
    │  ├─ Apartment
    │  └─ CustomerApartment
    │
    └─ audit.ts
       ├─ AuditLog (Complete audit trail)
       ├─ ActionType (All loggable actions)
       └─ AuditLogStats
```

---

### 7. ROUTING STRUCTURE (Expo Router - File-based)

```
app/
│
├─ _layout.tsx (Root → Providers wrapper)
│  ├─ AuthProvider
│  └─ CartProvider
│
├─ index.tsx (Entry/Redirect logic)
│
├─ login.tsx
├─ signup.tsx
├─ caterer-type-selection.tsx
├─ restaurant-signup.tsx
├─ qr-scanner.tsx
├─ restaurant-menu.tsx
│
└─ (authenticated)/ (Route group - Protected)
   │
   ├─ _layout.tsx (Auth guard)
   │
   ├─ customer/
   │  ├─ _layout.tsx (Tabs navigation)
   │  ├─ index.tsx (Home/Browse)
   │  ├─ search.tsx
   │  ├─ cart.tsx
   │  ├─ orders.tsx
   │  ├─ profile.tsx
   │  ├─ caterer-selection.tsx
   │  ├─ details.tsx
   │  ├─ cuisinedetails.tsx
   │  ├─ orderconfirm.tsx
   │  └─ orderdetails.tsx
   │
   └─ caterer/
      ├─ _layout.tsx (Stack navigation)
      ├─ dashboard.tsx
      ├─ menu.tsx
      ├─ menu-add.tsx
      ├─ menu-edit.tsx
      ├─ orders.tsx
      ├─ order-details.tsx
      ├─ customers.tsx
      ├─ customer-add.tsx
      ├─ apartments.tsx
      ├─ apartment-add.tsx
      ├─ payments.tsx
      ├─ payment-qr.tsx
      │
      └─ restaurant/
         ├─ _layout.tsx
         ├─ dashboard.tsx
         ├─ tables.tsx
         ├─ table-add.tsx
         ├─ table-qr-view.tsx
         ├─ menu.tsx
         ├─ menu-add.tsx
         └─ orders.tsx
```

---

## 🗄️ BACKEND WORKFLOW (backend-api)

```
Express.js Server (Node.js)
    │
    ├─ PORT: 5000 (Local) / Render.com (Production)
    │
    ├─ DATABASE: PostgreSQL
    │  ├─ users (id, phone, role, name, etc.)
    │  ├─ caterer_menus (menu items per caterer)
    │  ├─ orders (order history + status)
    │  ├─ subscriptions (customer-caterer relationships)
    │  ├─ apartments (delivery locations)
    │  ├─ cuisines (cuisine types)
    │  ├─ refresh_tokens (auth tokens)
    │  ├─ audit_logs (complete action history)
    │  └─ restaurant_tables (for restaurant vendors)
    │
    └─ API ROUTES & CONTROLLERS:
       │
       ├─ /api/auth (authController.js)
       │  ├─ POST /login → Validate phone + PIN
       │  ├─ POST /signup → Create user account
       │  ├─ POST /logout → Invalidate token
       │  ├─ POST /set-pin → Set/update PIN
       │  └─ POST /verify-token → Refresh JWT
       │
       ├─ /api/menus (menuController.js)
       │  ├─ GET /?catererId={id} → Get caterer's menu
       │  ├─ GET /?date={date} → Menu for specific date
       │  ├─ POST / → Create menu item
       │  ├─ PUT /{id} → Update menu item
       │  ├─ DELETE /{id} → Delete menu item
       │  └─ PATCH /{id}/stock → Toggle stock status
       │
       ├─ /api/orders (orderController.js)
       │  ├─ GET / → Get user's orders
       │  ├─ GET /{id} → Order details
       │  ├─ POST / → Create order
       │  ├─ PUT /{id} → Update order
       │  └─ DELETE /{id} → Cancel order
       │
       ├─ /api/subscriptions (subscriptionController.js)
       │  ├─ GET / → Get subscriptions
       │  ├─ POST / → Subscribe to caterer
       │  ├─ DELETE /{id} → Unsubscribe
       │  └─ POST /access-code → Generate access code
       │
       ├─ /api/apartments (apartmentController.js)
       │  ├─ GET / → Get all apartments
       │  ├─ POST / → Create apartment
       │  ├─ DELETE /{id} → Delete apartment
       │  └─ POST /link → Link customer to apartment
       │
       ├─ /api/cuisines (cuisineController.js)
       │  ├─ GET / → Get all cuisines
       │  ├─ POST / → Create cuisine
       │  └─ DELETE /{id} → Delete cuisine
       │
       ├─ /api/tables (restaurantTablesController.js)
       │  ├─ GET / → Get restaurant tables
       │  ├─ POST / → Create table(s)
       │  ├─ PUT /{id} → Update table
       │  ├─ DELETE /{id} → Delete table
       │  └─ POST /{id}/regenerate-qr → New QR code
       │
       ├─ /api/delivery (deliveryController.js - Planned)
       │  ├─ GET / → Get assigned deliveries
       │  ├─ PUT /{id}/status → Update delivery status
       │  └─ GET /{orderId}/track → Real-time tracking
       │
       └─ /api/audit (auditController.js)
          ├─ GET / → Get audit logs
          ├─ GET /stats → Audit statistics
          └─ POST / → Log action (internal)
```

---

## 🔄 COMPLETE FLOW EXAMPLE: Customer Ordering

```
1. User Launches App
   └─→ app/index.tsx
       └─ Checks AsyncStorage for auth
       └─ AuthContext loads user
       └─ Redirects to caterer-selection (customer)

2. Customer Selects Caterer
   └─→ setCatererId in AuthContext
       └─ Navigate to Home screen

3. Customer Browses Menu & Filters
   └─→ /(authenticated)/customer/index.tsx
       └─ Select date
       └─ API: getMenuItemsByDate(catererId, date)
       └─ Apply filters (meal type, category)
       └─ Display FoodCard components
       └─ User clicks "Add to Cart"

4. Add Items to Cart
   └─→ CartContext: addToCart(item)
       └─ Item added to items state
       └─ Persist to AsyncStorage
       └─ Show toast confirmation

5. View/Edit Cart
   └─→ /(authenticated)/customer/cart.tsx
       └─ Display all cart items
       └─ Show total amount
       └─ User clicks "Checkout"

6. Create Order & Payment
   └─→ Modal: Choose payment method
       ├─ UPI: Razorpay payment (test mode)
       └─ COD: Direct order
       
       └─→ API: createOrder({
           catererId,
           items[],
           totalAmount,
           paymentMethod,
           status: 'pending'
       })
       
       └─→ Backend:
           ├─ Insert into orders table
           ├─ Create audit log
           ├─ Trigger caterer notification
           └─ Return order ID

7. Order Confirmation
   └─→ /(authenticated)/customer/orderconfirm.tsx
       └─ Show order success
       └─ Display order tracking
       └─ ClearCart from CartContext

8. Caterer Receives Order (Realtime - Planned)
   └─→ Push notification
       └─ Order appears in /(authenticated)/caterer/orders.tsx
       └─ Caterer updates status (Preparing → Ready)
       └─ Customer notified of status change

9. Order Completion
   └─→ Customer tracks order
       └─ View order details
       └─ Rate/review order (planned)
```

---

## 🔐 SECURITY & AUDIT SYSTEM

```
Audit Trail (audit.ts + Backend):
    │
    ├─ Every action logged:
    │  ├─ User ID, Role, Phone
    │  ├─ Action type (LOGIN, CREATE_MENU, etc.)
    │  ├─ Entity details (what was changed)
    │  ├─ Old value ↔ New value
    │  ├─ IP address, User agent
    │  ├─ Success/Failure status
    │  └─ Timestamp
    │
    └─ Caterer can view audit logs (planned)
       └─ Track all activities on account
```

---

## 📊 DATA FLOW SUMMARY

```
User Action in Component
    ↓
Call API Function (src/api/)
    ↓
HTTP Request to Backend (Express.js)
    ↓
Backend Route Handler (Controller)
    ↓
Database Query (PostgreSQL)
    ↓
Audit Log Creation
    ↓
Response JSON
    ↓
Update State (useState/Context)
    ↓
Component Re-renders
    ↓
User Sees Update
```

---

## 🎯 KEY FEATURES SUMMARY

| Feature | Status | Location |
|---------|--------|----------|
| **User Authentication** | ✅ Complete | app/login.tsx, authApi.ts |
| **Multi-role Support** | ✅ Complete | AuthContext, routing |
| **Customer Menu Browsing** | ✅ Complete | customer/index.tsx |
| **Caterer Menu Management** | ✅ Complete | caterer/menu.tsx |
| **Order Management** | ✅ Complete | order.tsx, orderApi.ts |
| **Payment (UPI)** | ✅ Complete | Razorpay integration |
| **Subscription Management** | ✅ Complete | subscriptionApi.ts |
| **Apartment/Delivery Locations** | ✅ Complete | apartmentApi.ts |
| **Restaurant Tables** | ✅ Complete | caterer/restaurant/ |
| **QR Code Scanning** | ✅ Complete | app/qr-scanner.tsx |
| **Image Upload** | ✅ Complete | Cloudinary integration |
| **Audit Logging** | ✅ Complete | audit.ts, backend |
| **Real-time Notifications** | 📝 Planned | Push Tokens |
| **Delivery Tracking** | 📝 Planned | deliveryApi.ts |
| **Rating & Reviews** | 📝 Planned | - |

---

**End of Document**
