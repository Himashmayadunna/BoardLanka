-- ========================================================
-- BoardLanka Full Database Schema (Marketplace + SaaS)
-- Run this inside your Supabase SQL Editor
-- ========================================================

-- 1. Public Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('buyer', 'seller', 'admin', 'landlord', 'manager', 'tenant')),
  role TEXT DEFAULT 'landlord' CHECK (role IN ('admin', 'owner', 'manager', 'staff', 'tenant')),
  bio TEXT,
  profile_picture TEXT,
  marketing_updates BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE USING ( auth.uid() = id );

-- 2. Organizations Table (For Multi-Landlord & Real Estate Companies)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'business', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view their organization."
  ON public.organizations FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

CREATE POLICY "Owners can create organizations."
  ON public.organizations FOR INSERT
  WITH CHECK ( auth.uid() = owner_id );

CREATE POLICY "Owners can update their organization."
  ON public.organizations FOR UPDATE
  USING ( auth.uid() = owner_id );

-- 3. Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
  id BIGSERIAL PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  area TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('room', 'annex', 'house', 'land', 'commercial', 'apartment')),
  price DECIMAL(12, 2) NOT NULL,
  advance_payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
  bedrooms INT NOT NULL DEFAULT 1,
  bathrooms INT NOT NULL DEFAULT 1,
  size TEXT NOT NULL DEFAULT '0',
  description TEXT NOT NULL,
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  phone TEXT NOT NULL,
  whatsapp TEXT,
  available BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Properties are viewable by everyone."
  ON public.properties FOR SELECT USING ( true );

CREATE POLICY "Sellers can insert their own properties."
  ON public.properties FOR INSERT WITH CHECK ( auth.uid() = seller_id );

CREATE POLICY "Sellers can update their own properties."
  ON public.properties FOR UPDATE USING ( auth.uid() = seller_id );

CREATE POLICY "Sellers can delete their own properties."
  ON public.properties FOR DELETE USING ( auth.uid() = seller_id );

CREATE INDEX IF NOT EXISTS idx_properties_seller_id ON public.properties(seller_id);
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_available ON public.properties(available);
CREATE INDEX IF NOT EXISTS idx_properties_feed ON public.properties(available, created_at DESC);

