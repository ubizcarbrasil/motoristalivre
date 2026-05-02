REVOKE EXECUTE ON FUNCTION public.process_recruitment_signup() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.process_recruitment_monthly() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public._ensure_driver_wallet(uuid, uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.process_recruitment_monthly() TO service_role;