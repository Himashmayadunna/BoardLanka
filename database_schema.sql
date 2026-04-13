-- Run this inside your Supabase SQL Editor

-- Create a table for public profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  marketing_updates BOOLEAN DEFAULT FALSE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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
CREATE TABLE public.properties (
  id BIGSERIAL PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  area TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('room', 'annex', 'house')),
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
CREATE INDEX properties_seller_id_idx ON public.properties(seller_id);
CREATE INDEX properties_type_idx ON public.properties(type);
CREATE INDEX properties_area_idx ON public.properties(area);
