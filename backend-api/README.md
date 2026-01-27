# Delivery App Backend API

A RESTful API built with Node.js, Express.js, and PostgreSQL for the food delivery subscription application.

## Features

- **User Authentication**: Login and signup for customers and caterers
- **Menu Management**: CRUD operations for caterer-specific menus with date-based availability
- **Order Management**: Create, update, and track orders with status workflow
- **Subscription Management**: Customer-caterer relationship management
- **Apartment Management**: Delivery location management with access codes
- **Delivery Assignments**: Assign delivery persons to orders
- **Cuisines**: Manage cuisine categories

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database**:
   - Create a new PostgreSQL database:
     ```sql
     CREATE DATABASE delivery_app_db;
     ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update the `.env` file with your PostgreSQL credentials:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=delivery_app_db
     DB_USER=your_username
     DB_PASSWORD=your_password
     PORT=5000
     ```

4. **Initialize database**:
   ```bash
   npm run init-db
   ```
   This will create all tables and seed initial data.

## Running the Server

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Check if server is running

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Login user by phone
- `POST /api/auth/signup` - Signup caterer
- `GET /api/auth/users/:id` - Get user by ID
- `PATCH /api/auth/users/:id/qr` - Update payment QR code

### Cuisines (`/api/cuisines`)
- `GET /api/cuisines` - Get all cuisines
- `POST /api/cuisines` - Create cuisine
- `DELETE /api/cuisines/:id` - Delete cuisine

### Menus (`/api/menus`)
- `GET /api/menus?catererId={id}` - Get all menu items for a caterer
- `GET /api/menus/by-date?catererId={id}&date={YYYY-MM-DD}` - Get menu items by date
- `GET /api/menus/:id` - Get single menu item
- `POST /api/menus` - Create menu item
- `PUT /api/menus/:id` - Update menu item
- `PATCH /api/menus/:id/stock` - Toggle stock status
- `DELETE /api/menus/:id` - Delete menu item

### Orders (`/api/orders`)
- `POST /api/orders` - Create order
- `GET /api/orders/customer?customerId={id}` - Get orders by customer
- `GET /api/orders/caterer?catererId={id}` - Get orders by caterer
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Subscriptions (`/api/subscriptions`)
- `GET /api/subscriptions?customerId={id}` - Get customer subscriptions
- `GET /api/subscriptions/caterers` - Get all caterers
- `GET /api/subscriptions/caterers/:catererId` - Get caterer details
- `POST /api/subscriptions` - Create subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

### Apartments (`/api/apartments`)
- `GET /api/apartments?catererId={id}` - Get caterer apartments
- `GET /api/apartments/customer?customerId={id}` - Get customer apartments
- `POST /api/apartments` - Create apartment
- `POST /api/apartments/link` - Link customer to apartment via access code
- `DELETE /api/apartments/:id` - Delete apartment

### Delivery (`/api/delivery`)
- `POST /api/delivery/assign` - Assign delivery person to order
- `GET /api/delivery?deliveryPersonId={id}` - Get delivery assignments
- `PATCH /api/delivery/:id/status` - Update delivery assignment status

## Database Schema

The database consists of the following tables:

- **users** - User accounts (customers, caterers, delivery persons)
- **cuisines** - Cuisine categories
- **foods** - Legacy food items (for compatibility)
- **caterer_menus** - Caterer-specific menu items with date-based availability
- **subscriptions** - Customer-caterer relationships
- **apartments** - Delivery locations
- **customer_apartments** - Customer-apartment links
- **orders** - Order records with status tracking
- **delivery_assignments** - Delivery person assignments

## Project Structure

```
backend-api/
├── src/
│   ├── config/
│   │   └── database.js       # Database connection pool
│   ├── controllers/          # Route controllers
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   ├── subscriptionController.js
│   │   ├── apartmentController.js
│   │   ├── deliveryController.js
│   │   └── cuisineController.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   ├── apartmentRoutes.js
│   │   ├── deliveryRoutes.js
│   │   └── cuisineRoutes.js
│   ├── database/             # Database scripts
│   │   ├── schema.sql        # Database schema
│   │   ├── seed.sql          # Seed data
│   │   └── init.js           # Database initialization
│   └── server.js             # Express server entry point
├── .env                      # Environment variables
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore file
├── package.json              # NPM dependencies and scripts
└── README.md                 # This file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | delivery_app_db |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment (development/production) | development |
| `JWT_SECRET` | JWT secret key (for future use) | - |

## Development

### Running in development mode:
```bash
npm run dev
```

This will start the server with nodemon, which automatically restarts on file changes.

### Reinitializing the database:
```bash
npm run init-db
```

**Warning**: This will drop all existing tables and recreate them with seed data.

## Testing

You can test the API endpoints using:
- **Postman** or **Insomnia** for API testing
- **curl** commands
- Frontend integration

Example curl command:
```bash
curl http://localhost:5000/health
```

## Migration from JSON Server

This backend replaces the JSON Server (`json-server`) with a proper PostgreSQL database. Key differences:

1. **Database**: PostgreSQL instead of JSON file
2. **Validation**: Proper data validation and error handling
3. **Relationships**: Foreign key constraints and relational integrity
4. **Performance**: Indexed queries for better performance
5. **Security**: Prepared statements to prevent SQL injection

## Next Steps

1. Update frontend API base URLs to point to this backend
2. Test all API endpoints
3. Add authentication middleware (JWT)
4. Implement rate limiting
5. Add request validation middleware
6. Set up production deployment
7. Add API documentation (Swagger/OpenAPI)
8. Implement logging system
9. Add unit and integration tests
10. Set up CI/CD pipeline

## License

ISC
