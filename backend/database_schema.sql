-- Run this inside your Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  account_type VARCHAR(50) CHECK (account_type IN ('buyer', 'seller', 'admin')) NOT NULL,
  bio TEXT,
  profile_picture TEXT,
  marketing_updates BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id BIGSERIAL PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  area VARCHAR(100) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('room', 'annex', 'house', 'land')),
  price DECIMAL(10, 2) NOT NULL,
  advance_payment DECIMAL(10, 2) NOT NULL,
  bedrooms INT DEFAULT 1,
  bathrooms INT DEFAULT 1,
  size VARCHAR(100) NOT NULL,
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  phone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20),
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id BIGINT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, property_id)
);

-- Create a table for property problems (reports/issues)
CREATE TABLE IF NOT EXISTS public.property_problems (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE,
  property_title VARCHAR(255),
  issue_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_seller_id ON public.properties(seller_id);
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_available ON public.properties(available);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON public.favorites(property_id);
CREATE INDEX IF NOT EXISTS idx_property_problems_user_id ON public.property_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_property_problems_property_id ON public.property_problems(property_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_problems ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for properties
CREATE POLICY "Anyone can view available properties" ON public.properties
  FOR SELECT USING (available = true);

CREATE POLICY "Sellers can view their own properties" ON public.properties
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert properties" ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own properties" ON public.properties
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own properties" ON public.properties
  FOR DELETE USING (auth.uid() = seller_id);

-- Create RLS policies for favorites
CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for property problems
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