-- 4. Units Table (Multi-Unit Management)
CREATE TABLE IF NOT EXISTS public.units (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  unit_number TEXT NOT NULL,
  unit_type TEXT DEFAULT 'Standard' CHECK (unit_type IN ('Standard', 'Deluxe', 'Studio', 'Master Bedroom', 'Annex Unit', 'Floor Penthouse')),
  bedrooms INT NOT NULL DEFAULT 1,
  bathrooms INT NOT NULL DEFAULT 1,
  monthly_rent DECIMAL(12, 2) NOT NULL,
  security_deposit DECIMAL(12, 2) NOT NULL DEFAULT 0,
  size_sqft INT DEFAULT 350,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public units are viewable by everyone."
  ON public.units FOR SELECT USING ( true );

CREATE POLICY "Landlords can manage units for their properties."
  ON public.units FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE public.properties.id = units.property_id
        AND public.properties.seller_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_units_property_id ON public.units(property_id);
CREATE INDEX IF NOT EXISTS idx_units_status ON public.units(status);

-- 5. Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE SET NULL,
  unit_id BIGINT REFERENCES public.units(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  nic_or_passport TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  occupation TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'past', 'blacklisted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can view their tenants."
  ON public.tenants FOR SELECT
  USING ( auth.uid() = landlord_id OR auth.uid() = user_id );

CREATE POLICY "Landlords can manage their tenants."
  ON public.tenants FOR ALL
  USING ( auth.uid() = landlord_id );

CREATE INDEX IF NOT EXISTS idx_tenants_landlord_id ON public.tenants(landlord_id);
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON public.tenants(property_id);

-- 6. Leases Table
CREATE TABLE IF NOT EXISTS public.leases (
  id BIGSERIAL PRIMARY KEY,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  unit_id BIGINT REFERENCES public.units(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(12, 2) NOT NULL,
  security_deposit DECIMAL(12, 2) NOT NULL DEFAULT 0,
  payment_frequency TEXT DEFAULT 'monthly' CHECK (payment_frequency IN ('monthly', 'quarterly', 'biannual', 'yearly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'expired', 'terminated', 'renewed')),
  terms TEXT,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords and tenants can view leases."
  ON public.leases FOR SELECT
  USING (
    auth.uid() = landlord_id OR
    EXISTS (
      SELECT 1 FROM public.tenants WHERE public.tenants.id = leases.tenant_id AND public.tenants.user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can manage leases."
  ON public.leases FOR ALL
  USING ( auth.uid() = landlord_id );

CREATE INDEX IF NOT EXISTS idx_leases_landlord_id ON public.leases(landlord_id);
CREATE INDEX IF NOT EXISTS idx_leases_tenant_id ON public.leases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON public.leases(status);

-- 7. Rent Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id BIGSERIAL PRIMARY KEY,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  unit_id BIGINT REFERENCES public.units(id) ON DELETE SET NULL,
  lease_id BIGINT REFERENCES public.leases(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  payment_method TEXT DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'cash', 'credit_card', 'online_gateway', 'cheque')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'partial', 'cancelled')),
  reference_number TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords and tenants can view payments."
  ON public.payments FOR SELECT
  USING (
    auth.uid() = landlord_id OR
    EXISTS (
      SELECT 1 FROM public.tenants WHERE public.tenants.id = payments.tenant_id AND public.tenants.user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can manage payments."
  ON public.payments FOR ALL
  USING ( auth.uid() = landlord_id );

CREATE INDEX IF NOT EXISTS idx_payments_landlord_id ON public.payments(landlord_id);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON public.payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- 8. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  unit_id BIGINT REFERENCES public.units(id) ON DELETE SET NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  utility_charges DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  issued_date DATE DEFAULT CURRENT_DATE NOT NULL,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue', 'cancelled')),
  line_items JSONB DEFAULT '[]'::JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords and tenants can view invoices."
  ON public.invoices FOR SELECT
  USING (
    auth.uid() = landlord_id OR
    EXISTS (
      SELECT 1 FROM public.tenants WHERE public.tenants.id = invoices.tenant_id AND public.tenants.user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can manage invoices."
  ON public.invoices FOR ALL
  USING ( auth.uid() = landlord_id );

CREATE INDEX IF NOT EXISTS idx_invoices_landlord_id ON public.invoices(landlord_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- 9. Maintenance Requests Table
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id BIGSERIAL PRIMARY KEY,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id BIGINT REFERENCES public.units(id) ON DELETE SET NULL,
  property_title TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('plumbing', 'electrical', 'structural', 'appliance', 'painting', 'general', 'other')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  estimated_cost DECIMAL(10, 2) DEFAULT 0,
  actual_cost DECIMAL(10, 2) DEFAULT 0,
  assigned_to TEXT,
  scheduled_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reported problems" ON public.maintenance_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Landlords can view and manage problems for their properties" ON public.maintenance_requests
  FOR ALL USING (
    auth.uid() = user_id OR
    auth.uid() = landlord_id OR
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE public.properties.id = maintenance_requests.property_id
        AND public.properties.seller_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_maintenance_user_id ON public.maintenance_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_property_id ON public.maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON public.maintenance_requests(priority);

-- 10. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id BIGSERIAL PRIMARY KEY,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  unit_id BIGINT REFERENCES public.units(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('maintenance', 'utilities', 'taxes', 'insurance', 'cleaning', 'management_fee', 'mortgage', 'other')),
  title TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  expense_date DATE NOT NULL,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can manage their expenses."
  ON public.expenses FOR ALL USING ( auth.uid() = landlord_id );

CREATE INDEX IF NOT EXISTS idx_expenses_landlord_id ON public.expenses(landlord_id);
CREATE INDEX IF NOT EXISTS idx_expenses_property_id ON public.expenses(property_id);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rent_due', 'rent_overdue', 'lease_expiring', 'maintenance_update', 'invoice_new', 'booking_inquiry', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their notifications."
  ON public.notifications FOR ALL USING ( auth.uid() = user_id );

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);

-- 12. Subscriptions & Plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_lkr DECIMAL(10, 2) NOT NULL,
  max_properties INT NOT NULL,
  max_units INT NOT NULL,
  max_team_members INT NOT NULL,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  popular BOOLEAN DEFAULT FALSE
);

INSERT INTO public.subscription_plans (id, name, price_lkr, max_properties, max_units, max_team_members, features, popular)
VALUES
  ('starter', 'Starter', 4500, 3, 10, 1, ARRAY['Up to 3 Properties', 'Up to 10 Units', 'Tenant Management', 'Rent Payment Tracking', 'Basic Maintenance Tickets', 'Email Reminders'], false),
  ('professional', 'Professional', 12500, 15, 60, 5, ARRAY['Up to 15 Properties', 'Up to 60 Units', 'Full Financial Invoicing', 'Automatic Reminders via Resend', 'Advanced Maintenance Kanban', 'Reports & PDF/CSV Export', 'Priority Support'], true),
  ('business', 'Business', 28000, 50, 250, 15, ARRAY['Up to 50 Properties', 'Up to 250 Units', 'Multi-Landlord Organization', 'Team Roles & Staff Permissions', 'Custom Branding Invoices', 'Full Analytics Dashboard', 'Dedicated Account Manager'], false),
  ('enterprise', 'Enterprise', 65000, 9999, 99999, 100, ARRAY['Unlimited Properties', 'Unlimited Units', 'Custom API Integrations', 'Multi-Branch Management', 'Custom SLA', '24/7 Dedicated Support', 'White-label Portal'], false)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_id TEXT REFERENCES public.subscription_plans(id) DEFAULT 'starter',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their subscription."
  ON public.subscriptions FOR SELECT USING ( auth.uid() = user_id );
