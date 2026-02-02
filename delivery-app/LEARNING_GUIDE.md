# KaasproFoods App - Complete Learning Guide

## 📚 Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Project Structure Overview](#project-structure-overview)
3. [Level 1: Foundation Files](#level-1-foundation-files)
4. [Level 2: Type Definitions](#level-2-type-definitions)
5. [Level 3: Configuration Files](#level-3-configuration-files)
6. [Level 4: State Management (Context API)](#level-4-state-management-context-api)
7. [Level 5: API Layer](#level-5-api-layer)
8. [Level 6: Reusable Components](#level-6-reusable-components)
9. [Level 7: Routing & Navigation](#level-7-routing--navigation)
10. [Level 8: Screen Components](#level-8-screen-components)
11. [Advanced Concepts Used](#advanced-concepts-used)

---

## Introduction & Core Concepts

### What is React Native?
React Native is a framework for building mobile apps using React. Instead of web elements (div, span), you use mobile components (View, Text).

**Key Differences from React Web:**
- `<View>` instead of `<div>`
- `<Text>` instead of `<p>` or `<span>`
- `<TouchableOpacity>` instead of `<button>`
- StyleSheet API instead of CSS files
- No CSS classes - all styling is JavaScript objects

### What is Expo?
Expo is a framework built on top of React Native that provides:
- Pre-built components (Camera, Image Picker, File System)
- Easy development workflow
- Expo Go app for testing
- File-based routing (Expo Router)

### Tech Stack Used
- **React Native 0.81.5** - Mobile app framework
- **Expo SDK ~54.0** - Expo framework
- **TypeScript** - Type-safe JavaScript
- **Expo Router v6** - File-based navigation
- **Context API** - State management
- **PostgreSQL + Express** - Backend (backend-api folder)
- **Cloudinary** - Image hosting

---

## Project Structure Overview

```
delivery-app/
├── app/                          # 📱 Expo Router - All screens
│   ├── (authenticated)/          # Protected routes
│   │   ├── caterer/             # Caterer-only screens
│   │   └── customer/            # Customer-only screens
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Entry point
│   ├── login.tsx                # Login screen
│   └── signup.tsx               # Signup screen
│
├── src/                          # 🔧 Source code
│   ├── api/                     # API calls to backend
│   ├── components/              # Reusable UI components
│   ├── config/                  # Configuration files
│   ├── context/                 # Global state management
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # Utility functions
│
├── assets/                       # 🖼️ Images, fonts, etc.
├── backend-api/                  # 🗄️ Backend server (separate)
└── package.json                  # Dependencies
```

### Learning Path
**Start with**: Types → Config → Context → API → Components → Routing → Screens

---

## Level 1: Foundation Files

### 📄 `package.json` - Dependencies Management
**What it does**: Lists all the libraries your app uses.

**Key Dependencies Explained:**
```json
{
  "expo": "~54.0.30",              // Expo framework
  "react": "19.1.0",               // React library
  "react-native": "0.81.5",        // React Native core
  "expo-router": "~6.0.21",        // File-based navigation
  "expo-image-picker": "latest",   // Select images from gallery
  "expo-file-system": "~19.0",     // File operations
  "expo-sharing": "~14.0",         // Share files
  "typescript": "~5.9.2"           // TypeScript
}
```

**How to add new libraries:**
```bash
npm install package-name
```

---

### 📄 `app.json` - App Configuration
**What it does**: Configures your app settings, name, version, etc.

**Key Settings:**
```json
{
  "expo": {
    "name": "delivery-app",        // App name
    "slug": "delivery-app",        // Expo project slug
    "version": "1.0.0",            // App version
    "scheme": "deliveryapp",       // Deep linking scheme
    "platforms": ["ios", "android", "web"]
  }
}
```

---

### 📄 `tsconfig.json` - TypeScript Configuration
**What it does**: Tells TypeScript how to compile your code.

**Key Setting - Path Alias:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]  // "@/" means project root
    }
  }
}
```

**Usage Example:**
```typescript
// Instead of: import { User } from "../../../src/types/auth"
// You can write: import { User } from "@/src/types/auth"
```

---

## Level 2: Type Definitions

**Location:** `src/types/`

TypeScript types define the "shape" of your data. Think of them as contracts.

### 📄 `src/types/auth.ts` - User & Authentication Types

```typescript
// User type - defines what a user object looks like
export interface User {
  id: number;                    // Unique ID
  phone: string;                 // Phone number (used for login)
  role: "customer" | "caterer" | "delivery_person";  // User role
  name: string;                  // User's name
  serviceName?: string;          // Caterer's business name (optional)
  address?: string;              // User's address (optional)
  paymentQrCode?: string;        // Caterer's QR code URL (optional)
}
```

**Why use types?**
- Autocomplete in VS Code
- Catch errors before runtime
- Self-documenting code

**Example Usage:**
```typescript
const user: User = {
  id: 1,
  phone: "+919876543210",
  role: "customer",
  name: "John Doe"
};

// TypeScript error if you forget a required field!
const badUser: User = {
  id: 1,
  phone: "+919876543210"
  // ERROR: 'role' and 'name' are missing
};
```

---

### 📄 `src/types/menu.ts` - Menu Item Types

```typescript
export interface MenuItem {
  id?: number;
  catererId: number;            // Who created this item
  name: string;                 // Food name
  price: number;                // Price in rupees
  category: "veg" | "non-veg";  // Only these 2 values allowed
  cuisine: string;              // e.g., "Biryani", "Chinese"
  type: "breakfast" | "lunch" | "dinner" | "snack" | "main_course";
  image: string;                // Image URL
  description: string;
  availableDates: string[];     // Array of dates (YYYY-MM-DD)
  inStock: boolean;             // Is item available?
  createdAt?: string;
}
```

**Key Concept - Union Types:**
```typescript
category: "veg" | "non-veg"
// This means category can ONLY be "veg" OR "non-veg"
// Not "vegetarian" or "nonveg" - TypeScript will error
```

---

### 📄 `src/types/order.ts` - Order Types

```typescript
export interface Order {
  id?: number;
  orderId: string;              // Client-generated ID
  customerId: number;
  catererId: number;
  items: CartItem[];            // Array of items
  totalAmount: number;
  paymentMethod: "upi" | "cod";
  transactionId?: string;
  deliveryAddress?: string;
  deliveryPersonId?: number;
  itemCount: number;
  orderDate: string;
  deliveryDate?: string;
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  createdAt?: string;
}
```

**Key Concept - Optional Properties:**
```typescript
id?: number;  // "?" means optional
// Can be: { id: 1 } or { } (without id)
```

---

## Level 3: Configuration Files

**Location:** `src/config/`

Configuration files store settings that you might change later.

### 📄 `src/config/api.ts` - Backend API Configuration

```typescript
const BASE_URL_IP = '192.168.1.35';  // Your computer's IP
const PORT = '5000';

export const API_CONFIG = {
  BASE_URL: `http://${BASE_URL_IP}:${PORT}/api`,
  TIMEOUT: 10000,  // 10 seconds
};
```

**Why separate config?**
- Change IP in one place
- Different configs for dev/production
- Easy to maintain

**Usage:**
```typescript
import { API_CONFIG } from '@/src/config/api';

fetch(`${API_CONFIG.BASE_URL}/auth/login`, { ... });
```

---

### 📄 `src/config/cloudinary.ts` - Image Upload Configuration

```typescript
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'kaaspro_menu_images',
  folder: 'kaaspro/menu-items',
};

export const getCloudinaryUploadUrl = () => {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
};
```

**Key Concept - Environment Variables:**
```typescript
process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME
// Reads from .env file
// Keeps secrets out of code
```

**.env file example:**
```
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=mycloud123
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=my_preset
```

---

## Level 4: State Management (Context API)

**Location:** `src/context/`

Context API provides global state accessible from any component.

### 📄 `src/context/AuthContext.tsx` - User Authentication State

**What it does**: Stores the logged-in user's data globally.

**Step-by-step breakdown:**

#### Step 1: Define Context Type
```typescript
interface AuthContextType {
  user: User | null;                    // Current user or null
  isAuthenticated: boolean;             // Computed value
  selectedCatererId: number | null;     // For customers
  login: (phone: string) => Promise<void>;
  logout: () => void;
  signup: (data: SignupData) => Promise<void>;
  setUser: (user: User) => void;
  setSelectedCatererId: (id: number | null) => void;
}
```

#### Step 2: Create Context
```typescript
const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

#### Step 3: Create Provider Component
```typescript
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [selectedCatererId, setSelectedCatererId] = useState<number | null>(null);

  // Computed value
  const isAuthenticated = user !== null;

  // Functions
  const login = async (phone: string) => {
    const loggedInUser = await loginUser(phone);
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  };

  const logout = () => {
    setUser(null);
    setSelectedCatererId(null);
  };

  // Provide to children
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, ... }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Step 4: Create Custom Hook
```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
```

#### Step 5: Usage in Components
```typescript
import { useAuth } from '@/src/context/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();

  return (
    <View>
      {user ? (
        <Text>Welcome, {user.name}!</Text>
      ) : (
        <Button title="Login" onPress={() => login("+919876543210")} />
      )}
    </View>
  );
}
```

**Why Context API?**
- Avoid prop drilling (passing props through many levels)
- Global state accessible anywhere
- React's built-in solution (no extra libraries)

---

### 📄 `src/context/CartContext.tsx` - Shopping Cart State

**Key Concepts:**

#### 1. State Management
```typescript
const [items, setItems] = useState<CartItem[]>([]);
```

#### 2. Computed Values (useMemo)
```typescript
const totalAmount = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}, [items]);  // Recalculates when items change
```

**What is useMemo?**
- Caches calculated values
- Only recalculates when dependencies change
- Improves performance

#### 3. Add to Cart Logic
```typescript
const addToCart = (item: FoodItem) => {
  setItems(currentItems => {
    // Check if item already exists
    const existingItem = currentItems.find(i => i.id === item.id);

    if (existingItem) {
      // Increase quantity
      return currentItems.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      // Add new item
      return [...currentItems, { ...item, quantity: 1 }];
    }
  });
};
```

#### 4. Persistence with AsyncStorage
```typescript
useEffect(() => {
  // Load cart from storage on mount
  loadCart();
}, []);

useEffect(() => {
  // Save cart to storage when items change
  if (isInitialized) {
    saveCart();
  }
}, [items]);
```

**What is AsyncStorage?**
- Like localStorage for mobile
- Stores data persistently
- Survives app restarts

---

## Level 5: API Layer

**Location:** `src/api/`

API files handle communication with the backend.

### 📄 `src/api/authApi.ts` - Authentication API

#### Basic Fetch Request
```typescript
export const loginUser = async (phone: string): Promise<User | null> => {
  try {
    // 1. Make HTTP request
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),  // Convert object to JSON string
    });

    // 2. Check response status
    if (!res.ok) {
      if (res.status === 404) {
        return null;  // User not found
      }
      throw new Error("Login failed");
    }

    // 3. Parse JSON response
    const user = await res.json();
    return user;

  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};
