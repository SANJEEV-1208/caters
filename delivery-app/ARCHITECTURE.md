# Application Architecture - KaasproFoods

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App (Expo)                      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Customer   │  │   Caterer    │  │   Delivery   │    │
│  │     App      │  │     App      │  │    Person    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
│                    ┌───────▼────────┐                      │
│                    │  Context API   │                      │
│                    │  (Auth, Cart)  │                      │
│                    └───────┬────────┘                      │
│                            │                                │
│                    ┌───────▼────────┐                      │
│                    │   API Layer    │                      │
│                    └───────┬────────┘                      │
└────────────────────────────┼────────────────────────────────┘
                             │
                      HTTP/REST API
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    Backend Server                           │
│                  (Node.js + Express)                        │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │   Menu   │  │  Orders  │  │ Delivery │  │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       └─────────────┼─────────────┼─────────────┘          │
│                     │             │                         │
│              ┌──────▼─────────────▼──────┐                 │
│              │     PostgreSQL DB         │                 │
│              └───────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  External Services                          │
│                                                             │
│  ┌──────────────┐              ┌──────────────┐            │
│  │  Cloudinary  │              │  UPI Gateway │            │
│  │ (Images/QR)  │              │  (Payments)  │            │
│  └──────────────┘              └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 App Flow Architecture

### User Authentication Flow
```
┌─────────┐
│  Start  │
└────┬────┘
     │
     ▼
┌─────────────────┐      ┌──────────────┐
│  index.tsx      │─────▶│  Check Auth  │
│  (Entry Point)  │      │  Status      │
└─────────────────┘      └──────┬───────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
              Not Logged In  Customer   Caterer
                    │           │           │
                    ▼           ▼           ▼
            ┌──────────┐  ┌─────────┐  ┌─────────┐
            │  Login   │  │Customer │  │Caterer  │
            │  Screen  │  │Dashboard│  │Dashboard│
            └──────────┘  └─────────┘  └─────────┘
```

### Customer Ordering Flow
```
┌──────────────┐
│   Customer   │
│   Selects    │
│   Caterer    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Browse     │
│   Menu by    │
│   Date       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Add Items  │
│   to Cart    │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────┐
│   Checkout   │────▶│  Choose  │
│              │     │ Payment  │
└──────────────┘     └────┬─────┘
                          │
                  ┌───────┼───────┐
                  │               │
                 UPI             COD
                  │               │
                  ▼               ▼
           ┌──────────┐    ┌──────────┐
           │ Scan QR  │    │ Confirm  │
           │ & Pay    │    │  Order   │
           └────┬─────┘    └────┬─────┘
                │               │
                └───────┬───────┘
                        │
                        ▼
                ┌──────────────┐
                │    Order     │
                │  Confirmed   │
                └──────────────┘
```

### Caterer Menu Management Flow
```
┌──────────────┐
│   Caterer    │
│  Dashboard   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Manage     │
│   Menu       │
└──────┬───────┘
       │
   ┌───┼────┐
   │   │    │
   ▼   ▼    ▼
┌───┐┌───┐┌───┐
│Add││Edit││Del│
└─┬─┘└─┬─┘└─┬─┘
  │    │    │
  └────┼────┘
       │
       ▼
┌──────────────┐
│  Fill Form:  │
│  - Name      │
│  - Price     │
│  - Image     │
│  - Dates     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Upload     │
│   Image to   │
│  Cloudinary  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Save to     │
│  Database    │
└──────────────┘
```

---

## 🗂️ Data Flow Patterns

### 1. Component → API → Backend → Database

```typescript
// 1. User Action in Component
const handleSubmit = async () => {
  // 2. Call API layer
  const result = await createMenuItem(formData);
};

// 3. API Layer (src/api/catererMenuApi.ts)
export const createMenuItem = async (data: MenuItem) => {
  // 4. HTTP Request to Backend
  const res = await fetch(`${BASE_URL}/menus`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return await res.json();
};

// 5. Backend Route (backend-api/src/routes/menuRoutes.js)
router.post('/menus', async (req, res) => {
  // 6. Database Query
  const result = await pool.query(
    'INSERT INTO caterer_menus (...) VALUES (...)',
    [data]
  );
  res.json(result.rows[0]);
});
```

