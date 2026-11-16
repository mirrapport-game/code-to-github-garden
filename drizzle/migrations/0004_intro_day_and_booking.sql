CREATE TABLE public.intro_day_sessions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL DEFAULT auth.uid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 card_id text NOT NULL,
 partner_harshness text CHECK (partner_harshness IN ('soft','medium','hard')),
 partner_line text NOT NULL DEFAULT '',
 chosen_feelings text[] NOT NULL DEFAULT '{}',
 feelings_chosen boolean NOT NULL DEFAULT false,
 release_method text CHECK (release_method IN ('forest','mountain','toilet')),
 setup_answers jsonb NOT NULL DEFAULT '["","","",""]'::jsonb,
 new_dialogue_first_message text NOT NULL DEFAULT '',
 dialogue jsonb NOT NULL DEFAULT '[]'::jsonb,
 summary_text text NOT NULL DEFAULT '',
 step integer NOT NULL DEFAULT 1 CHECK (step BETWEEN 1 AND 7),
 completed_at timestamptz,
 chosen_qualities text[] NOT NULL DEFAULT '{}',
 chosen_shadows text[] NOT NULL DEFAULT '{}',
 reflection_stage text NOT NULL DEFAULT 'feelings' CHECK (reflection_stage IN ('feelings','qualities','shadow')),
 emotion_intensity integer CONSTRAINT intro_emotion_intensity_range CHECK (emotion_intensity BETWEEN 1 AND 10),
 skill_text text NOT NULL DEFAULT '',
 skill_dialogue jsonb NOT NULL DEFAULT '[]',
 request_reflection jsonb NOT NULL DEFAULT '{}',
 CHECK (cardinality(chosen_feelings) <= 3)
);
GRANT SELECT, INSERT, UPDATE ON public.intro_day_sessions TO authenticated;
GRANT ALL ON public.intro_day_sessions TO service_role;
ALTER TABLE public.intro_day_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY intro_day_read ON public.intro_day_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY intro_day_insert ON public.intro_day_sessions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY intro_day_update ON public.intro_day_sessions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX intro_day_owner_created ON public.intro_day_sessions(user_id, created_at DESC);
CREATE TABLE public.booking_requests (id uuid PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(), name text NOT NULL, phone text NOT NULL, kind text NOT NULL CHECK (kind IN ('live','online','consultation')), notification_status text NOT NULL DEFAULT 'pending', notification_warning text NOT NULL DEFAULT '');
GRANT SELECT ON public.booking_requests TO authenticated;
GRANT ALL ON public.booking_requests TO service_role;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_read_booking_requests ON public.booking_requests FOR SELECT TO authenticated USING (public.is_game_admin());