```

**Key Concepts:**

1. **async/await**: Handle asynchronous code
2. **fetch()**: Make HTTP requests
3. **JSON.stringify()**: Convert JavaScript object to JSON string
4. **res.json()**: Parse JSON response to JavaScript object
5. **Error handling**: try/catch blocks

---

### 📄 `src/api/catererMenuApi.ts` - Menu Management API

#### GET Request
```typescript
export const getCatererMenuItems = async (catererId: number): Promise<MenuItem[]> => {
  const res = await fetch(`${BASE_URL}/menus/caterer/${catererId}`);
  if (!res.ok) throw new Error("Failed to fetch menu items");
  return await res.json();
};
```

#### POST Request (Create)
```typescript
export const createMenuItem = async (data: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  const res = await fetch(`${BASE_URL}/menus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create menu item");
  return await res.json();
};
```

**Omit Utility Type:**
```typescript
Omit<MenuItem, 'id'>
// MenuItem type WITHOUT the 'id' property
// Because backend generates ID
```

#### PATCH Request (Partial Update)
```typescript
export const updateMenuItem = async (id: number, data: Partial<MenuItem>): Promise<MenuItem> => {
  const res = await fetch(`${BASE_URL}/menus/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update menu item");
  return await res.json();
};
```

**Partial Utility Type:**
```typescript
Partial<MenuItem>
// All MenuItem properties become optional
// Can update just name, or just price, etc.
```

#### DELETE Request
```typescript
export const deleteMenuItem = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/menus/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete menu item");
};
```

---

## Level 6: Reusable Components

**Location:** `src/components/`

Components are reusable pieces of UI.

### 📄 `src/components/CloudinaryImagePicker.tsx` - Image Upload Component

**Component Props Interface:**
```typescript
interface CloudinaryImagePickerProps {
  onImageUploaded: (url: string) => void;  // Callback function
  currentImage?: string;                   // Optional
  label?: string;
  disabled?: boolean;
  folder?: string;
}
```

**Using the Component:**
```typescript
<CloudinaryImagePicker
  label="Upload Food Image"
  onImageUploaded={(url) => setFormData({ ...formData, image: url })}
  currentImage={formData.image}
  disabled={loading}
  folder="kaaspro/menu-items"
