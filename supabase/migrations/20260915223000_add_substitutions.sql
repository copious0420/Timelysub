CREATE TABLE public.substitutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id TEXT NOT NULL,
  date DATE NOT NULL,
  period INTEGER NOT NULL,
  class_name TEXT NOT NULL,
  original_teacher_id TEXT NOT NULL,
  original_teacher_name TEXT NOT NULL,
  substitute_teacher_id TEXT,
  substitute_teacher_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'overridden')),
  created_by UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, date, period, class_name)
);

CREATE INDEX substitutions_student_lookup_idx
  ON public.substitutions (school_id, date, class_name, period);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.substitutions TO authenticated;

ALTER TABLE public.substitutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage substitutions for their school"
  ON public.substitutions
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid()
    AND school_id = (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
  )
  WITH CHECK (
    created_by = auth.uid()
    AND school_id = (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
  );

CREATE TRIGGER substitutions_updated_at
  BEFORE UPDATE ON public.substitutions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.fetch_student_substitutions(
  requested_school_id TEXT,
  requested_date DATE
)
RETURNS SETOF public.substitutions
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.substitutions
  WHERE school_id = upper(trim(requested_school_id))
    AND date = requested_date
    AND status IN ('assigned', 'overridden')
    AND substitute_teacher_id IS NOT NULL
  ORDER BY period, class_name;
$$;

GRANT EXECUTE ON FUNCTION public.fetch_student_substitutions(TEXT, DATE) TO anon, authenticated;
