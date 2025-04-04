-- Create a function to safely query the customers table for subscription data
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_id_param UUID)
RETURNS TABLE (
  subscription_status TEXT,
  subscription_tier TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT c.subscription_status, c.subscription_tier
  FROM public.customers c
  WHERE c.user_id = user_id_param;
END;
$$; 