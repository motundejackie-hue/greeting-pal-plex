CREATE TABLE IF NOT EXISTS public.tv_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_slug TEXT NOT NULL UNIQUE,
  name TEXT,
  url TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'direct',
  fails INTEGER NOT NULL DEFAULT 0,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tv_streams TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.tv_streams TO anon;
GRANT ALL ON public.tv_streams TO service_role;

ALTER TABLE public.tv_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read working streams" ON public.tv_streams FOR SELECT USING (true);
CREATE POLICY "Anyone can record a working stream" ON public.tv_streams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can refresh a working stream" ON public.tv_streams FOR UPDATE USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS tv_streams_slug_idx ON public.tv_streams (channel_slug);