/>
```

**Key Features:**

#### 1. Permission Handling
```typescript
const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

if (permissionResult.granted === false) {
  Alert.alert('Permission Required', 'Please grant access to photos');
  return;
}
```

#### 2. Image Selection
```typescript
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: 'images',      // Only images
  allowsEditing: true,       // Allow cropping
  quality: 0.8,              // 80% quality (smaller file)
  base64: true,              // Get base64 data
});
```

#### 3. Upload to Cloudinary
```typescript
const formData = new FormData();
formData.append('file', `data:${mimeType};base64,${asset.base64}`);
formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
formData.append('folder', folder || CLOUDINARY_CONFIG.folder);

const xhr = new XMLHttpRequest();

// Progress tracking
xhr.upload.addEventListener('progress', (event) => {
  if (event.lengthComputable) {
    const progress = Math.round((event.loaded / event.total) * 100);
    setUploadProgress(progress);
  }
});

// Success handler
xhr.addEventListener('load', () => {
  if (xhr.status === 200) {
    const response = JSON.parse(xhr.responseText);
    const imageUrl = response.secure_url;
    onImageUploaded(imageUrl);  // Call parent's callback
  }
});

xhr.open('POST', uploadUrl);
xhr.send(formData);
```

**Why XMLHttpRequest instead of fetch?**
- Progress tracking for uploads
- fetch() doesn't support upload progress

---

### 📄 `src/components/caterer/MenuItemCard.tsx` - Menu Item Display

**Component Structure:**
```typescript
interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  onToggleStock: (id: number, inStock: boolean) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleStock
}) => {
  return (
    <View style={styles.card}>
      {/* Image */}
      <Image source={{ uri: item.image }} style={styles.image} />

      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(item)}>
          <Ionicons name="create-outline" size={20} color="#10B981" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onDelete(item.id!)}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

