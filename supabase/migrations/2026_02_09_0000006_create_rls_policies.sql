-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Allow anon key to SELECT on tenants (for realtime subscriptions)
CREATE POLICY "Allow anon select on tenants"
  ON public.tenants
  FOR SELECT
  TO anon
  USING (true);

-- Allow anon key to SELECT on categories (for realtime subscriptions)
CREATE POLICY "Allow anon select on categories"
  ON public.categories
  FOR SELECT
  TO anon
  USING (true);
