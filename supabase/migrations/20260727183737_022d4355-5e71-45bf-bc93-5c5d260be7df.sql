CREATE TABLE public.tv (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country TEXT,
  categories TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  stream_url TEXT NOT NULL,
  quality TEXT,
  source TEXT,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tv TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tv TO authenticated;
GRANT ALL ON public.tv TO service_role;
ALTER TABLE public.tv ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view channels" ON public.tv FOR SELECT USING (true);
CREATE POLICY "Signed-in users can add channels" ON public.tv FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Signed-in users can edit channels" ON public.tv FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Signed-in users can remove channels" ON public.tv FOR DELETE TO authenticated USING (true);

CREATE TABLE public.tv_logos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  source TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tv_logos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tv_logos TO authenticated;
GRANT ALL ON public.tv_logos TO service_role;
ALTER TABLE public.tv_logos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view logos" ON public.tv_logos FOR SELECT USING (true);
CREATE POLICY "Signed-in users can add logos" ON public.tv_logos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Signed-in users can edit logos" ON public.tv_logos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel_slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, channel_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own favorites" ON public.favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tv_updated_at BEFORE UPDATE ON public.tv FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tv_logos_updated_at BEFORE UPDATE ON public.tv_logos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX idx_tv_country ON public.tv (country);
CREATE INDEX idx_tv_hidden ON public.tv (is_hidden);