CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'instructor', 'student', 'customer');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  account_type text NOT NULL DEFAULT 'customer' CHECK (account_type IN ('customer', 'student')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "People can read their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "People can create their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "People can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE POLICY "People can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 140),
  category text NOT NULL DEFAULT 'Digital solutions' CHECK (char_length(category) BETWEEN 1 AND 80),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
  deliverables text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published services are public" ON public.services FOR SELECT TO anon, authenticated USING (is_published OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  category text NOT NULL DEFAULT 'Technology' CHECK (char_length(category) BETWEEN 1 AND 80),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 3000),
  level text NOT NULL DEFAULT 'Beginner' CHECK (char_length(level) <= 40),
  duration text NOT NULL DEFAULT '',
  price_kes integer CHECK (price_kes IS NULL OR price_kes >= 0),
  is_free boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published courses are public" ON public.courses FOR SELECT TO anon, authenticated USING (is_published OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  category text NOT NULL DEFAULT 'Websites' CHECK (char_length(category) BETWEEN 1 AND 80),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 3000),
  technologies text[] NOT NULL DEFAULT '{}',
  project_url text,
  cover_image_url text,
  is_demonstration boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  completed_on date,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.portfolio_projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.portfolio_projects TO authenticated;
GRANT ALL ON public.portfolio_projects TO service_role;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published portfolio is public" ON public.portfolio_projects FOR SELECT TO anon, authenticated USING (is_published OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins manage portfolio" ON public.portfolio_projects FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.service_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) <= 255),
  phone text NOT NULL DEFAULT '' CHECK (char_length(phone) <= 40),
  service_requested text NOT NULL DEFAULT '' CHECK (char_length(service_requested) <= 160),
  message text NOT NULL CHECK (char_length(message) BETWEEN 5 AND 4000),
  status text NOT NULL DEFAULT 'Enquiry Received' CHECK (status IN ('Enquiry Received', 'Under Review', 'Quotation Prepared', 'Awaiting Customer Approval', 'Payment Pending', 'Project Started', 'In Progress', 'Awaiting Customer Review', 'Completed', 'Cancelled')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.service_enquiries TO anon;
GRANT SELECT, INSERT ON public.service_enquiries TO authenticated;
GRANT UPDATE ON public.service_enquiries TO authenticated;
GRANT ALL ON public.service_enquiries TO service_role;
ALTER TABLE public.service_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors can send enquiries" ON public.service_enquiries FOR INSERT TO anon, authenticated WITH CHECK (status = 'Enquiry Received' AND admin_notes IS NULL AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "Customers can read their enquiries" ON public.service_enquiries FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can update enquiries" ON public.service_enquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, account_type)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), split_part(COALESCE(NEW.email, ''), '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    CASE WHEN NEW.raw_user_meta_data ->> 'account_type' = 'student' THEN 'student' ELSE 'customer' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_mobix_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();