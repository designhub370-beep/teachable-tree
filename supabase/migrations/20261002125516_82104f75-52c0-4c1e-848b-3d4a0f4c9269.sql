CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_date date,
  status text NOT NULL DEFAULT 'upcoming',
  description text NOT NULL DEFAULT '',
  class_range text NOT NULL DEFAULT '',
  age_rule text NOT NULL DEFAULT '',
  rules text NOT NULL DEFAULT '',
  photo_paths text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  class_name text NOT NULL DEFAULT '',
  age int,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.event_registrations TO service_role;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  photo_path text NOT NULL DEFAULT '',
  qualification text NOT NULL DEFAULT '',
  subjects text NOT NULL DEFAULT '',
  sections jsonb NOT NULL DEFAULT '[]',
  sort_order int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.teachers TO service_role;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  phone text NOT NULL,
  class_name text NOT NULL DEFAULT '',
  parent_name text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  contacted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admissions TO service_role;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;