### 2. Context State Management

```
┌─────────────────────────────────────────────┐
│            App Root (_layout.tsx)           │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │        AuthProvider                   │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │      CartProvider               │ │ │
│  │  │  ┌───────────────────────────┐  │ │ │
│  │  │  │     All Screens           │  │ │ │
│  │  │  │  Can access:              │  │ │ │
│  │  │  │  - useAuth()              │  │ │ │
│  │  │  │  - useCart()              │  │ │ │
│  │  │  └───────────────────────────┘  │ │ │
│  │  └─────────────────────────────────┘ │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 3. File Upload Flow

```
User selects image
       │
       ▼
┌──────────────────┐
│  expo-image-     │
│  picker          │
│  Returns base64  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  CloudinaryImage │
│  Picker          │
│  Component       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Upload to       │
│  Cloudinary API  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Returns secure  │
│  URL             │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Save URL to     │
│  Database        │
└──────────────────┘
```

---

## 🔄 State Management Patterns

### Local State (useState)
**Use for**: Component-specific data
```typescript
const [name, setName] = useState('');
const [loading, setLoading] = useState(false);
```

### Global State (Context API)
**Use for**: App-wide data
```typescript
// AuthContext: user, login, logout
// CartContext: items, addToCart, removeFromCart
```

### Server State (API + useEffect)
**Use for**: Data from backend
```typescript
useEffect(() => {
  const fetchData = async () => {
    const data = await api.getData();
    setData(data);
  };
  fetchData();
}, []);
```

### Persistent State (AsyncStorage)
**Use for**: Data that survives app restarts
```typescript
// Cart items
// User preferences
// Offline data
```

---

## 📊 Database Schema Overview

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │ caterer_     │       │   orders     │
│              │       │ menus        │       │              │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ phone        │◀──┐   │ caterer_id   │◀──┐   │ order_id     │
│ role         │   │   │ name         │   │   │ customer_id  │
│ name         │   │   │ price        │   │   │ caterer_id   │
│ service_name │   │   │ category     │   │   │ items        │
│ address      │   │   │ cuisine      │   │   │ total_amount │
│ payment_qr   │   │   │ type         │   │   │ status       │
└──────────────┘   │   │ image        │   │   │ payment_     │
                   │   │ available_   │   │   │ method       │
                   │   │ dates        │   │   └──────────────┘
                   │   │ in_stock     │   │
                   │   └──────────────┘   │
                   │                      │
                   └──────FK──────────────┘

┌──────────────┐       ┌──────────────┐
│ apartments   │       │ customer_    │
│              │       │ apartments   │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ caterer_id   │◀──────│ customer_id  │
│ name         │       │ apartment_id │
│ address      │       │ caterer_id   │
│ access_code  │       │ added_via    │
└──────────────┘       └──────────────┘

┌──────────────┐
│ subscriptions│
├──────────────┤
│ id (PK)      │
│ customer_id  │
│ caterer_id   │
└──────────────┘
```

**Relationships:**
- **users** → **caterer_menus** (1:many) - A caterer has many menu items
- **users** → **orders** (1:many) - A customer/caterer has many orders
- **users** → **apartments** (1:many) - A caterer manages many apartments
- **apartments** ← **customer_apartments** → **users** (many:many) - Customers linked to apartments

---

## 🎯 Key Design Patterns Used

### 1. Repository Pattern (API Layer)
```
Components → API Functions → Backend
(Don't call fetch directly in components)
```

### 2. Provider Pattern (Context API)
```
<Provider>
  <Children access via useContext>
</Provider>
```

### 3. Compound Component Pattern
```typescript
<Tabs>
  <Tabs.Screen name="home" />
  <Tabs.Screen name="search" />
</Tabs>
```

### 4. Render Props Pattern
```typescript
<FlatList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
/>
```

### 5. Custom Hooks Pattern
```typescript
function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
```

---

## 🔐 Security Considerations

### What We Have
✅ Input validation on forms
✅ Error handling for API calls
✅ TypeScript type checking
✅ Environment variables for secrets

