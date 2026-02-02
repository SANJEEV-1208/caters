# Database Migration for Restaurant Features

This migration adds support for restaurant vendor features to the KaasproFoods application.

## What This Migration Does

1. Adds `cater_type` column to distinguish between "home" kitchen and "restaurant" kitchen caterers
2. Adds `restaurant_name` and `restaurant_address` columns for restaurant-specific data
3. Adds `table_number` column to orders table for restaurant table-based ordering
4. Creates appropriate database indexes for performance
5. Sets existing caterers to 'home' type by default

## How to Run the Migration

### Option 1: Using psql command line

```bash
cd backend-api
psql -U postgres -d kaaspro_foods -f src/database/migrations/add_restaurant_fields.sql
```

### Option 2: Using pgAdmin or another PostgreSQL GUI

1. Open your PostgreSQL database management tool
2. Connect to the `kaaspro_foods` database
3. Open and execute the file: `src/database/migrations/add_restaurant_fields.sql`

### Option 3: Copy-paste the SQL directly

If the above methods don't work, you can manually run these SQL commands in your PostgreSQL client:

```sql
-- Add cater_type, restaurant_name, and restaurant_address to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS cater_type VARCHAR(50) CHECK (cater_type IN ('home', 'restaurant')),
ADD COLUMN IF NOT EXISTS restaurant_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS restaurant_address TEXT;

-- Add table_number to orders table for restaurant orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS table_number VARCHAR(50);

-- Create index on cater_type for better query performance
CREATE INDEX IF NOT EXISTS idx_users_cater_type ON users(cater_type);

-- Update existing caterers to have cater_type = 'home' (default for existing users)
UPDATE users
SET cater_type = 'home'
WHERE role = 'caterer' AND cater_type IS NULL;
```

## Verification

After running the migration, verify it was successful:

```sql
-- Check if columns were added
\d users
\d orders

-- Check if existing caterers were updated
SELECT id, name, role, cater_type FROM users WHERE role = 'caterer';
```

You should see:
- `cater_type`, `restaurant_name`, and `restaurant_address` columns in the `users` table
- `table_number` column in the `orders` table
- All existing caterers have `cater_type = 'home'`

## Troubleshooting

### Error: "permission denied"
Run psql as a superuser or ensure your database user has ALTER TABLE permissions.

### Error: "database does not exist"
Make sure you're connected to the correct database name. Check your database configuration.

### Error: "already exists"
This is safe to ignore - it means the columns already exist from a previous migration attempt.