**Styling with StyleSheet:**
```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',      // Horizontal layout
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,              // Android shadow
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  details: {
    flex: 1,                   // Take remaining space
    marginLeft: 12,
  },
  // ... more styles
});
```

**Key Styling Concepts:**

1. **flexDirection**: Layout direction
   - `'row'` - Horizontal
   - `'column'` - Vertical (default)

2. **flex**: Space distribution
   - `flex: 1` - Take all available space
   - `flex: 2` - Take twice as much space

3. **Shadow**: Different for iOS and Android
   - iOS: `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
   - Android: `elevation`

---

## Level 7: Routing & Navigation

**Location:** `app/`

Expo Router uses file-based routing (like Next.js).

### File-based Routing Rules

```
app/
├── index.tsx              → / (root)
├── login.tsx              → /login
├── (authenticated)/       → Group (no route)
│   ├── customer/
│   │   ├── index.tsx      → /(authenticated)/customer
│   │   └── cart.tsx       → /(authenticated)/customer/cart
│   └── caterer/
│       └── dashboard.tsx  → /(authenticated)/caterer/dashboard
```

**Route Groups:** `(authenticated)`
- Folders in parentheses don't create routes
- Used for organization and shared layouts

---

### 📄 `app/_layout.tsx` - Root Layout

```typescript
export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(authenticated)" />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
```

**Key Concepts:**

1. **Provider Wrapping**: Providers wrap the entire app
   ```typescript
   <AuthProvider>
     <CartProvider>
       {/* All screens can access auth and cart */}
     </CartProvider>
   </AuthProvider>
   ```

2. **Stack Navigator**: Navigate with history
   - Can go back
   - Push new screen on top

3. **screenOptions**: Global screen settings
   ```typescript
   screenOptions={{ headerShown: false }}
   // Hides header for all screens
   ```

---

### 📄 `app/index.tsx` - Entry Point with Redirects

```typescript
export default function Index() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role === 'customer') {
      router.replace('/(authenticated)/customer/caterer-selection');
    } else if (user?.role === 'caterer') {
      router.replace('/(authenticated)/caterer/dashboard');
    }
  }, [isAuthenticated, user]);

  return <ActivityIndicator />;  // Show loading
}
```

**Navigation Methods:**

1. **router.push()**: Navigate and add to history
   ```typescript
   router.push('/login');
   // Can go back
   ```

2. **router.replace()**: Navigate and replace current
   ```typescript
   router.replace('/login');
   // Cannot go back
   ```

3. **router.back()**: Go to previous screen
   ```typescript
   router.back();
   ```

---

### 📄 `app/(authenticated)/_layout.tsx` - Auth Guard

```typescript
export default function AuthenticatedLayout() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <ActivityIndicator />;
  }

  return <Slot />;  // Render child routes
}
```

**Key Concept - Route Protection:**
- Check if user is logged in
- Redirect to login if not
- Render children if authenticated

**Slot Component:**
- Renders child routes
- Like `{children}` in web React

---

### 📄 `app/(authenticated)/customer/_layout.tsx` - Tab Navigation

```typescript
export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      {/* More tabs... */}
    </Tabs>
  );
}
```

**Tab Navigation:**
- Bottom navigation bar
- Multiple screens in tabs
- Only one active at a time

---

## Level 8: Screen Components

### 📄 `app/login.tsx` - Login Screen

**Component Structure:**
```typescript
export default function LoginScreen() {
  // 1. Hooks
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // 2. Event handlers
  const handleLogin = async () => {
    if (!phone.trim()) {
      Alert.alert("Error", "Please enter phone number");
      return;
    }

    setLoading(true);
    try {
      await login(phone);
      // Router redirect handled by index.tsx
    } catch (error) {
      Alert.alert("Error", "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // 3. Render
  return (
    <View style={styles.container}>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone Number"
        keyboardType="phone-pad"
      />

      <TouchableOpacity onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text>Login</Text>}
      </TouchableOpacity>
    </View>
  );
}
```

**Common Patterns:**

1. **Loading State**: Show spinner during async operations
2. **Validation**: Check input before submitting
3. **Error Handling**: Show alerts on failure
4. **Disabled State**: Prevent multiple submits

---

### 📄 `app/(authenticated)/caterer/menu-add.tsx` - Form with Multiple Inputs

**Form State Management:**
```typescript
const [formData, setFormData] = useState({
  name: "",
  description: "",
  price: "",
  category: "veg" as "veg" | "non-veg",
  cuisine: "Biryani",
  type: "main_course" as MealType,
  image: "",
  inStock: true,
});
```

**Updating Form Fields:**
```typescript
// Single field update
<TextInput
  value={formData.name}
  onChangeText={(text) => setFormData({ ...formData, name: text })}
/>

// Or create a generic handler
const updateField = (field: string, value: any) => {
  setFormData({ ...formData, [field]: value });
};

<TextInput
  value={formData.name}
  onChangeText={(text) => updateField('name', text)}
/>
```

**Date Selection:**
```typescript
const [selectedDates, setSelectedDates] = useState<string[]>([]);

const toggleDate = (date: string) => {
  setSelectedDates(prev =>
    prev.includes(date)
      ? prev.filter(d => d !== date)  // Remove
      : [...prev, date]               // Add
  );
};
```

**Submission:**
```typescript
const handleSubmit = async () => {
  // 1. Validation
  if (!formData.name.trim()) {
    Alert.alert("Error", "Please enter item name");
    return;
  }

  // 2. Submit
  setLoading(true);
  try {
    await createMenuItem({
      catererId: user.id,
      ...formData,
      price: Number(formData.price),
      availableDates: selectedDates,
    });

    Alert.alert("Success", "Menu item added", [
      { text: "OK", onPress: () => router.back() }
    ]);
  } catch (error) {
    Alert.alert("Error", "Failed to add item");
  } finally {
    setLoading(false);
  }
};
```

---

### 📄 `app/(authenticated)/customer/cart.tsx` - Cart Screen

**Using Cart Context:**
```typescript
const { items, totalAmount, removeFromCart, clearCart } = useCart();
```

**Rendering List:**
```typescript
<ScrollView>
  {items.length === 0 ? (
    <View style={styles.emptyCart}>
      <Text>Your cart is empty</Text>
    </View>
  ) : (
    items.map(item => (
      <View key={item.id} style={styles.cartItem}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <Text>{item.name}</Text>
        <Text>₹{item.price} x {item.quantity}</Text>
        <TouchableOpacity onPress={() => removeFromCart(item.id)}>
          <Ionicons name="trash" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    ))
  )}
</ScrollView>
```

**Key Concept - FlatList vs map():**
```typescript
// For small lists (< 50 items)
items.map(item => <ItemCard key={item.id} item={item} />)

// For large lists (better performance)
<FlatList
  data={items}
  keyExtractor={item => String(item.id)}
  renderItem={({ item }) => <ItemCard item={item} />}
/>
```

---

### 📄 `app/(authenticated)/caterer/restaurant/table-qr-view.tsx` - File System Operations

**Download to Gallery:**
```typescript
const downloadQR = async () => {
  // 1. Request permission
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Required', 'Please grant access');
    return;
  }

  // 2. Download file
  const filename = `table_${tableNumber}_qr.png`;
  const fileUri = `${FileSystem.documentDirectory}${filename}`;

  const downloadResult = await FileSystem.downloadAsync(
    qrCodeUrl,
    fileUri
  );

  // 3. Save to gallery
  const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
  await MediaLibrary.createAlbumAsync('KaasproFoods QR', asset, false);

  Alert.alert('Success', 'QR code saved to gallery!');
};
```

**Share File:**
```typescript
const shareQR = async () => {
  // 1. Check if sharing is available
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    Alert.alert('Not Available', 'Sharing not supported');
    return;
  }

  // 2. Download to cache
  const filename = `table_${tableNumber}_qr.png`;
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;

  await FileSystem.downloadAsync(qrCodeUrl, fileUri);

  // 3. Share
  await Sharing.shareAsync(fileUri, {
    mimeType: 'image/png',
    dialogTitle: 'Share QR Code',
  });
};
```

---

## Advanced Concepts Used

### 1. TypeScript Generics
```typescript
// Generic function
function getFirstItem<T>(arr: T[]): T | undefined {
  return arr[0];
}

