-- Run this inside your Supabase SQL Editor

-- Create a table for public profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('buyer', 'seller', 'admin')),
  bio TEXT,
  profile_picture TEXT,
  marketing_updates BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Create a table for properties
CREATE TABLE IF NOT EXISTS public.properties (
  id BIGSERIAL PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  area TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('room', 'annex', 'house', 'land')),
  price DECIMAL(10, 2) NOT NULL,
  advance_payment DECIMAL(10, 2) NOT NULL,
  bedrooms INT NOT NULL DEFAULT 1,
  bathrooms INT NOT NULL DEFAULT 1,
  size TEXT NOT NULL,
  description TEXT NOT NULL,
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  phone TEXT NOT NULL,
  whatsapp TEXT,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security for properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policies for properties
CREATE POLICY "Properties are viewable by everyone."
  ON public.properties FOR SELECT
  USING ( true );

CREATE POLICY "Sellers can insert their own properties."
  ON public.properties FOR INSERT
  WITH CHECK ( auth.uid() = seller_id );

CREATE POLICY "Sellers can update their own properties."
  ON public.properties FOR UPDATE
  USING ( auth.uid() = seller_id );

CREATE POLICY "Sellers can delete their own properties."
  ON public.properties FOR DELETE
  USING ( auth.uid() = seller_id );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS properties_seller_id_idx ON public.properties(seller_id);
CREATE INDEX IF NOT EXISTS properties_type_idx ON public.properties(type);
CREATE INDEX IF NOT EXISTS properties_area_idx ON public.properties(area);

-- Create a table for property problems (reports/issues)
CREATE TABLE IF NOT EXISTS public.property_problems (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE,
  property_title TEXT,
  issue_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security for property problems
ALTER TABLE public.property_problems ENABLE ROW LEVEL SECURITY;

-- Create policies for property problems
CREATE POLICY "Users can view their own reported problems" ON public.property_problems
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Landlords can view problems for their properties" ON public.property_problems
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE public.properties.id = property_problems.property_id
        AND public.properties.seller_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own problems" ON public.property_problems
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own problems or landlord can update them" ON public.property_problems
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE public.properties.id = property_problems.property_id
        AND public.properties.seller_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_properties_seller_id ON public.properties(seller_id);
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_available ON public.properties(available);
CREATE INDEX IF NOT EXISTS idx_properties_feed ON public.properties(available, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_type_feed ON public.properties(type, available, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_problems_user_id ON public.property_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_property_problems_property_id ON public.property_problems(property_id);

-- ========================================================
-- DEVELOPMENT TESTING & DUMMY DATA SEEDING
-- ========================================================
-- The easiest way to seed/clear dummy data is using the "Demo Sandbox" 
-- control panel located directly on your user Profile page in the Web UI.
-- This automatically connects properties and problem reports to your active 
-- authenticated user ID, making all features immediately testable.
--
-- Alternatively, if you want to insert a dummy listing directly via the 
-- SQL Editor, you can use the command below (replace USER_UUID with a valid 
-- UUID from your auth.users table):
--
-- INSERT INTO public.properties (
--   seller_id, title, location, area, type, price, advance_payment, 
--   bedrooms, bathrooms, size, description, amenities, images, phone
-- ) VALUES (
--   'USER_UUID', 
--   '[DUMMY] Cozy Single Room in Katunayake', 
--   'Katunayake, Gampaha', 
--   'katunayaka', 
--   'room', 
--   9500.00, 
--   20000.00, 
--   1, 
--   1, 
--   '300', 
--   'Comfortable single room near airport. [DUMMY]', 
--   ARRAY['Bed', 'Fan', 'Wi-Fi'], 
--   ARRAY['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800'], 
--   '+94 77 555 4433'
-- );