### What's Missing (Production TODO)
⚠️ JWT tokens for authentication
⚠️ HTTPS for API calls
⚠️ Rate limiting
⚠️ SQL injection prevention (use parameterized queries)
⚠️ XSS protection
⚠️ CSRF tokens

---

## 🚀 Performance Optimizations

### Implemented
✅ useMemo for computed values
✅ Image optimization (quality: 0.8)
✅ Lazy loading with dynamic imports
✅ Context splitting (Auth, Cart separate)

### Future Improvements
📝 React.memo for expensive components
📝 Virtual lists (FlatList) for long lists
📝 Image caching
📝 API response caching
📝 Code splitting

---

## 📂 Folder Structure Deep Dive

```
delivery-app/
│
├── app/                              # Expo Router (File-based routing)
│   ├── (authenticated)/              # Route group (requires auth)
│   │   ├── caterer/                 # Caterer-only routes
│   │   │   ├── dashboard.tsx        # → /(authenticated)/caterer/dashboard
│   │   │   ├── menu.tsx             # → /(authenticated)/caterer/menu
│   │   │   ├── menu-add.tsx         # → /(authenticated)/caterer/menu-add
│   │   │   ├── orders.tsx           # → /(authenticated)/caterer/orders
│   │   │   ├── payment-qr.tsx       # → /(authenticated)/caterer/payment-qr
│   │   │   ├── restaurant/          # Restaurant sub-feature
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── tables.tsx
│   │   │   │   └── _layout.tsx      # Restaurant layout
│   │   │   └── _layout.tsx          # Caterer layout (stack nav)
│   │   │
│   │   ├── customer/                # Customer-only routes
│   │   │   ├── index.tsx            # → /(authenticated)/customer
│   │   │   ├── cart.tsx             # → /(authenticated)/customer/cart
│   │   │   ├── search.tsx           # → /(authenticated)/customer/search
│   │   │   ├── orders.tsx           # → /(authenticated)/customer/orders
│   │   │   └── _layout.tsx          # Customer layout (tab nav)
│   │   │
│   │   └── _layout.tsx              # Auth guard layout
│   │
│   ├── _layout.tsx                  # Root layout (providers)
│   ├── index.tsx                    # Entry point (redirects)
│   ├── login.tsx                    # Login screen
│   └── signup.tsx                   # Signup screen
│
├── src/
│   ├── api/                         # Backend API calls
│   │   ├── authApi.ts              # Login, signup, user management
│   │   ├── catererMenuApi.ts       # Menu CRUD operations
│   │   ├── orderApi.ts             # Order management
│   │   ├── apartmentApi.ts         # Apartment/location management
│   │   └── foodApi.ts              # Legacy food API
│   │
│   ├── components/                  # Reusable components
│   │   ├── caterer/                # Caterer-specific components
│   │   │   ├── MenuItemCard.tsx
│   │   │   ├── OrderCard.tsx
│   │   │   └── ...
│   │   ├── CloudinaryImagePicker.tsx
│   │   ├── PaymentBottomSheet.tsx
│   │   └── ...
│   │
│   ├── config/                      # Configuration files
│   │   ├── api.ts                  # API base URL config
│   │   └── cloudinary.ts           # Cloudinary config
│   │
│   ├── context/                     # Global state management
│   │   ├── AuthContext.tsx         # User authentication state
│   │   └── CartContext.tsx         # Shopping cart state
│   │
│   ├── types/                       # TypeScript definitions
│   │   ├── auth.ts                 # User, Subscription types
│   │   ├── menu.ts                 # MenuItem types
│   │   ├── order.ts                # Order types
│   │   └── ...
│   │
│   └── utils/                       # Utility functions
│       └── orderStorage.ts         # AsyncStorage helpers
│
├── assets/                          # Static files
│   ├── images/
│   └── fonts/
│
├── backend-api/                     # Backend server (separate)
│   ├── src/
│   │   ├── config/                 # DB config
│   │   ├── controllers/            # Business logic
│   │   ├── routes/                 # API routes
│   │   └── server.js              # Express app
│   ├── .env                        # Environment variables
│   └── package.json
│
├── .env                             # Frontend env variables
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── LEARNING_GUIDE.md               # This guide
├── QUICK_REFERENCE.md              # Quick reference
└── ARCHITECTURE.md                 # Architecture docs
```