const firstNumber = getFirstItem([1, 2, 3]);     // number
const firstName = getFirstItem(['a', 'b', 'c']); // string
```

### 2. React Hooks

**useState:**
```typescript
const [count, setCount] = useState(0);
setCount(count + 1);
```

**useEffect:**
```typescript
useEffect(() => {
  // Runs on mount and when dependencies change
  fetchData();
}, [dependency]);
```

**useMemo:**
```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);  // Only recomputes when a or b changes
```

**useCallback:**
```typescript
const handleClick = useCallback(() => {
  doSomething(a);
}, [a]);  // Function reference stays same unless a changes
```

**useContext:**
```typescript
const { user } = useContext(AuthContext);
```

### 3. Async/Await
```typescript
// Old way (callbacks)
fetch(url)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Modern way (async/await)
try {
  const res = await fetch(url);
  const data = await res.json();
  console.log(data);
} catch (err) {
  console.error(err);
}
```

### 4. Spread Operator
```typescript
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };  // { a: 1, b: 2, c: 3 }

const arr1 = [1, 2];
const arr2 = [...arr1, 3];  // [1, 2, 3]
```

### 5. Destructuring
```typescript
const user = { name: 'John', age: 30 };
const { name, age } = user;

const arr = [1, 2, 3];
const [first, second] = arr;
```

### 6. Optional Chaining
```typescript
const userName = user?.profile?.name;
// If user or profile is null/undefined, returns undefined
// Instead of: user && user.profile && user.profile.name
```

### 7. Nullish Coalescing
```typescript
const value = possiblyNull ?? 'default';
// Uses 'default' only if possiblyNull is null/undefined
// Different from ||, which uses default for all falsy values (0, '', false)
```

---

## Learning Roadmap

### Week 1: Basics
- [ ] Understand TypeScript types
- [ ] Learn React hooks (useState, useEffect)
- [ ] Study Context API pattern
- [ ] Practice with simple components

### Week 2: Intermediate
- [ ] Learn Expo Router navigation
- [ ] Understand API integration
- [ ] Practice form handling
- [ ] Study AsyncStorage

### Week 3: Advanced
- [ ] Master Context API patterns
- [ ] Learn file system operations
- [ ] Understand image handling
- [ ] Practice error handling

### Week 4: Expert
- [ ] Study performance optimization
- [ ] Learn testing patterns
- [ ] Understand deployment process
- [ ] Practice code organization

---

## Common Patterns Reference

### 1. Loading State Pattern
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await api.getData();
    setData(data);
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};
```

