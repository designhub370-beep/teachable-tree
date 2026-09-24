CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'School',
  subjects text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '',
  sale_label text NOT NULL DEFAULT '',
  original_price integer,
  sale_price integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.classes TO anon, authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view classes" ON public.classes FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  class_name text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'pdf',
  description text NOT NULL DEFAULT '',
  file_path text NOT NULL,
  file_url text NOT NULL,
  uploaded_by text NOT NULL DEFAULT 'teacher',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.materials TO anon, authenticated;
GRANT ALL ON public.materials TO service_role;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view materials" ON public.materials FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.classes (name, category, subjects, duration, sale_label, original_price, sale_price, sort_order) VALUES
('Class 9', 'School', 'Maths, Science', '1 Year', 'Early Bird Offer', 15000, 12000, 1),
('Class 10', 'School', 'Maths, Science', '1 Year', 'Board Special', 18000, 14500, 2),
('Class 11 Science', 'School', 'Physics, Chemistry, Mathematics, English', '1 Year', 'Admission Offer', 24000, 19999, 3),
('Class 12 Science', 'School', 'Physics, Chemistry, Mathematics, English', '1 Year', 'Admission Offer', 26000, 21999, 4),
('Class 11 Commerce', 'School', 'Accountancy, Economics, Mathematics, English', '1 Year', '', NULL, 18000, 5),
('Class 12 Commerce', 'School', 'Accountancy, Economics, Mathematics, English', '1 Year', '', NULL, 20000, 6),
('Class 11-12 Arts', 'School', 'Economics, English, History, Pol. Science', '1 Year', '', NULL, 16000, 7),
('SSC', 'Competitive', 'Maths, Reasoning, English, GK', '6 Months', 'Limited Seats', 14000, 11000, 10),
('CTET', 'Competitive', 'Child Pedagogy, Maths, EVS, English', '4 Months', '', NULL, 9000, 11),
('UPTET', 'Competitive', 'Child Pedagogy, Maths, Hindi, English', '4 Months', '', NULL, 9000, 12),
('DSSSB', 'Competitive', 'Subject + General Paper', '6 Months', '', NULL, 12000, 13),
('UP RET', 'Competitive', 'Subject Paper', '4 Months', '', NULL, 10000, 14),
('UPSC', 'Competitive', 'GS, CSAT, Economics', '1 Year', 'Foundation Batch', 35000, 28000, 15),
('Delhi Police', 'Competitive', 'Maths, Reasoning, GK, Computer', '4 Months', '', NULL, 8000, 16),
('UP Police', 'Competitive', 'Maths, Reasoning, Hindi, GK', '4 Months', '', NULL, 8000, 17);