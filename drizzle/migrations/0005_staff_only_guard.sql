CREATE OR REPLACE FUNCTION public.is_staff(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.has_role(_uid,'admin') OR public.has_role(_uid,'caregiver')
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['residents','health_observations','medical_appointments','medical_conditions','medicines','medicine_administrations','rooms','beds','resident_bed_assignments','care_settings','resident_registrations','donations']
  LOOP
    IF t NOT IN ('residents','health_observations','medical_appointments') THEN
      EXECUTE format('CREATE POLICY "Staff only read guard" ON public.%I AS RESTRICTIVE FOR SELECT TO authenticated USING (public.is_staff(auth.uid()))', t);
    END IF;
    IF t NOT IN ('resident_registrations','donations') THEN
      EXECUTE format('CREATE POLICY "Staff only insert guard" ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()))', t);
    END IF;
    EXECUTE format('CREATE POLICY "Staff only update guard" ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "Staff only delete guard" ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (public.is_staff(auth.uid()))', t);
  END LOOP;
END $$;

CREATE POLICY "Staff or linked family read guard" ON public.residents AS RESTRICTIVE FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.family_access fa WHERE fa.resident_id = residents.id AND fa.user_id = auth.uid()));
CREATE POLICY "Staff or linked family read guard" ON public.health_observations AS RESTRICTIVE FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.family_access fa WHERE fa.resident_id = health_observations.resident_id AND fa.user_id = auth.uid()));
CREATE POLICY "Staff or linked family read guard" ON public.medical_appointments AS RESTRICTIVE FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.family_access fa WHERE fa.resident_id = medical_appointments.resident_id AND fa.user_id = auth.uid()));