### 2. Conditional Rendering
```typescript
{loading ? (
  <ActivityIndicator />
) : error ? (
  <Text>Error: {error}</Text>
) : (
  <DataComponent data={data} />
)}
```

### 3. List Rendering
```typescript
{items.map((item, index) => (
  <ItemCard key={item.id || index} item={item} />
))}
```

### 4. Form Validation
```typescript
const validate = () => {
  if (!name.trim()) return "Name is required";
  if (price <= 0) return "Price must be positive";
  return null;
};

const handleSubmit = () => {
  const error = validate();
  if (error) {
    Alert.alert("Validation Error", error);
    return;
  }
  // Proceed with submission
};
```

---

## Debugging Tips

### 1. Console Logging
```typescript
console.log('User:', user);
console.log('State:', { loading, error, data });
```

### 2. React DevTools
- Install React DevTools
- Inspect component tree
- View props and state

### 3. Network Debugging
```typescript
console.log('Request:', url, options);
const response = await fetch(url, options);
console.log('Response:', response.status, await response.json());
```

### 4. Error Boundaries
```typescript
try {
  // Risky code
} catch (error) {
  console.error('Caught error:', error);
  Alert.alert('Error', error.message);
}
```

---

## Resources for Further Learning

### Official Docs
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Recommended Courses
- React Native - The Practical Guide (Udemy)
- TypeScript for Beginners (YouTube)
- Expo Router Deep Dive (Expo docs)

### Practice Projects
1. Todo List App
2. Weather App with API
3. Photo Gallery App
4. Chat App (Firebase)

---

## Next Steps

1. **Read this guide thoroughly**
2. **Clone the project and explore**
3. **Make small changes and observe**
4. **Build your own features**
5. **Debug and fix issues**
6. **Repeat!**

**Remember**: The best way to learn is by doing. Start with small changes, break things, fix them, and learn!

---

*Happy Learning! 🚀*
