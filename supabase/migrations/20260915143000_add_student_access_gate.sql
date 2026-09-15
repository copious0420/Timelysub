ALTER TABLE public.profiles
  ADD COLUMN school_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN student_passcode TEXT NOT NULL DEFAULT '';

CREATE UNIQUE INDEX profiles_school_id_unique
  ON public.profiles (school_id)
  WHERE school_id <> '';

CREATE OR REPLACE FUNCTION public.verify_student_access(
  requested_school_id TEXT,
  requested_passcode TEXT
) RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE school_id = requested_school_id
      AND student_passcode = requested_passcode
  );
$$;

REVOKE ALL ON FUNCTION public.verify_student_access(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_student_access(TEXT, TEXT) TO anon, authenticated;
