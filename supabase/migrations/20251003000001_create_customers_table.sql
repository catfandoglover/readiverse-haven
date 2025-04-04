-- Create customers table to track Stripe customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  subscription_status TEXT,
  subscription_tier TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own customer records
CREATE POLICY "Users can view their own customer data" 
ON public.customers
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for edge functions to update customer records
CREATE POLICY "Allow edge functions to update customer records" 
ON public.customers
FOR ALL
TO service_role
USING (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS customers_user_id_idx ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS customers_stripe_customer_id_idx ON public.customers(stripe_customer_id); 