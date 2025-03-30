
-- Create bookings table to track counseling appointments
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  booking_type_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  time_slot_id TEXT NOT NULL,
  timezone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  tidycal_booking_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for the edge function)
CREATE POLICY "Allow inserts" ON public.bookings
  FOR INSERT TO anon
  WITH CHECK (true);
  
-- Create policy to allow anyone to select (for verification)
CREATE POLICY "Allow selects" ON public.bookings
  FOR SELECT TO anon
  USING (true);

-- Create policy to allow anyone to update (for the edge function)
CREATE POLICY "Allow updates" ON public.bookings
  FOR UPDATE TO anon
  USING (true);
