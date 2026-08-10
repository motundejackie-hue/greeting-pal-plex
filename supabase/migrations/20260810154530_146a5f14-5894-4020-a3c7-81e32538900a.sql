CREATE TABLE public.tv_hidden (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_slug text NOT NULL UNIQUE,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tv_hidden TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tv_hidden TO authenticated;
GRANT ALL ON public.tv_hidden TO service_role;
ALTER TABLE public.tv_hidden ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hidden channels" ON public.tv_hidden FOR SELECT USING (true);
CREATE POLICY "Signed-in users can hide channels" ON public.tv_hidden FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Signed-in users can restore channels" ON public.tv_hidden FOR DELETE TO authenticated USING (true);