---

## 🎨 Component Hierarchy Example

### Customer Home Screen
```
app/(authenticated)/customer/index.tsx
│
├── <View> (container)
│   │
│   ├── <View> (header)
│   │   ├── <TouchableOpacity> (back button)
│   │   ├── <Text> (title)
│   │   └── <View> (spacer)
│   │
│   ├── <ScrollView> (content)
│   │   │
│   │   ├── <DayFilterModal>
│   │   │   └── Custom modal component
│   │   │
│   │   ├── {menuItems.map()} (list)
│   │   │   └── <FoodCard> (component)
│   │   │       ├── <Image>
│   │   │       ├── <Text> (name)
│   │   │       ├── <Text> (price)
│   │   │       └── <TouchableOpacity> (add to cart)
│   │   │
│   │   └── <View> (empty state)
│   │       └── <Text>
│   │
│   └── <CartFloatingButton>
│       └── Custom FAB component
```

---

## 📱 Screen-to-Screen Navigation Flow

```
Login Screen
    │
    ├─ Customer Role
    │     │
    │     ├─ Caterer Selection
    │     │     │
    │     │     └─ Browse Menu (Home)
    │     │           ├─ Food Details
    │     │           │     └─ Cart
    │     │           │           └─ Checkout
    │     │           │                 └─ Order Confirmed
    │     │           │
    │     │           ├─ Search
    │     │           ├─ Cart
    │     │           └─ Orders
    │     │                 └─ Order Details
    │     │
    │     └─ QR Scanner → Restaurant Menu → Checkout
    │
    └─ Caterer Role
          │
          └─ Dashboard
                ├─ Menu Management
                │     ├─ Add Menu Item
                │     └─ Edit Menu Item
                │
                ├─ Orders
                │     └─ Order Details
                │
                ├─ Payments
                │     └─ Payment QR
                │
                ├─ Customers
                │     └─ Add Customer
                │
                ├─ Apartments
                │     └─ Add Apartment
                │
                └─ Restaurant
                      ├─ Tables
                      │     ├─ Create Table
                      │     └─ View QR Code
                      ├─ Menu
                      └─ Orders
```

---

## 🧩 Technology Stack Breakdown

### Frontend
- **React Native 0.81.5**: Mobile framework
- **TypeScript 5.9.2**: Type safety
- **Expo SDK 54**: Tooling & services
- **Expo Router 6**: File-based routing
- **Context API**: State management

### Backend
- **Node.js 18+**: Runtime
- **Express.js**: Web framework
- **PostgreSQL**: Database
- **JSON Server** (legacy): Mock API

### External Services
- **Cloudinary**: Image hosting
- **UPI/GPay**: Payments (manual QR)

### Development Tools
- **npm**: Package manager
- **ESLint**: Code linting
- **Git**: Version control

---

## 🔄 Lifecycle & Data Flow

### Component Lifecycle
```
Component Mount
    ↓
useEffect (mount)
    ↓
Fetch Data
    ↓
Update State
    ↓
Re-render
    ↓
User Interaction
    ↓
Update State
    ↓
Re-render
    ↓
Component Unmount
    ↓
Cleanup (useEffect return)
```

### Auth Flow Lifecycle
```
App Start
    ↓
Check AsyncStorage for user
    ↓
    ├─ User Found → Auto Login
    │     ↓
    │  Set Auth Context
    │     ↓
    │  Redirect to Dashboard
    │
    └─ No User → Show Login
          ↓
       User Logs In
          ↓
       API Call
          ↓
       Save to Context
          ↓
       Save to AsyncStorage
          ↓
       Redirect
```

---

This architecture enables:
- ✅ Scalable codebase
- ✅ Maintainable structure
- ✅ Type-safe development
- ✅ Efficient state management
- ✅ Clear separation of concerns
- ✅ Easy testing (future)

---

*Understanding the architecture helps you make better decisions when adding features!* 🚀
