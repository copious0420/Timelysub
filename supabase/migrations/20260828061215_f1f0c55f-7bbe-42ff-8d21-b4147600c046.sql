ALTER TABLE public.saved_schedules
  ADD CONSTRAINT saved_schedules_user_day_key UNIQUE (user_id, day);