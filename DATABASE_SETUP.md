# BoardLanka Database Setup Guide

## Problem
The backend API is failing because the `profiles` table doesn't exist in your Supabase database. The error shows:
```
Could not find the table 'public.profiles' in the schema cache
```

## Solution

### Step 1: Set Up Database Tables
I've created a SQL schema file with all necessary tables. Follow these steps:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com and log in
   - Select your BoardLanka project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Run the Schema SQL**
   - Open `backend/database_schema.sql`
   - Copy the entire SQL content
   - Paste it into the SQL Editor
   - Click "Run"

### Step 2: Verify Tables Created
After running the SQL, verify the tables are created:
- Go to "Table Editor" in the left sidebar
- You should see these tables:
  - `profiles`
  - `properties`
  - `favorites`

### Step 3: Back to Your Backend

The backend has been updated to be more resilient:
- If the `profiles` table doesn't exist, it won't crash
- It will gracefully handle missing data
- Once you run the SQL schema, everything will work perfectly

### Step 4: Test the API

**Restart your backend server:**
```bash
cd backend
npm start
```

**Try adding a property:**
1. Go to your app's Add Property page
2. Fill in the form and submit
3. Images should upload successfully

## SQL Schema Tables

### profiles
- User profile information
- Stores first name, last name, account type
- Links to Supabase Auth users

### properties
- Property listings
- Stores title, location, price, amenities, images
- Images are stored as base64 strings in TEXT array

### favorites
- User saved properties
- Links between users and properties they like

## Important Notes

- **Images**: Currently stored as base64 strings. For production, consider using Supabase Storage instead.
- **Row Level Security (RLS)**: Policies are configured to ensure:
  - Only sellers can add/edit properties
  - Anyone can view available properties
  - Users can only modify their own data
- **Indexes**: Created for better query performance on common searches (area, type, availability)

## Next Steps (Optional)

1. **Use Supabase Storage for Images** (Recommended for production)
   - Upload images to Supabase Storage
   - Store image URLs in the database instead of base64
   - This reduces database size and improves performance

2. **Add Email Verification**
   - Require email verification before selling

3. **Add Image Moderation**
   - Require admin approval for property images

## Troubleshooting

**If tables already exist:** You can safely re-run the SQL. The `CREATE TABLE IF NOT EXISTS` ensures it won't error if tables are already present.

**If you get permission errors:** Make sure your Supabase role has permissions to create tables. Contact Supabase support if needed.

**For development testing:** Use the test data in the SQL schema comments to populate sample properties.
