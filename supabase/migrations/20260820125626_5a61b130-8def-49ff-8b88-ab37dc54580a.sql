REVOKE ALL ON FUNCTION public.ensure_staff_account(text) FROM anon;
REVOKE ALL ON FUNCTION public.list_staff() FROM anon;
REVOKE ALL ON FUNCTION public.set_staff_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;